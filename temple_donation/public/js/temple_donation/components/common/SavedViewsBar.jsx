import React from "react";
import { Tag, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const SavedViewsBar = ({ views, appliedFilters, onSelectView, onDeleteView, onEditView }) => {
    // Helper to check if a saved view is currently active/selected
    const isViewActive = (view) => {
        if (!appliedFilters || appliedFilters.length !== view.rawRows.length) return false;
        return view.rawRows.every((row, idx) => {
            const applied = appliedFilters[idx];
            return (
                applied &&
                applied.field === row.field &&
                applied.operator === row.operator &&
                applied.value === row.value
            );
        });
    };

    return (
        <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            padding: "8px 16px", 
            backgroundColor: "#fafafa", 
            borderRadius: "8px", 
            border: "1px solid #f0f0f0",
            marginBottom: "16px"
        }}>
            <span style={{ 
                fontSize: "12px", 
                fontWeight: "700", 
                color: "#8c8c8c", 
                textTransform: "uppercase", 
                letterSpacing: "0.5px" 
            }}>
                Saved Views:
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <Tag
                    onClick={() => onSelectView({ rawRows: [], sorters: [] })}
                    style={{
                        padding: "4px 12px",
                        borderRadius: "16px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        border: "1px solid",
                        transition: "all 0.2s",
                        backgroundColor: (!appliedFilters || appliedFilters.length === 0) ? "#000" : "#ffffff",
                        color: (!appliedFilters || appliedFilters.length === 0) ? "#fff" : "#18181b",
                        borderColor: (!appliedFilters || appliedFilters.length === 0) ? "#000" : "#d9d9d9"
                    }}
                    className="hover:scale-[1.02]"
                >
                    All
                </Tag>
                {views.map((view, idx) => {
                    const active = isViewActive(view);
                    return (
                        <Tag
                            key={idx}
                            style={{
                                padding: "4px 12px",
                                borderRadius: "16px",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer",
                                border: "1px solid",
                                transition: "all 0.2s",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                backgroundColor: active ? "#000" : "#ffffff",
                                color: active ? "#fff" : "#18181b",
                                borderColor: active ? "#000" : "#d9d9d9"
                            }}
                            className="hover:scale-[1.02]"
                        >
                            <span 
                                onClick={() => onSelectView(view)} 
                                style={{ marginRight: "4px" }}
                            >
                                {view.name}
                            </span>
                            
                            <span style={{ 
                                width: "1px", 
                                height: "12px", 
                                backgroundColor: active ? "rgba(255,255,255,0.3)" : "#e4e4e7" 
                            }} />

                            <Space size={6}>
                                <EditOutlined
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onEditView) onEditView(view);
                                    }}
                                    style={{ 
                                        fontSize: "12px", 
                                        color: active ? "rgba(255,255,255,0.8)" : "#71717a" 
                                    }}
                                    className="hover:text-blue-500"
                                />
                                <DeleteOutlined
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onDeleteView) onDeleteView(view.name);
                                    }}
                                    style={{ 
                                        fontSize: "12px", 
                                        color: active ? "rgba(255,255,255,0.8)" : "#71717a" 
                                    }}
                                    className="hover:text-red-500"
                                />
                            </Space>
                        </Tag>
                    );
                })}
            </div>
        </div>
    );
};

export default SavedViewsBar;
