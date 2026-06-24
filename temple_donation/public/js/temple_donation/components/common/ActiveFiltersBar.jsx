import React from "react";
import { Tag, Button } from "antd";

const ActiveFiltersBar = ({ appliedFilters, columns, onApplyFilters }) => {
    if (!appliedFilters || appliedFilters.filter(f => f.field && f.operator && f.value !== "").length === 0) {
        return null;
    }

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            padding: "10px 16px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px"
        }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Active Filters:
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                {appliedFilters.filter(f => f.field && f.operator && f.value !== "").map((row, idx) => {
                    const col = columns?.find(c => (c.dataIndex || c.key) === row.field);
                    const fieldLabel = col ? col.title : row.field;
                    let displayVal = row.value;
                    if (col && col.filterType === "select" && col.filterOptions) {
                        const match = col.filterOptions.find(o => o.value === row.value);
                        if (match) {
                            displayVal = match.label;
                        }
                    }
                    return (
                        <Tag
                            key={idx}
                            closable
                            onClose={() => {
                                const updated = appliedFilters.filter((_, i) => i !== idx);
                                if (onApplyFilters) {
                                    onApplyFilters(updated);
                                }
                            }}
                            style={{
                                padding: "4px 10px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: "500",
                                backgroundColor: "#ffffff",
                                color: "#334155",
                                border: "1px solid #cbd5e1",
                                display: "inline-flex",
                                alignItems: "center",
                                margin: 0
                            }}
                        >
                            <span style={{ color: "#64748b", marginRight: "4px" }}>{fieldLabel}</span>
                            <span style={{ color: "#94a3b8", marginRight: "4px", fontSize: "11px" }}>{row.operator}</span>
                            <strong style={{ color: "#0f172a" }}>{displayVal}</strong>
                        </Tag>
                    );
                })}
                <Button 
                    type="link" 
                    size="small" 
                    onClick={() => {
                        if (onApplyFilters) {
                            onApplyFilters([]);
                        }
                    }}
                    style={{ 
                        padding: "0 4px", 
                        height: "auto", 
                        fontSize: "12px", 
                        fontWeight: "600",
                        color: "#ef4444" 
                    }}
                >
                    Clear All
                </Button>
            </div>
        </div>
    );
};

export default ActiveFiltersBar;
