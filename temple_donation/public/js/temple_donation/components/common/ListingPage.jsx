import React, { useEffect, useState } from "react";
import { Spin, Alert, Modal, message, Input, Select, Button, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useFrappeGetDocList, useFrappeDeleteDoc } from "../../hooks/useFrappe";
import CommonTable from "./CommonTable";
import PageHeader from "./PageHeader";
import SavedViewsBar from "./SavedViewsBar";
import { exportToCSV, exportToExcel, exportToPDF } from "../../utils/exportUtils";

/**
 * ListingPage Component
 *
 * Props:
 * @param {string} doctype - Doctype name
 * @param {string} title - Page title
 * @param {string} description - Page description
 * @param {Array} columns - Table columns
 * @param {string} basePath - Base path for routing (e.g. 'donors')
 * @param {Array} fields - Fields to fetch from Frappe (optional, uses all if not provided)
 */
const ListingPage = ({
    doctype,
    title,
    description,
    columns,
    basePath,
    fields = ["*"],
    filters = {},
    childTable,
    childDocType,
    allowAdd = true,
    allowEdit = true,
    allowDelete = true,
    allowView = true,
    allowPrint = true,
    allowExport = true,
    exportOptions = ["csv", "excel", "pdf"],
    addLabel,
    allowFilter = true
}) => {
    const [appliedFilters, setAppliedFilters] = useState([]);
    const [savedViews, setSavedViews] = useState([]);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [renamingView, setRenamingView] = useState(null);
    const [renameValue, setRenameValue] = useState("");
    const [editModalFilters, setEditModalFilters] = useState([]);

    const addEditFilterRow = () => {
        setEditModalFilters([...editModalFilters, { field: undefined, operator: undefined, value: "" }]);
    };

    const removeEditFilterRow = (index) => {
        const newRows = [...editModalFilters];
        newRows.splice(index, 1);
        setEditModalFilters(newRows);
    };

    const updateEditFilterRow = (index, key, val) => {
        const newRows = [...editModalFilters];
        if (key === "field") {
            newRows[index] = {
                field: val,
                operator: undefined,
                value: ""
            };
        } else {
            newRows[index] = { ...newRows[index], [key]: val };
        }
        setEditModalFilters(newRows);
    };

    const handleRenameView = () => {
        if (!renameValue.trim() || !doctype || !renamingView) {
            message.warning("Please enter a valid view name");
            return;
        }

        const validRows = editModalFilters.filter(row => row.field && row.operator && row.value !== "");
        if (validRows.length === 0) {
            message.warning("At least one valid filter row is required");
            return;
        }

        if (typeof frappe !== "undefined") {
            frappe.call({
                method: "temple_donation.api.update_filter_view",
                args: {
                    old_view_name: renamingView.name,
                    new_view_name: renameValue.trim(),
                    reference_doctype: doctype,
                    filters_json: JSON.stringify(validRows)
                },
                callback: (r) => {
                    message.success("View updated successfully!");
                    fetchSavedViews();
                    setIsRenameModalOpen(false);
                    setRenamingView(null);
                    setRenameValue("");
                    setEditModalFilters([]);
                }
            });
        }
    };

    const fetchSavedViews = () => {
        if (!doctype || typeof frappe === "undefined") return;
        frappe.call({
            method: "temple_donation.api.get_filter_views",
            args: { reference_doctype: doctype },
            callback: (r) => {
                if (r.message) {
                    setSavedViews(r.message.map(item => ({
                        name: item.view_name,
                        rawRows: JSON.parse(item.filters_json),
                        filters: JSON.parse(item.filters_json).map(row => {
                            let val = row.value;
                            if (row.operator === "like" || row.operator === "not like") {
                                val = `%${val}%`;
                            }
                            return [row.field, row.operator, val];
                        })
                    })));
                } else {
                    setSavedViews([]);
                }
            }
        });
    };

    useEffect(() => {
        fetchSavedViews();
    }, [doctype]);

    // Merge default filters prop with runtime active dynamic filters
    const combinedFilters = React.useMemo(() => {
        const normalizeFilters = (flt) => {
            if (!flt) return [];
            if (Array.isArray(flt)) return flt;
            return Object.keys(flt).map(key => {
                const val = flt[key];
                if (Array.isArray(val) && val.length === 2) {
                    return [key, val[0], val[1]];
                }
                return [key, "=", val];
            });
        };

        const activeFiltersMapped = appliedFilters
            .filter(row => row.field && row.operator && row.value !== undefined && row.value !== "")
            .map(row => {
                let val = row.value;
                if (row.operator === "like" || row.operator === "not like") {
                    val = `%${val}%`;
                }
                return [row.field, row.operator, val];
            });

        return [
            ...normalizeFilters(filters),
            ...activeFiltersMapped
        ];
    }, [filters, appliedFilters]);

    // Fetch data
    const { data, loading, error, mutate } = useFrappeGetDocList(doctype, {
        fields: fields,
        filters: combinedFilters,
        limit: 100,
        orderBy: { field: 'modified', order: 'desc' }
    });

    const [enrichedData, setEnrichedData] = useState([]);
    const [enriching, setEnriching] = useState(false);

    useEffect(() => {
        if (data && data.length > 0 && childTable) {
            setEnriching(true);
            const parentNames = data.map(d => d.name);
            
            frappe.call({
                method: "temple_donation.api.get_children",
                args: {
                    doctype: childDocType || "Temple Details",
                    parent_names: parentNames,
                    parenttype: doctype,
                    parentfield: childTable
                },
                callback: (r) => {
                    setEnriching(false);
                    if (r.message) {
                        const childrenByParent = r.message.reduce((acc, child) => {
                            if (!acc[child.parent]) acc[child.parent] = [];
                            acc[child.parent].push(child);
                            return acc;
                        }, {});

                        const enriched = data.map(doc => ({
                            ...doc,
                            [childTable]: childrenByParent[doc.name] || []
                        }));
                        setEnrichedData(enriched);
                    } else {
                        setEnrichedData(data);
                    }
                },
                error: () => {
                    setEnriching(false);
                    setEnrichedData(data);
                }
            });
        } else if (data) {
            setEnrichedData(data);
        }
    }, [data, childTable, doctype]);

    const { deleteDoc } = useFrappeDeleteDoc();

    const [searchText, setSearchText] = useState("");

    const handleAdd = () => {
        if (typeof frappe !== "undefined" && basePath) {
            frappe.set_route("temple-donation", basePath, "new");
        }
    };

    const handleEdit = (record) => {
        if (typeof frappe !== "undefined" && basePath && record?.name) {
            frappe.set_route("temple-donation", basePath, "edit", record.name);
        }
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: `Are you sure you want to delete this ${doctype}?`,
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                return deleteDoc(doctype, record.name)
                    .then(() => {
                        mutate();
                    })
                    .catch((err) => {
                        console.error("Delete Error:", err);
                    });
            }
        });
    };

    const handleView = (record) => {
        if (typeof frappe !== "undefined" && basePath && record?.name) {
            frappe.set_route("temple-donation", basePath, "view", record.name);
        }
    };

    const handlePrint = (record) => {
        window.print(); // Simple print trigger for now
    };

    const handleExport = (format) => {
        if (!data || data.length === 0) {
            message.warning("No data to export");
            return;
        }
        if (format === "csv") {
            exportToCSV(data, columns, title);
        } else if (format === "excel") {
            exportToExcel(data, columns, title);
        } else if (format === "pdf") {
            exportToPDF(data, columns, title);
        }
    };

    if (error) {
        return (
            <div className="p-6">
                <Alert
                    message="Connection Error"
                    description={error.message || `Failed to fetch ${doctype} list.`}
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div className="py-6 space-y-6">

            <PageHeader 
                title={title} 
                description={description} 
                onAdd={allowAdd ? handleAdd : undefined} 
                onExport={handleExport}
                onSearch={setSearchText}
                searchPlaceholder={`Search ${doctype}s...`}
                addLabel={addLabel || `Add ${doctype}`} 
                allowExport={allowExport}
                exportOptions={exportOptions}
                columns={columns}
                doctype={doctype}
                appliedFilters={appliedFilters}
                onApplyFilters={allowFilter ? setAppliedFilters : undefined}
                savedViews={savedViews}
                onRefreshViews={fetchSavedViews}
            />

            {allowFilter && savedViews.length > 0 && (
                <SavedViewsBar
                    views={savedViews}
                    appliedFilters={appliedFilters}
                    onSelectView={setAppliedFilters}
                    onEditView={(view) => {
                        setRenamingView(view);
                        setRenameValue(view.name);
                        setEditModalFilters(JSON.parse(JSON.stringify(view.rawRows || [])));
                        setIsRenameModalOpen(true);
                    }}
                    onDeleteView={(viewName) => {
                        Modal.confirm({
                            title: 'Delete Filter View',
                            content: `Are you sure you want to delete the saved view "${viewName}"?`,
                            okText: 'Delete',
                            okType: 'danger',
                            cancelText: 'Cancel',
                            okButtonProps: { style: { backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' } },
                            onOk() {
                                if (typeof frappe !== "undefined") {
                                    frappe.call({
                                        method: "temple_donation.api.delete_filter_view",
                                        args: {
                                            view_name: viewName,
                                            reference_doctype: doctype
                                        },
                                        callback: () => {
                                            message.success("View deleted!");
                                            fetchSavedViews();
                                        }
                                    });
                                }
                            }
                        });
                    }}
                />
            )}
            <CommonTable
                columns={columns || []}
                dataSource={enrichedData}
                loading={loading || enriching}
                searchText={searchText}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onPrint={handlePrint}
                showView={allowView}
                showEdit={allowEdit}
                showDelete={allowDelete}
                showPrint={allowPrint}
            />

            <Modal
                title="Edit Saved View"
                open={isRenameModalOpen}
                onOk={handleRenameView}
                onCancel={() => {
                    setIsRenameModalOpen(false);
                    setRenamingView(null);
                    setRenameValue("");
                    setEditModalFilters([]);
                }}
                okText="Save Changes"
                cancelText="Cancel"
                okButtonProps={{ style: { backgroundColor: "#000", borderColor: "#000" } }}
                width={680}
                destroyOnClose
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "12px" }}>
                    <div>
                        <div style={{ fontSize: "12px", fontWeight: "700", color: "#8c8c8c", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>
                            View Name:
                        </div>
                        <Input
                            placeholder="e.g. Active Cashiers..."
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            style={{ height: "40px" }}
                            className="font-medium"
                            autoFocus
                        />
                    </div>

                    <div>
                        <div style={{ fontSize: "12px", fontWeight: "700", color: "#8c8c8c", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>
                            Filters in this View:
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "250px", overflowY: "auto", paddingRight: "4px" }}>
                            {editModalFilters.map((row, index) => {
                                const filterableColumns = columns
                                    ? columns.filter(col => col.filterable !== false && col.dataIndex && col.title && typeof col.title === "string")
                                    : [];
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
                                        <Select
                                            placeholder="Filter field"
                                            value={row.field}
                                            onChange={(val) => updateEditFilterRow(index, "field", val)}
                                            style={{ width: "180px" }}
                                            className="h-9 font-medium"
                                            options={filterableColumns.map(col => ({
                                                label: col.title,
                                                value: col.dataIndex
                                            }))}
                                        />

                                        <Select
                                            placeholder="Filter relation"
                                            value={row.operator}
                                            onChange={(val) => updateEditFilterRow(index, "operator", val)}
                                            style={{ width: "140px" }}
                                            className="h-9 font-medium"
                                            disabled={!row.field}
                                            options={row.field ? relationOptions : []}
                                        />

                                        {selectedCol?.filterType === "select" ? (
                                            <Select
                                                placeholder="Select value"
                                                value={row.value || undefined}
                                                onChange={(val) => updateEditFilterRow(index, "value", val)}
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
                                                onChange={(e) => updateEditFilterRow(index, "value", e.target.value)}
                                                style={{ flex: 1 }}
                                                className="h-9 font-medium"
                                                disabled={!row.operator}
                                            />
                                        )}

                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => removeEditFilterRow(index)}
                                            style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "36px", width: "36px" }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ marginTop: "12px" }}>
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={addEditFilterRow}
                                style={{ borderColor: "#d9d9d9", fontWeight: "bold" }}
                            >
                                Add a Filter
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ListingPage;
