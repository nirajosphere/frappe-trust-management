import React, { useState, useEffect } from "react";
import { Avatar, Button, Mentions, Popconfirm, message, Spin, Empty } from "antd";
import {
    MessageOutlined,
    EditOutlined,
    DeleteOutlined,
    CloseOutlined,
    CheckOutlined,
    SendOutlined,
    UndoOutlined
} from "@ant-design/icons";
import { useFrappeGetDocList } from "../../hooks/useFrappe";

const { Option } = Mentions;

const CommentSection = ({ doctype, docname }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [postingComment, setPostingComment] = useState(false);

    // Reply states
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [postingReply, setPostingReply] = useState(false);

    // Edit states
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingText, setEditingText] = useState("");

    // Fetch user list for mentions auto-complete
    const { data: usersList } = useFrappeGetDocList("User", { 
        fields: ["name", "first_name", "last_name"],
        limit: 200
    });

    const currentUser = typeof frappe !== "undefined" ? frappe.session.user : "";

    const fetchComments = async () => {
        if (!docname) return;
        setLoading(true);
        try {
            const res = await fetch(
                `/api/resource/Comment?filters=${encodeURIComponent(JSON.stringify([
                    ["reference_doctype", "=", doctype],
                    ["reference_name", "=", docname],
                    ["comment_type", "=", "Comment"]
                ]))}&fields=${encodeURIComponent(JSON.stringify(["*"]))}&order_by=creation desc`
            );
            const json = await res.json();
            setComments(json.data || []);
        } catch (err) {
            console.error("Error loading comments:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchComments();
    }, [doctype, docname]);

    // Post a new top-level comment
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
                fetchComments();
            },
            error: () => setPostingComment(false)
        });
    };

    // Post a nested reply (stores parent comment name in subject)
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
                    subject: parentId, // Use subject to store parent comment name for threading
                    content: replyText,
                    comment_by: currentUser
                }
            },
            callback: () => {
                setPostingReply(false);
                setReplyText("");
                setActiveReplyId(null);
                message.success("Reply added");
                fetchComments();
            },
            error: () => setPostingReply(false)
        });
    };

    // Delete a comment/reply
    const handleDeleteComment = (name) => {
        if (typeof frappe === "undefined") return;

        frappe.call({
            method: "frappe.client.delete",
            args: { doctype: "Comment", name: name },
            callback: () => {
                message.success("Comment deleted");
                fetchComments();
            }
        });
    };

    // Update comment content
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
                fetchComments();
            }
        });
    };

    // Highlight mentions in comment content
    const formatCommentContent = (content) => {
        if (!content) return "";
        const words = content.split(/(\s+)/);
        return words.map((word, idx) => {
            if (word.startsWith("@")) {
                return (
                    <span key={idx} style={{ color: "#2563eb", fontWeight: 600 }}>
                        {word}
                    </span>
                );
            }
            return word;
        });
    };

    const mentionOptions = (usersList || []).map(u => ({
        value: u.name,
        label: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.name
    }));

    // Build comment threads
    // Top level comments are those without subject, or whose subject does not match any comment name in the list
    const topLevelComments = comments.filter(c => !c.subject || !comments.some(p => p.name === c.subject));
    
    // Sort top level comments chronologically (newest first)
    topLevelComments.sort((a, b) => new Date(b.creation) - new Date(a.creation));

    const renderCommentCard = (c, isReply = false) => {
        const isOwner = currentUser === c.owner;
        const isEditing = editingCommentId === c.name;

        return (
            <div key={c.name} style={{ display: "flex", gap: "12px", position: "relative" }}>
                {/* Avatar */}
                <div style={{ flexShrink: 0, zIndex: 2 }}>
                    <Avatar
                        size={isReply ? 22 : 28}
                        style={{
                            backgroundColor: isReply ? "#3f3f46" : "#f97316",
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: isReply ? "9px" : "11px"
                        }}
                    >
                        {(c.owner || "U").charAt(0).toUpperCase()}
                    </Avatar>
                </div>

                {/* Content Box */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Header */}
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#18181b" }}>
                            {c.owner}
                        </span>
                        <span style={{ fontSize: "10px", color: isReply ? "#71717a" : "#f97316", fontWeight: 500 }}>
                            {isReply ? "replied" : "commented"}
                        </span>
                        <span style={{ fontSize: "10px", color: "#a1a1aa", marginLeft: "auto", fontWeight: 500 }}>
                            {new Date(c.creation).toLocaleString()}
                        </span>
                    </div>

                    {/* Card container */}
                    <div style={{ backgroundColor: "#fcfcfd", border: "1px solid #e4e4e7", borderRadius: "8px", padding: "10px" }}>
                        {isEditing ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <Mentions
                                    value={editingText}
                                    onChange={setEditingText}
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
                                    <span style={{ fontSize: "12.5px", color: "#27272a", whiteSpace: "pre-wrap", lineHeight: 1.45 }}>
                                        {formatCommentContent(c.content)}
                                    </span>

                                    {/* Action Buttons */}
                                    <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
                                        {!isReply && (
                                            <Button 
                                                size="small" 
                                                type="text" 
                                                icon={<UndoOutlined style={{ fontSize: "11px", color: "#71717a" }} />} 
                                                onClick={() => {
                                                    setActiveReplyId(activeReplyId === c.name ? null : c.name);
                                                    setReplyText("");
                                                }}
                                            >
                                                <span style={{ fontSize: "10px", color: "#71717a" }}>Reply</span>
                                            </Button>
                                        )}
                                        {isOwner && (
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

                                {/* Reply Input Box nested inside the card if reply is toggled */}
                                {activeReplyId === c.name && (
                                    <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f4f4f5", display: "flex", flexDirection: "column", gap: "8px" }}>
                                        <Mentions
                                            placeholder="Write a reply..."
                                            value={replyText}
                                            onChange={setReplyText}
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
                                                onClick={() => handlePostReply(c.name)}
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
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* ── Post Comment Input Block ── */}
            <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #f4f4f5", paddingBottom: "16px" }}>
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

            {/* ── Comments List Block ── */}
            {loading && !comments.length ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
                    <Spin size="small" />
                </div>
            ) : topLevelComments.length ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {topLevelComments.map(parentComment => {
                        // Find replies to this parent comment
                        const replies = comments.filter(r => r.subject === parentComment.name);
                        // Sort replies oldest first to keep thread flow natural
                        replies.sort((a, b) => new Date(a.creation) - new Date(b.creation));

                        return (
                            <div key={parentComment.name} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {/* Parent Comment */}
                                {renderCommentCard(parentComment, false)}

                                {/* Replies Thread Container */}
                                {replies.length > 0 && (
                                    <div 
                                        style={{ 
                                            marginLeft: "20px", 
                                            paddingLeft: "16px", 
                                            borderLeft: "2.5px solid #f4f4f5", 
                                            display: "flex", 
                                            flexDirection: "column", 
                                            gap: "12px",
                                            marginTop: "2px"
                                        }}
                                    >
                                        {replies.map(reply => renderCommentCard(reply, true))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <Empty description="No comments yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
        </div>
    );
};

export default CommentSection;
