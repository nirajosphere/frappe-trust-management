import React, { useState, useEffect } from "react";
import { Popover, Badge, Button, Avatar, List, Empty, Tooltip } from "antd";
import { Bell, MessageSquare, CheckCircle2 } from "lucide-react";
import { SyncOutlined } from "@ant-design/icons";
import { useFrappeGetDocList } from "../../hooks/useFrappe";

const NotificationDropdown = ({ currentUser }) => {
    const [readNotifications, setReadNotifications] = useState(() => {
        try {
            const saved = localStorage.getItem("read_notifications");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const { data: comments, mutate: refresh, loading } = useFrappeGetDocList("Comment", {
        fields: ["name", "content", "reference_doctype", "reference_name", "owner", "creation"],
        filters: [
            ["comment_type", "=", "Comment"],
            ["content", "like", `%@${currentUser}%`],
            ["owner", "!=", currentUser]
        ],
        limit: 15
    });

    useEffect(() => {
        localStorage.setItem("read_notifications", JSON.stringify(readNotifications));
    }, [readNotifications]);

    // Realtime listeners and fallback polling
    useEffect(() => {
        if (typeof frappe !== "undefined" && frappe.realtime) {
            const handleRealtime = () => {
                refresh();
            };
            frappe.realtime.on("notification", handleRealtime);
            frappe.realtime.on("docinfo_update", handleRealtime);
            return () => {
                frappe.realtime.off("notification", handleRealtime);
                frappe.realtime.off("docinfo_update", handleRealtime);
            };
        }
    }, [refresh]);

    useEffect(() => {
        const interval = setInterval(() => {
            refresh();
        }, 8000);
        return () => clearInterval(interval);
    }, [refresh]);

    // Filter unread notifications
    const unreadCount = (comments || []).filter(c => !readNotifications.includes(c.name)).length;

    const handleNotificationClick = (c) => {
        // Mark as read
        if (!readNotifications.includes(c.name)) {
            setReadNotifications(prev => [...prev, c.name]);
        }

        const doctypeMap = {
            "Donor": "donors",
            "Temple": "temples",
            "Donation": "donations",
            "Donation Type": "donation-types",
            "User": "users"
        };

        const baseKey = doctypeMap[c.reference_doctype];
        if (baseKey && typeof frappe !== "undefined" && frappe.set_route) {
            sessionStorage.setItem("target_comment", c.name);
            frappe.set_route("temple-donation", baseKey, "view", c.reference_name);
        }
    };

    const handleMarkAllRead = () => {
        if (comments && comments.length > 0) {
            const allNames = comments.map(c => c.name);
            setReadNotifications(prev => {
                const next = new Set([...prev, ...allNames]);
                return Array.from(next);
            });
        }
    };

    const notificationContent = (
        <div style={{ width: "320px", maxHeight: "400px", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                paddingBottom: "8px", 
                borderBottom: "1px solid #f4f4f5",
                marginBottom: "8px"
            }}>
                <span style={{ fontWeight: 700, fontSize: "14px", color: "#18181b" }}>Mentions</span>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {unreadCount > 0 && (
                        <Button 
                            type="text" 
                            size="small" 
                            onClick={handleMarkAllRead}
                            style={{ fontSize: "11px", fontWeight: 600, color: "#18181b", padding: "0 4px" }}
                        >
                            Mark all read
                        </Button>
                    )}
                    <Button 
                        type="text" 
                        size="small" 
                        icon={<SyncOutlined spin={loading} style={{ fontSize: "11px" }} />} 
                        onClick={() => refresh()}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    />
                </div>
            </div>

            {/* List */}
            <div style={{ overflowY: "auto", flex: 1, maxHeight: "320px" }} className="aavatto-scrollbar">
                {comments && comments.length > 0 ? (
                    <List
                        dataSource={comments}
                        itemLayout="horizontal"
                        renderItem={item => {
                            const isRead = readNotifications.includes(item.name);
                            const initial = (item.owner || "U").charAt(0).toUpperCase();
                            
                            // Clean up @mentions tags from content preview text
                            const cleanContent = item.content ? item.content.replace(/@\S+/g, "").trim() : "";
                            const preview = cleanContent.length > 60 ? `${cleanContent.substring(0, 60)}...` : cleanContent;

                            return (
                                <List.Item 
                                    onClick={() => handleNotificationClick(item)}
                                    style={{ 
                                        padding: "10px 8px", 
                                        cursor: "pointer", 
                                        borderRadius: "6px",
                                        backgroundColor: isRead ? "transparent" : "#f4f4f5",
                                        transition: "background-color 0.2s ease",
                                        borderBottom: "1px solid #f4f4f5",
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "10px",
                                        marginBottom: "4px"
                                    }}
                                    className="hover:bg-zinc-50"
                                >
                                    <Avatar 
                                        size={32} 
                                        style={{ 
                                            backgroundColor: isRead ? "#a1a1aa" : "#18181b", 
                                            color: "#ffffff",
                                            fontWeight: 700,
                                            flexShrink: 0
                                        }}
                                    >
                                        {initial}
                                    </Avatar>
                                    
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ 
                                            fontSize: "12px", 
                                            color: "#18181b", 
                                            fontWeight: isRead ? 500 : 700, 
                                            marginBottom: "2px" 
                                        }}>
                                            {item.owner}
                                        </div>
                                        <div style={{ fontSize: "11px", color: "#71717a", marginBottom: "4px", lineHeight: "1.3" }}>
                                            Mentioned you in <span style={{ fontWeight: 600, color: "#3f3f46" }}>{item.reference_doctype}</span>
                                        </div>
                                        {preview && (
                                            <div style={{ 
                                                fontSize: "11px", 
                                                color: "#52525b", 
                                                backgroundColor: "#f4f4f5",
                                                padding: "4px 8px",
                                                borderRadius: "4px",
                                                fontStyle: "italic"
                                            }}>
                                                "{preview}"
                                            </div>
                                        )}
                                        <div style={{ fontSize: "9px", color: "#a1a1aa", marginTop: "4px" }}>
                                            {new Date(item.creation).toLocaleString()}
                                        </div>
                                    </div>
                                    
                                    {!isRead && (
                                        <div style={{ 
                                            width: "6px", 
                                            height: "6px", 
                                            borderRadius: "50%", 
                                            backgroundColor: "#18181b", 
                                            alignSelf: "center",
                                            flexShrink: 0
                                        }} />
                                    )}
                                </List.Item>
                            );
                        }}
                    />
                ) : (
                    <div style={{ padding: "24px 0" }}>
                        <Empty 
                            description="No notifications yet" 
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <Popover 
            content={notificationContent} 
            trigger="click" 
            placement="bottomRight"
            overlayStyle={{ padding: 0 }}
        >
            <div style={{ cursor: "pointer", display: "flex", alignItems: "center", padding: "8px" }} className="hover:bg-zinc-50 rounded-lg">
                <Badge count={unreadCount} size="small" style={{ backgroundColor: "#ef4444" }}>
                    <Bell size={20} style={{ color: "#18181b" }} />
                </Badge>
            </div>
        </Popover>
    );
};

export default NotificationDropdown;
