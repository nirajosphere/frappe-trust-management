import React, { useState } from "react";
import { Button, Popover, Input, Badge, Tooltip } from "antd";
import { 
    SwapOutlined, 
    DeleteOutlined, 
    MenuOutlined, 
    SearchOutlined 
} from "@ant-design/icons";

/**
 * SortPopover Component matching premium custom design
 */
const SortPopover = ({ columns, appliedSorters = [], onApplySorters }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [columnSearchText, setColumnSearchText] = useState("");
    const [draggedIndex, setDraggedIndex] = useState(null);

    // Columns that can be sorted (must have title and dataIndex, and not actions)
    const sortableColumns = columns
        ? columns.filter(col => col.dataIndex && col.title && typeof col.title === "string" && col.key !== "actions")
        : [];

    // Filter available columns to add
    const selectableColumns = sortableColumns.filter(col => {
        const isAlreadyAdded = appliedSorters.some(s => s.field === col.dataIndex);
        if (isAlreadyAdded) return false;
        
        if (!columnSearchText) return true;
        return col.title.toLowerCase().includes(columnSearchText.toLowerCase());
    });

    // All sortable columns that haven't been added to the sorting list yet
    const unaddedColumns = sortableColumns.filter(col => 
        !appliedSorters.some(s => s.field === col.dataIndex)
    );

    const handleAddColumn = (field) => {
        const newSorters = [...appliedSorters, { field, order: "asc" }];
        onApplySorters(newSorters);
        setIsAdding(false);
        setColumnSearchText("");
    };

    const handleRemove = (index) => {
        const newSorters = [...appliedSorters];
        newSorters.splice(index, 1);
        onApplySorters(newSorters);
    };

    const toggleOrder = (index, order) => {
        const newSorters = [...appliedSorters];
        newSorters[index] = { ...newSorters[index], order };
        onApplySorters(newSorters);
    };

    const handleReset = () => {
        onApplySorters([]);
        setIsAdding(false);
        setColumnSearchText("");
    };

    // HTML5 Drag and Drop handlers
    const handleDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
    };

    const handleDrop = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const updated = [...appliedSorters];
        const draggedItem = updated[draggedIndex];
        updated.splice(draggedIndex, 1);
        updated.splice(index, 0, draggedItem);

        onApplySorters(updated);
        setDraggedIndex(null);
    };

    const handlePopoverOpenChange = (open) => {
        if (!open) {
            setIsAdding(false);
            setColumnSearchText("");
        }
    };

    const columnSelectorContent = (
        <div style={{ width: "360px", padding: "4px" }}>
            {/* Inline Search Box */}
            <Input
                placeholder="Search"
                prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                value={columnSearchText}
                onChange={(e) => setColumnSearchText(e.target.value)}
                style={{ 
                    marginBottom: "12px", 
                    borderRadius: "6px",
                    height: "36px",
                    borderColor: "#e2e8f0"
                }}
                autoFocus
            />
            {/* List of Available Column Pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", maxHeight: "120px", overflowY: "auto" }}>
                {selectableColumns.map(col => (
                    <Button
                        key={col.dataIndex}
                        onClick={() => handleAddColumn(col.dataIndex)}
                        size="small"
                        style={{
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "#1e293b",
                            backgroundColor: "#f1f5f9",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px 12px",
                            height: "32px"
                        }}
                        className="hover:!bg-zinc-200"
                    >
                        {col.title}
                    </Button>
                ))}
                {selectableColumns.length === 0 && (
                    <div style={{ fontSize: "11px", color: "#94a3b8", width: "100%", textAlign: "center", padding: "4px 0" }}>
                        No columns available
                    </div>
                )}
            </div>
        </div>
    );

    const popoverContent = (
        <div style={{ width: "320px", padding: "4px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "12px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Sort by</span>
                <span 
                    style={{ fontSize: "13px", color: "#f87171", fontWeight: 600, cursor: "pointer" }}
                    onClick={handleReset}
                    className="hover:text-red-500 transition-colors"
                >
                    Reset
                </span>
            </div>

            {/* Sorters List */}
            {appliedSorters.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
                    {appliedSorters.map((row, index) => {
                        const matchedCol = sortableColumns.find(c => c.dataIndex === row.field);
                        return (
                            <div 
                                key={index} 
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                                style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    width: "100%",
                                    padding: "6px 4px",
                                    borderRadius: "6px",
                                    backgroundColor: draggedIndex === index ? "#f8fafc" : "transparent",
                                    border: draggedIndex === index ? "1px dashed #cbd5e1" : "1px solid transparent",
                                    cursor: "grab"
                                }}
                                className="hover:bg-slate-50 transition-all"
                            >
                                {/* Drag Menu Handle */}
                                <MenuOutlined style={{ color: "#94a3b8", fontSize: "13px", cursor: "grab" }} />

                                {/* Label */}
                                <span style={{ fontSize: "14px", fontWeight: 500, color: "#334155", flex: 1, paddingLeft: "10px", userSelect: "none" }}>
                                    {matchedCol ? matchedCol.title : row.field}
                                </span>

                                {/* Sorting Direction Controls */}
                                <div style={{ display: "flex", alignItems: "center", marginRight: "8px" }}>
                                    <span 
                                        style={{ 
                                            cursor: "pointer", 
                                            fontSize: "18px", 
                                            fontWeight: row.order === "asc" ? "bold" : "normal",
                                            color: row.order === "asc" ? "#000000" : "#cbd5e1",
                                            marginRight: "10px",
                                            userSelect: "none"
                                        }}
                                        onClick={() => toggleOrder(index, "asc")}
                                        className="transition-colors"
                                    >
                                        ↑
                                    </span>
                                    <span 
                                        style={{ 
                                            cursor: "pointer", 
                                            fontSize: "18px", 
                                            fontWeight: row.order === "desc" ? "bold" : "normal",
                                            color: row.order === "desc" ? "#000000" : "#cbd5e1",
                                            userSelect: "none"
                                        }}
                                        onClick={() => toggleOrder(index, "desc")}
                                        className="transition-colors"
                                    >
                                        ↓
                                    </span>
                                </div>

                                {/* Trash Delete Button */}
                                <Button 
                                    type="text" 
                                    danger 
                                    icon={<DeleteOutlined style={{ fontSize: "13px" }} />}
                                    onClick={() => handleRemove(index)}
                                    style={{ 
                                        padding: 0, 
                                        width: "28px", 
                                        height: "28px", 
                                        display: "flex", 
                                        alignItems: "center", 
                                        justifyContent: "center" 
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Column Button with Nested Popover */}
            {unaddedColumns.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Popover
                        open={isAdding}
                        onOpenChange={setIsAdding}
                        trigger="click"
                        placement="bottom"
                        getPopupContainer={(triggerNode) => triggerNode.parentNode}
                        content={columnSelectorContent}
                    >
                        <Button
                            style={{
                                borderRadius: "6px",
                                borderColor: "#e2e8f0",
                                color: "#475569",
                                fontWeight: 600,
                                fontSize: "13px",
                                padding: "4px 16px",
                                height: "32px",
                                marginTop: appliedSorters.length > 0 ? "8px" : "0px"
                            }}
                            className="hover:!text-black hover:!border-zinc-400"
                        >
                            Add column
                        </Button>
                    </Popover>
                </div>
            )}
        </div>
    );

    return (
        <Popover
            content={popoverContent}
            title={null}
            trigger="click"
            placement="bottomRight"
            overlayClassName="aavatto-sort-popover"
            onOpenChange={handlePopoverOpenChange}
        >
            <Tooltip title="Sort" mouseEnterDelay={0.3}>
                <Badge count={appliedSorters.length} color="black" size="small" offset={[-2, 2]}>
                    <Button
                        icon={<SwapOutlined style={{ transform: "rotate(90deg)", fontSize: "14px" }} />}
                        className={`h-10 w-10 flex items-center justify-center transition-all ${
                            appliedSorters.length > 0
                                ? "border-zinc-950 bg-zinc-50 text-zinc-950"
                                : "border-zinc-200 text-zinc-600 hover:text-zinc-800"
                        }`}
                        style={{ borderRadius: "6px" }}
                    />
                </Badge>
            </Tooltip>
        </Popover>
    );
};

export default SortPopover;
