import React, { useState } from "react";
import { Button, Popover, Checkbox } from "antd";
import { SettingOutlined, ArrowUpOutlined, ArrowDownOutlined, EyeOutlined, EyeInvisibleOutlined, HolderOutlined } from "@ant-design/icons";
import { Columns3 } from "lucide-react";

const ColumnsPopover = ({ customizedColumns, onSaveColumns, originalColumns, doctype }) => {
    const [open, setOpen] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);

    if (!customizedColumns || customizedColumns.length === 0) return null;

    const moveColumn = (index, direction) => {
        const nextCols = [...customizedColumns];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= nextCols.length) return;
        
        // Swap elements
        const temp = nextCols[index];
        nextCols[index] = nextCols[targetIndex];
        nextCols[targetIndex] = temp;
        
        onSaveColumns(nextCols);
    };

    const toggleVisibility = (index) => {
        const nextCols = [...customizedColumns];
        nextCols[index] = {
            ...nextCols[index],
            visible: nextCols[index].visible === false ? true : false
        };
        onSaveColumns(nextCols);
    };

    const handleReset = () => {
        localStorage.removeItem(`columns_order_${doctype}`);
        onSaveColumns(originalColumns.map(c => ({ ...c, visible: true })));
    };

    // HTML5 Drag and Drop handlers
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        
        const nextCols = [...customizedColumns];
        const [draggedItem] = nextCols.splice(draggedIndex, 1);
        nextCols.splice(index, 0, draggedItem);
        
        setDraggedIndex(index);
        onSaveColumns(nextCols);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const popoverContent = (
        <div style={{ width: "320px", padding: "8px 4px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f0f0f0", paddingBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#8c8c8c", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Columns Settings
                </span>
                <Button 
                    type="link" 
                    size="small" 
                    onClick={handleReset} 
                    style={{ padding: 0, height: "auto", fontSize: "12px", fontWeight: "600", color: "#ef4444" }}
                >
                    Reset
                </Button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "280px", overflowY: "auto", paddingRight: "4px" }}>
                {customizedColumns.map((col, index) => {
                    const titleStr = typeof col.title === "string" ? col.title : (col.dataIndex || col.key || "Column");
                    const isVisible = col.visible !== false;
                    return (
                        <div 
                            key={index} 
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "space-between", 
                                padding: "6px 8px", 
                                backgroundColor: draggedIndex === index ? "#f1f5f9" : "#f8fafc", 
                                opacity: draggedIndex === index ? 0.6 : 1,
                                borderRadius: "8px", 
                                border: draggedIndex === index ? "1px dashed #3b82f6" : "1px solid #e2e8f0",
                                cursor: "grab",
                                transition: "background-color 0.1s, border-color 0.1s"
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <HolderOutlined style={{ color: "#94a3b8", fontSize: "14px", cursor: "grab", marginRight: "2px" }} />
                                <Checkbox
                                    checked={isVisible}
                                    onChange={(e) => {
                                        // Stop propagation to prevent drag-triggering if applicable
                                        e.stopPropagation();
                                        toggleVisibility(index);
                                    }}
                                    style={{ marginRight: "6px" }}
                                />
                                <span style={{ 
                                    fontSize: "13px", 
                                    fontWeight: "600", 
                                    color: isVisible ? "#0f172a" : "#94a3b8", 
                                    textDecoration: isVisible ? "none" : "line-through",
                                    userSelect: "none"
                                }}>
                                    {titleStr}
                                </span>
                            </div>
                            <div style={{ display: "flex", gap: "4px" }} onClick={(e) => e.stopPropagation()}>
                                <Button 
                                    type="text" 
                                    size="small" 
                                    disabled={index === 0}
                                    icon={<ArrowUpOutlined style={{ fontSize: "11px" }} />} 
                                    onClick={() => moveColumn(index, -1)}
                                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", padding: 0 }}
                                />
                                <Button 
                                    type="text" 
                                    size="small" 
                                    disabled={index === customizedColumns.length - 1}
                                    icon={<ArrowDownOutlined style={{ fontSize: "11px" }} />} 
                                    onClick={() => moveColumn(index, 1)}
                                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", padding: 0 }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <Popover
            content={popoverContent}
            trigger="click"
            open={open}
            onOpenChange={setOpen}
            placement="bottomRight"
            arrow={true}
        >
            <Button
                icon={<Columns3 size={16} strokeWidth={2} />}
                className="h-10 px-4 border-zinc-200 text-zinc-600 font-bold"
            >
                {/* Columns */}
            </Button>
        </Popover>
    );
};

export default ColumnsPopover;
