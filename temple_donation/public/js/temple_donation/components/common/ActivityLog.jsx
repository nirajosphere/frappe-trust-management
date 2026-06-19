import React, { useState, useEffect } from "react";
import { Typography, Spin, Button, Avatar, Empty, Mentions, message, Popconfirm } from "antd";
import {
    HistoryOutlined,
    ArrowRightOutlined,
    EditOutlined,
    DeleteOutlined,
    CloseOutlined,
    CheckOutlined,
    SendOutlined,
    UndoOutlined
} from "@ant-design/icons";
import { MessageSquare, ChevronRight, ChevronDown } from "lucide-react";
import { useFrappeGetDocList } from "../../hooks/useFrappe";
import SectionCard from "./SectionCard";

const { Text } = Typography;
const { Option } = Mentions;

const ActivityLog = ({ doctype, docname }) => {
    const [timelineItems, setTimelineItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [commentText, setCommentText] = useState("");
    const [postingComment, setPostingComment] = useState(false);

    // Reply states
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [postingReply, setPostingReply] = useState(false);

    // Edit states
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState("");

    // Collapse states for audit versions
    const [expandedVersions, setExpandedVersions] = useState(new Set());

    // Collapse states for nested comment replies
    const [expandedComments, setExpandedComments] = useState(new Set());

    const toggleExpandComment = (name) => {
        const next = new Set(expandedComments);
        if (next.has(name)) {
            next.delete(name);
        } else {
            next.add(name);
        }
        setExpandedComments(next);
    };

    // Collapse states for top-level comment card bodies
    const [expandedCommentCards, setExpandedCommentCards] = useState(new Set());

    const toggleExpandCommentCard = (name) => {
        const next = new Set(expandedCommentCards);
        if (next.has(name)) {
            next.delete(name);
        } else {
            next.add(name);
        }
        setExpandedCommentCards(next);
    };

    // Fetch user list for mentions auto-complete
    const { data: usersList } = useFrappeGetDocList("User", { 
        fields: ["name", "first_name", "last_name"],
        limit: 200
    });

    const currentUser = typeof frappe !== "undefined" ? frappe.session.user : "";

    const fetchTimelineData = async (reset = false) => {
        if (!docname) return;
        setLoading(true);

        try {
            const limitStart = reset ? 0 : page * 5;

            // 1. Fetch Version history records
            const verRes = await fetch(
                `/api/resource/Version?filters=${encodeURIComponent(JSON.stringify([
                    ["ref_doctype", "=", doctype],
                    ["docname", "=", docname]
                ]))}&fields=${encodeURIComponent(JSON.stringify(["*"]))}&order_by=creation desc&limit_start=${limitStart}&limit_page_length=5`
            );
            const verJson = await verRes.json();
            const fetchedVersions = (verJson.data || []).map(item => ({
                ...item,
                isVersion: true,
                timestamp: new Date(item.creation).getTime()
            }));

            // 2. Fetch Comments
            const commRes = await fetch(
                `/api/resource/Comment?filters=${encodeURIComponent(JSON.stringify([
                    ["reference_doctype", "=", doctype],
                    ["reference_name", "=", docname],
                    ["comment_type", "=", "Comment"]
                ]))}&fields=${encodeURIComponent(JSON.stringify(["*"]))}&order_by=creation desc`
            );
            const commJson = await commRes.json();
            const fetchedComments = (commJson.data || []).map(item => ({
                ...item,
                isComment: true,
                timestamp: new Date(item.creation).getTime()
            }));

            // Merge and sort chronologically (newest first)
            const combined = [...fetchedVersions, ...fetchedComments].sort((a, b) => b.timestamp - a.timestamp);

            if (reset) {
                setTimelineItems(combined);
                setPage(1);
            } else {
                setTimelineItems(prev => {
                    const allItems = [...prev, ...combined];
                    // Deduplicate items based on type and unique record name
                    const unique = [];
                    const seen = new Set();
                    for (const item of allItems) {
                        const key = `${item.isVersion ? "v" : "c"}-${item.name}`;
                        if (!seen.has(key)) {
                            seen.add(key);
                            unique.push(item);
                        }
                    }
                    return unique.sort((a, b) => b.timestamp - a.timestamp);
                });
                setPage(prev => prev + 1);
            }
        } catch (err) {
            console.error("Error loading ActivityLog timeline:", err);
        }
        setLoading(false);
    };

    // Load initial timeline data on load/change
    useEffect(() => {
        fetchTimelineData(true);
    }, [doctype, docname]);

    if (!docname) return null;

    // Handle token-based backspace deletion for mentions
    const handleMentionsKeyDown = (e, text, setText) => {
        if (e.key === "Backspace") {
            const target = e.target;
            const start = target.selectionStart;
            const end = target.selectionEnd;
            if (start === end && start > 0) {
                const textBefore = text.slice(0, start);
                // Check if last word before cursor starts with @
                const lastSpace = textBefore.lastIndexOf(" ");
                const lastWord = textBefore.slice(lastSpace + 1);
                if (lastWord.startsWith("@")) {
                    e.preventDefault();
                    const newText = text.slice(0, lastSpace + 1) + text.slice(start);
                    setText(newText);
                    // Reset selection position after state update
                    setTimeout(() => {
                        target.selectionStart = target.selectionEnd = lastSpace + 1;
                    }, 0);
                }
            }
        }
    };

    // Post a new comment
    const handlePostComment = () => {
        if (!commentText.trim()) return;
        setPostingComment(true);

        if (typeof frappe === "undefined") {
            setPostingComment(false);
            return;
        }

        frappe.call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "Comment",
                    comment_type: "Comment",
                    reference_doctype: doctype,
                    reference_name: docname,
                    content: commentText,
                    comment_by: currentUser
                }
            },
            callback: () => {
                setPostingComment(false);
                setCommentText("");
                message.success("Comment added successfully");
                fetchTimelineData(true);
            },
            error: () => setPostingComment(false)
        });
    };

    // Post a nested reply (grouped under parent top-level comment)
    const handlePostReply = (parentId) => {
        if (!replyText.trim()) return;
        setPostingReply(true);

        if (typeof frappe === "undefined") {
            setPostingReply(false);
            return;
        }

        frappe.call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "Comment",
                    comment_type: "Comment",
                    reference_doctype: doctype,
                    reference_name: docname,
                    subject: parentId, // Always point thread to top-level parent ID
                    content: replyText,
                    comment_by: currentUser
                }
            },
            callback: () => {
                setPostingReply(false);
                setReplyText("");
                setActiveReplyId(null);
                message.success("Reply added");
                fetchTimelineData(true);
            },
            error: () => setPostingReply(false)
        });
    };

    // Delete a user comment
    const handleDeleteComment = (name) => {
        if (typeof frappe === "undefined") return;

        frappe.call({
            method: "frappe.client.delete",
            args: { doctype: "Comment", name: name },
            callback: () => {
                message.success("Comment deleted");
                fetchTimelineData(true);
            }
        });
    };

    // Update comment body content
    const handleUpdateComment = (name) => {
        if (!editingText.trim()) return;
        if (typeof frappe === "undefined") return;

        frappe.call({
            method: "frappe.client.set_value",
            args: {
                doctype: "Comment",
                name: name,
                fieldname: { content: editingText }
            },
            callback: () => {
                message.success("Comment updated");
                setEditingCommentId(null);
                setEditingText("");
                fetchTimelineData(true);
            }
        });
    };

    // Format content and highlight mentions with clickable navigation
    const formatCommentContent = (content) => {
        if (!content) return "";
        const words = content.split(/(\s+)/);
        return words.map((word, idx) => {
            if (word.startsWith("@")) {
                const username = word.substring(1);
                return (
                    <span 
                        key={idx} 
                        onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/app/temple-donation/users/edit/${encodeURIComponent(username)}`;
                        }}
                        style={{ 
                            color: "#2563eb", 
                            fontWeight: 600, 
                            cursor: "pointer",
                            textDecoration: "underline"
                        }}
                    >
                        {word}
                    </span>
                );
            }
            return word;
        });
    };

    // Toggle expansion of version details
    const toggleExpandVersion = (name) => {
        const next = new Set(expandedVersions);
        if (next.has(name)) {
            next.delete(name);
        } else {
            next.add(name);
        }
        setExpandedVersions(next);
    };

    // Auto-suggest mention users mapped array
    const mentionOptions = (usersList || []).map(u => ({
        value: u.name,
        label: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.name
    }));

    const loadMoreButton = timelineItems?.length >= 5 && (
        <Button
            size="small"
            type="text"
            onClick={() => fetchTimelineData(false)}
            loading={loading}
            style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#4b5563",
                padding: "0 8px",
                height: "24px"
            }}
        >
            Load More History
        </Button>
    );

    // Filter to display only top-level items in the main timeline loop
    const displayItems = timelineItems.filter(item => {
        if (item.isVersion) return true;
        return !item.subject || !timelineItems.some(p => p.name === item.subject);
    });

    const renderCommentCard = (c, isReply = false, parentId = null) => {
        const isCommentOwner = currentUser === c.owner;
        const isEditing = editingCommentId === c.name;

        return (
            <div key={c.name} style={{ display: "flex", gap: "12px", position: "relative" }}>
                
                {/* User avatar for comments/replies inside cards */}
                {isReply && (
                    <div style={{ zIndex: 2, flexShrink: 0 }}>
                        <Avatar
                            size={22}
                            style={{
                                backgroundColor: "#71717a",
                                color: "#ffffff",
                                fontWeight: 700,
                                fontSize: "9px"
                            }}
                        >
                            {(c.owner || "U").charAt(0).toUpperCase()}
                        </Avatar>
                    </div>
                )}

                {/* Comment Card Body */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    
                    {/* Header Meta */}
                    <div 
                        onClick={() => !isReply && toggleExpandCommentCard(c.name)}
                        style={{ 
                            display: "flex", 
                            flexWrap: "wrap", 
                            alignItems: "center", 
                            gap: "6px", 
                            marginBottom: "4px",
                            cursor: !isReply ? "pointer" : "default",
                            userSelect: "none"
                        }}
                    >
                        <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#18181b" }}>
                            {c.owner}
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: 500, color: "#71717a" }}>
                            {isReply ? "replied" : "commented"}
                        </span>
                        
                        {!isReply && (
                            expandedCommentCards.has(c.name) ? (
                                <ChevronDown size={11} style={{ color: "#71717a", marginLeft: "2px" }} />
                            ) : (
                                <ChevronRight size={11} style={{ color: "#71717a", marginLeft: "2px" }} />
                            )
                        )}

                        <span style={{ fontSize: "11px", color: "#a1a1aa", marginLeft: "auto", fontWeight: 500 }}>
                            {new Date(c.creation).toLocaleString()}
                        </span>
                    </div>

                    {/* Comment Content Box */}
                    {(isReply || expandedCommentCards.has(c.name)) && (
                        <div style={{ backgroundColor: "#fcfcfd", border: "1px solid #e4e4e7", borderRadius: "8px", padding: "10px" }}>
                        {isEditing ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <Mentions
                                    value={editingText}
                                    onChange={setEditingText}
                                    onKeyDown={(e) => handleMentionsKeyDown(e, editingText, setEditingText)}
                                    rows={2}
                                    style={{ borderRadius: "6px", fontSize: "12px" }}
                                >
                                    {mentionOptions.map(opt => (
                                        <Option key={opt.value} value={opt.value}>
                                            {opt.label} ({opt.value})
                                        </Option>
                                    ))}
                                </Mentions>
                                <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                                    <Button size="small" icon={<CloseOutlined />} onClick={() => setEditingCommentId(null)}>Cancel</Button>
                                    <Button size="small" type="primary" icon={<CheckOutlined />} style={{ backgroundColor: "#18181b", borderColor: "#18181b" }} onClick={() => handleUpdateComment(c.name)}>Update</Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                                    <span style={{ fontSize: "13px", color: "#27272a", whiteSpace: "pre-wrap", lineHeight: 1.45 }}>
                                        {formatCommentContent(c.content)}
                                    </span>

                                    {/* Actions overlay */}
                                    <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
                                        {/* Reply Trigger button (available on both comments & replies, YouTube-style) */}
                                        <Button 
                                            size="small" 
                                            type="text" 
                                            icon={<UndoOutlined style={{ fontSize: "11px", color: "#71717a" }} />} 
                                            onClick={() => {
                                                setActiveReplyId(c.name);
                                                setReplyText(`@${c.owner} `);
                                            }}
                                        >
                                            <span style={{ fontSize: "10px", color: "#71717a" }}>Reply</span>
                                        </Button>

                                        {isCommentOwner && (
                                            <>
                                                <Button 
                                                    size="small" 
                                                    type="text" 
                                                    icon={<EditOutlined style={{ fontSize: "11px", color: "#71717a" }} />} 
                                                    onClick={() => { setEditingCommentId(c.name); setEditingText(c.content); }}
                                                />
                                                <Popconfirm
                                                    title="Delete Comment"
                                                    description="Delete this comment?"
                                                    onConfirm={() => handleDeleteComment(c.name)}
                                                    okText="Yes"
                                                    cancelText="No"
                                                    okButtonProps={{ danger: true }}
                                                >
                                                    <Button 
                                                        size="small" 
                                                        type="text" 
                                                        danger 
                                                        icon={<DeleteOutlined style={{ fontSize: "11px" }} />} 
                                                    />
                                                </Popconfirm>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Reply Input Box nested directly under the target comment/reply */}
                                {activeReplyId === c.name && (
                                    <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f4f4f5", display: "flex", flexDirection: "column", gap: "8px" }}>
                                        <Mentions
                                            placeholder="Write a reply..."
                                            value={replyText}
                                            onChange={setReplyText}
                                            onKeyDown={(e) => handleMentionsKeyDown(e, replyText, setReplyText)}
                                            rows={2}
                                            style={{ borderRadius: "6px", fontSize: "12px", border: "1px solid #e4e4e7", padding: "6px 10px" }}
                                        >
                                            {mentionOptions.map(opt => (
                                                <Option key={opt.value} value={opt.value}>
                                                    {opt.label} ({opt.value})
                                                </Option>
                                            ))}
                                        </Mentions>
                                        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                                            <Button size="small" onClick={() => setActiveReplyId(null)}>Cancel</Button>
                                            <Button 
                                                size="small" 
                                                type="primary" 
                                                loading={postingReply} 
                                                onClick={() => handlePostReply(parentId || c.name)}
                                                style={{ backgroundColor: "#18181b", borderColor: "#18181b" }}
                                            >
                                                Reply
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div style={{ marginTop: "24px" }}>
            <SectionCard
                title="Activity & Comments"
                icon={<HistoryOutlined style={{ color: "#18181b" }} />}
                right={loadMoreButton}
            >
                {/* ── Add Comment Block ── */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "24px", borderBottom: "1px solid #f4f4f5", paddingBottom: "16px" }}>
                    <Avatar
                        size={32}
                        style={{
                            backgroundColor: "#18181b",
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: "12px"
                        }}
                    >
                        {currentUser?.charAt(0)?.toUpperCase() || "U"}
                    </Avatar>
                    
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                        <Mentions
                            placeholder="Write a comment... use @ to mention users"
                            value={commentText}
                            onChange={setCommentText}
                            onKeyDown={(e) => handleMentionsKeyDown(e, commentText, setCommentText)}
                            rows={2}
                            style={{ 
                                borderRadius: "8px", 
                                border: "1px solid #e4e4e7",
                                padding: "8px 12px",
                                fontSize: "13px"
                            }}
                        >
                            {mentionOptions.map(opt => (
                                <Option key={opt.value} value={opt.value}>
                                    {opt.label} ({opt.value})
                                </Option>
                            ))}
                        </Mentions>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button 
                                type="primary"
                                size="small"
                                loading={postingComment}
                                onClick={handlePostComment}
                                icon={<SendOutlined />}
                                style={{ 
                                    backgroundColor: "#18181b", 
                                    borderColor: "#18181b", 
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    height: "32px",
                                    padding: "0 16px"
                                }}
                            >
                                Comment
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ── Unified Chronological Sequence Timeline ── */}
                {loading && !timelineItems.length ? (
                    <div className="py-12 flex justify-center">
                        <Spin size="small" />
                    </div>
                ) : displayItems.length ? (
                    <div className="relative pl-2 py-2">
                        
                        {/* Vertical Timeline Guide Line */}
                        <div 
                            style={{ 
                                position: "absolute", 
                                left: "19px", 
                                top: "10px", 
                                bottom: "10px", 
                                width: "1px", 
                                backgroundColor: "#f4f4f5" 
                            }} 
                        />

                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            {displayItems.map((item) => {
                                if (item.isComment) {
                                    // ──────── COMMENT LOG NODE ────────
                                    const replies = timelineItems.filter(r => r.isComment && r.subject === item.name);
                                    // Sort replies oldest first (conversations flow chronologically)
                                    replies.sort((a, b) => new Date(a.creation) - new Date(b.creation));

                                    return (
                                        <div key={`c-${item.name}`} style={{ display: "flex", gap: "14px", position: "relative" }}>
                                            
                                            {/* Speech Avatar Node in Timeline stream (first-most logo) */}
                                            <div style={{ zIndex: 2, flexShrink: 0 }}>
                                                <Avatar
                                                    size={24}
                                                    icon={<MessageSquare size={12} />}
                                                    style={{
                                                        backgroundColor: "#18181b",
                                                        color: "#ffffff"
                                                    }}
                                                />
                                            </div>

                                            {/* Comment Thread Content & Replies */}
                                            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                                                {/* Parent Comment */}
                                                {renderCommentCard(item, false, item.name)}

                                                {/* Collapse/Expand Replies Toggle */}
                                                {replies.length > 0 && expandedCommentCards.has(item.name) && (
                                                    <div style={{ marginLeft: "24px", marginTop: "2px" }}>
                                                        <Button
                                                            type="text"
                                                            size="small"
                                                            icon={expandedComments.has(item.name) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                                            onClick={() => toggleExpandComment(item.name)}
                                                            style={{ fontSize: "11px", color: "#71717a", fontWeight: 600, padding: 0, height: "auto" }}
                                                        >
                                                            {expandedComments.has(item.name) ? "Hide Replies" : `View Replies (${replies.length})`}
                                                        </Button>
                                                    </div>
                                                )}

                                                {/* Nested Replies (Rendered only if Expanded) */}
                                                {replies.length > 0 && expandedCommentCards.has(item.name) && expandedComments.has(item.name) && (
                                                    <div 
                                                        style={{ 
                                                            marginLeft: "24px", 
                                                            paddingLeft: "16px", 
                                                            borderLeft: "2.5px solid #f4f4f5", 
                                                            display: "flex", 
                                                            flexDirection: "column", 
                                                            gap: "12px",
                                                            marginTop: "2px"
                                                        }}
                                                    >
                                                        {replies.map(reply => renderCommentCard(reply, true, item.name))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                } else {
                                    // ──────── VERSION HISTORY NODE ────────
                                    let changes = {};
                                    try {
                                        changes = JSON.parse(item.data || "{}");
                                    } catch {}

                                    const changedFields = changes.changed || [];
                                    const ownerName = item.owner || "System";
                                    const initial = ownerName.charAt(0).toUpperCase();
                                    const isExpanded = expandedVersions.has(item.name);

                                    return (
                                        <div key={`v-${item.name}`} style={{ display: "flex", gap: "14px", position: "relative" }}>
                                            
                                            {/* History Badge Node */}
                                            <div style={{ zIndex: 2, flexShrink: 0 }}>
                                                <Avatar
                                                    size={24}
                                                    style={{
                                                        backgroundColor: "#18181b",
                                                        color: "#ffffff",
                                                        fontWeight: 700,
                                                        fontSize: "10px"
                                                    }}
                                                >
                                                    {initial}
                                                </Avatar>
                                            </div>

                                            {/* Content Block */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                
                                                {/* Header Meta (Clickable to toggle Collapse) */}
                                                <div 
                                                    onClick={() => toggleExpandVersion(item.name)}
                                                    style={{ 
                                                        display: "flex", 
                                                        flexWrap: "wrap", 
                                                        alignItems: "center", 
                                                        gap: "6px", 
                                                        marginBottom: "4px",
                                                        cursor: "pointer",
                                                        userSelect: "none"
                                                    }}
                                                >
                                                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#18181b" }}>
                                                        {ownerName}
                                                    </span>
                                                    <span style={{ fontSize: "12px", color: "#71717a" }}>
                                                        modified this document
                                                    </span>
                                                    
                                                    {/* Toggle Indicator */}
                                                    {isExpanded ? (
                                                        <ChevronDown size={12} style={{ color: "#71717a", marginLeft: "4px" }} />
                                                    ) : (
                                                        <ChevronRight size={12} style={{ color: "#71717a", marginLeft: "4px" }} />
                                                    )}

                                                    <span style={{ fontSize: "11px", color: "#a1a1aa", marginLeft: "auto", fontWeight: 500 }}>
                                                        {new Date(item.creation).toLocaleString()}
                                                    </span>
                                                </div>

                                                {/* Dynamic Changed Fields (Rendered only if Expanded) */}
                                                {isExpanded && (
                                                    changedFields.length ? (
                                                        <div 
                                                            style={{ 
                                                                marginLeft: 0, 
                                                                marginTop: "6px", 
                                                                borderLeft: "2px solid #e4e4e7", 
                                                                paddingLeft: "12px" 
                                                            }}
                                                            className="flex flex-col gap-2"
                                                        >
                                                            {changedFields.map(([field, oldVal, newVal]) => (
                                                                <div 
                                                                    key={field} 
                                                                    style={{ 
                                                                        display: "flex", 
                                                                        alignItems: "center", 
                                                                        gap: "8px", 
                                                                        flexWrap: "wrap",
                                                                        fontSize: "12px"
                                                                    }}
                                                                >
                                                                    {/* Field Badge */}
                                                                    <span 
                                                                        style={{ 
                                                                            fontSize: "10px", 
                                                                            fontWeight: 700, 
                                                                            color: "#4b5563", 
                                                                            backgroundColor: "#f3f4f6", 
                                                                            border: "1px solid #e5e7eb", 
                                                                            padding: "2px 6px", 
                                                                            borderRadius: "4px",
                                                                            textTransform: "capitalize",
                                                                            display: "inline-block"
                                                                        }}
                                                                    >
                                                                        {field.replace(/_/g, " ")}
                                                                    </span>

                                                                    {/* Old Value */}
                                                                    <span style={{ color: "#9ca3af", textDecoration: "line-through", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={oldVal || "None"}>
                                                                        {oldVal || "None"}
                                                                    </span>

                                                                    <ArrowRightOutlined style={{ fontSize: "10px", color: "#d1d5db" }} />

                                                                    {/* New Value */}
                                                                    <span style={{ fontWeight: 600, color: "#16a34a", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={newVal || "None"}>
                                                                        {newVal || "None"}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div style={{ marginTop: "2px" }}>
                                                            <span style={{ fontSize: "11px", color: "#a1a1aa", fontStyle: "italic" }}>
                                                                Metadata or untracked changes updated
                                                            </span>
                                                        </div>
                                                    )
                                                )}

                                            </div>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="py-6">
                        <Empty
                            description="No activity logged yet"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </div>
                )}
            </SectionCard>
        </div>
    );
};

export default ActivityLog;