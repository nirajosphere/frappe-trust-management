import React, { useState } from "react";
import { Button, Input, Popover, Select, Space } from "antd";
import { FilterOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const FilterPopover = ({ columns, onApplyFilters }) => {
    const [appliedFilters, setAppliedFilters] = useState([]);
    const [draftFilters, setDraftFilters] = useState([]);
    const [popoverOpen, setPopoverOpen] = useState(false);

    // Filter available columns to only those that can be queried (must have title and dataIndex)
    const filterableColumns = columns
        ? columns.filter(col => col.filterable !== false && col.dataIndex && col.title && typeof col.title === "string")
        : [];

    const handleOpenChange = (open) => {
        setPopoverOpen(open);
        if (open) {
            // When opening, initialize the draft from the currently applied filters
            // If there are no applied filters, start with one empty row by default
            if (appliedFilters.length === 0) {
                setDraftFilters([{ field: undefined, operator: undefined, value: "" }]);
            } else {
                setDraftFilters([...appliedFilters]);
            }
        }
    };

    const addFilterRow = () => {
        setDraftFilters([...draftFilters, { 
            field: undefined, 
            operator: undefined, 
            value: "" 
        }]);
    };

    const removeFilterRow = (index) => {
        const newRows = [...draftFilters];
        newRows.splice(index, 1);
        setDraftFilters(newRows);
    };

    const updateFilterRow = (index, key, val) => {
        const newRows = [...draftFilters];
        if (key === "field") {
            newRows[index] = {
                field: val,
                operator: undefined, // Let user select operator manually
                value: ""
            };
        } else {
            newRows[index] = { ...newRows[index], [key]: val };
        }
        setDraftFilters(newRows);
    };

    const handleApply = () => {
        // Commit draft filters to applied state
        setAppliedFilters([...draftFilters]);

        const activeFilters = draftFilters
            .filter(row => row.field && row.operator && row.value !== undefined && row.value !== "")
            .map(row => {
                let val = row.value;
                if (row.operator === "like" || row.operator === "not like") {
                    val = `%${val}%`;
                }
                return [row.field, row.operator, val];
            });
        
        if (onApplyFilters) {
            onApplyFilters(activeFilters);
        }
        setPopoverOpen(false);
    };

    const handleClear = () => {
        setAppliedFilters([]);
        setDraftFilters([{ field: undefined, operator: undefined, value: "" }]);
        if (onApplyFilters) {
            onApplyFilters([]);
        }
        setPopoverOpen(false);
    };

    const filterPopoverContent = (
        <div style={{ width: "620px", padding: "12px 8px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {draftFilters.length === 0 ? (
                <div style={{ color: "#a1a1aa", fontSize: "14px", padding: "16px 0", textAlign: "center" }}>
                    No filters applied. Click below to add a filter.
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "300px", overflowY: "auto", paddingRight: "4px" }}>
                    {draftFilters.map((row, index) => {
                        const selectedCol = filterableColumns.find(c => c.dataIndex === row.field);
                        let relationOptions = [
                            { label: "Equals (=)", value: "=" },
                            { label: "Not Equals (!=)", value: "!=" }
                        ];

                        if (selectedCol) {
                            if (selectedCol.filterType !== "select") {
                                relationOptions.push(
                                    { label: "Like", value: "like" },
                                    { label: "Not Like", value: "not like" }
                                );
                            }

                            if (selectedCol.filterType === "number") {
                                relationOptions.push(
                                    { label: "Greater Than (>)", value: ">" },
                                    { label: "Less Than (<)", value: "<" },
                                    { label: "Greater or Equal (>=)", value: ">=" },
                                    { label: "Less or Equal (<=)", value: "<=" }
                                );
                            }

                            // Check if column overrides operators
                            if (selectedCol.filterOperators) {
                                const allRelations = {
                                    "=": { label: "Equals (=)", value: "=" },
                                    "!=": { label: "Not Equals (!=)", value: "!=" },
                                    "like": { label: "Like", value: "like" },
                                    "not like": { label: "Not Like", value: "not like" },
                                    ">": { label: "Greater Than (>)", value: ">" },
                                    "<": { label: "Less Than (<)", value: "<" },
                                    ">=": { label: "Greater or Equal (>=)", value: ">=" },
                                    "<=": { label: "Less or Equal (<=)", value: "<=" },
                                    "in": { label: "In", value: "in" },
                                    "not in": { label: "Not In", value: "not in" }
                                };
                                relationOptions = selectedCol.filterOperators.map(op => allRelations[op] || { label: op, value: op });
                            }
                        }

                        return (
                            <div key={index} style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
                                {/* Field Select */}
                                <Select
                                    placeholder="Filter field"
                                    value={row.field}
                                    onChange={(val) => updateFilterRow(index, "field", val)}
                                    style={{ width: "180px" }}
                                    className="h-9 font-medium"
                                    options={filterableColumns.map(col => ({
                                        label: col.title,
                                        value: col.dataIndex
                                    }))}
                                />

                                {/* Relation Select */}
                                <Select
                                    placeholder="Filter relation"
                                    value={row.operator}
                                    onChange={(val) => updateFilterRow(index, "operator", val)}
                                    style={{ width: "150px" }}
                                    className="h-9 font-medium"
                                    disabled={!row.field}
                                    options={row.field ? relationOptions : []}
                                />

                                {/* Dynamic Value Input */}
                                {selectedCol?.filterType === "select" ? (
                                    <Select
                                        placeholder="Select value"
                                        value={row.value || undefined}
                                        onChange={(val) => updateFilterRow(index, "value", val)}
                                        style={{ flex: 1 }}
                                        className="h-9 font-medium"
                                        disabled={!row.operator}
                                        options={selectedCol.filterOptions}
                                    />
                                ) : (
                                    <Input
                                        placeholder="Value"
                                        type={selectedCol?.filterType === "number" ? "number" : "text"}
                                        value={row.value}
                                        onChange={(e) => updateFilterRow(index, "value", e.target.value)}
                                        style={{ flex: 1 }}
                                        className="h-9 font-medium"
                                        disabled={!row.operator}
                                    />
                                )}

                                {/* Delete Button */}
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeFilterRow(index)}
                                    style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "36px", width: "36px" }}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f0f0f0", paddingTop: "16px", marginTop: "4px" }}>
                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={addFilterRow}
                    style={{ height: "36px", borderColor: "#d9d9d9", fontWeight: "bold" }}
                    className="hover:text-black hover:border-black"
                >
                    Add a Filter
                </Button>
                <Space size={12}>
                    <Button
                        onClick={handleClear}
                        style={{ height: "36px", padding: "0 16px", borderColor: "#d9d9d9", color: "#595959", fontWeight: "bold" }}
                    >
                        Clear Filters
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleApply}
                        style={{ height: "36px", padding: "0 16px", backgroundColor: "#000", color: "#fff", fontWeight: "bold", border: "none" }}
                    >
                        Apply Filters
                    </Button>
                </Space>
            </div>
        </div>
    );

    const activeCount = appliedFilters.filter(row => row.field && row.operator && row.value !== undefined && row.value !== "").length;

    return (
        <Popover
            content={filterPopoverContent}
            trigger="click"
            open={popoverOpen}
            onOpenChange={handleOpenChange}
            placement="bottomRight"
            arrow={true}
        >
            <Button
                icon={<FilterOutlined />}
                style={{ height: "40px", padding: "0 16px", borderColor: "#d9d9d9", color: "#595959", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}
            >
                Filter
                {activeCount > 0 && (
                    <span style={{ backgroundColor: "#000", color: "#fff", fontSize: "10px", height: "20px", minWidth: "20px", padding: "0 6px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "10px", fontWeight: "bold" }}>
                        {activeCount}
                    </span>
                )}
            </Button>
        </Popover>
    );
};

export default FilterPopover;
