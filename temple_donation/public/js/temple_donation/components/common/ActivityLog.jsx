import React from "react";
import { Typography, Spin, Button, Avatar, Empty } from "antd";
import { HistoryOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useFrappeGetVersions } from "../../hooks/useFrappe";
import SectionCard from "./SectionCard";

const { Text } = Typography;

const ActivityLog = ({ doctype, docname }) => {
    const { data: versions, loading: versionLoading, fetchMore } =
        useFrappeGetVersions(doctype, docname);

    if (!docname) return null;

    // Load More Action Trigger
    const loadMoreButton = versions?.length >= 5 && (
        <Button
            size="small"
            type="text"
            onClick={() => fetchMore?.()}
            loading={versionLoading}
            style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#4b5563",
                padding: "0 8px",
                height: "24px"
            }}
        >
            Load More
        </Button>
    );

    return (
        <div style={{ marginTop: "24px" }}>
            <SectionCard
                title="Activity Timeline"
                icon={<HistoryOutlined style={{ color: "#18181b" }} />}
                right={loadMoreButton}
            >
                {versionLoading && !versions?.length ? (
                    <div className="py-12 flex justify-center">
                        <Spin size="small" />
                    </div>
                ) : versions?.length ? (
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

                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {versions.map((v) => {
                                let changes = {};
                                try {
                                    changes = JSON.parse(v.data || "{}");
                                } catch {}

                                const changedFields = changes.changed || [];
                                const ownerName = v.owner || "System";
                                const initial = ownerName.charAt(0).toUpperCase();

                                return (
                                    <div key={v.name} style={{ display: "flex", gap: "14px", position: "relative" }}>
                                        
                                        {/* Elegant Avatar Node Indicator */}
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
                                            
                                            {/* Log Meta Header */}
                                            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                                                <span style={{ fontSize: "13px", fontWeight: 600, color: "#18181b" }}>
                                                    {ownerName}
                                                </span>
                                                <span style={{ fontSize: "12px", color: "#71717a" }}>
                                                    modified this document
                                                </span>
                                                <span style={{ fontSize: "11px", color: "#a1a1aa", marginLeft: "auto", fontWeight: 500 }}>
                                                    {new Date(v.creation).toLocaleString()}
                                                </span>
                                            </div>

                                            {/* Dynamic Changed Fields Block */}
                                            {changedFields.length ? (
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
                                                            {/* Field Tag */}
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

                                                            {/* Arrow symbol */}
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
                                            )}

                                        </div>
                                    </div>
                                );
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