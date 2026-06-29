import React, { useEffect, useState } from "react";
import { Spin, Alert, Modal, message, Input, Select, Button, Space, Tag } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useFrappeGetDocList, useFrappeDeleteDoc } from "../../hooks/useFrappe";
import CommonTable from "./CommonTable";
import PageHeader from "./PageHeader";
import SavedViewsBar from "./SavedViewsBar";
import ActiveFiltersBar from "./ActiveFiltersBar";
import { exportToCSV, exportToExcel, exportToPDF } from "../../utils/exportUtils";
import { getTagConfig } from "../../utils/tagUtils";
import ViewContainer from "./ViewContainer";


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
    const [appliedSorters, setAppliedSorters] = useState([]);

    // Restore sorting order from localStorage on mount or doctype change
    useEffect(() => {
        if (!doctype) return;
        const savedSort = localStorage.getItem(`sort_order_${doctype}`);
        if (savedSort) {
            try {
                setAppliedSorters(JSON.parse(savedSort));
            } catch (e) {
                console.error("Failed to restore sorting order:", e);
            }
        } else {
            setAppliedSorters([]);
        }
    }, [doctype]);

    const handleApplySorters = (newSorters) => {
        setAppliedSorters(newSorters);
        if (doctype) {
            localStorage.setItem(`sort_order_${doctype}`, JSON.stringify(newSorters));
        }
    };

    const [savedViews, setSavedViews] = useState([]);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [renamingView, setRenamingView] = useState(null);
    const [renameValue, setRenameValue] = useState("");
    const [editModalFilters, setEditModalFilters] = useState([]);
    const [customizedColumns, setCustomizedColumns] = useState([]);

    useEffect(() => {
        if (!columns || !doctype) return;

        // 1. Immediate loading from localStorage for instantaneous UI updates
        const savedLocal = localStorage.getItem(`columns_order_${doctype}`);
        let initialCols = columns.map(c => ({ ...c, visible: true }));

        if (savedLocal) {
            try {
                const parsed = JSON.parse(savedLocal);
                const reordered = [];
                parsed.forEach(savedCol => {
                    const match = columns.find(c => (c.dataIndex || c.key) === savedCol.dataIndex);
                    if (match) {
                        reordered.push({ ...match, visible: savedCol.visible !== false });
                    }
                });
                columns.forEach(c => {
                    const key = c.dataIndex || c.key;
                    if (key && !reordered.find(r => (r.dataIndex || r.key) === key)) {
                        reordered.push({ ...c, visible: true });
                    }
                });
                initialCols = reordered;
            } catch (e) {
                console.error(e);
            }
        }
        setCustomizedColumns(initialCols);

        // 2. Fetch from database user settings (server-side persistence)
        if (typeof frappe !== "undefined") {
            frappe.call({
                method: "temple_donation.api.get_column_order",
                args: { reference_doctype: doctype },
                callback: (r) => {
                    if (r.message && Array.isArray(r.message) && r.message.length > 0) {
                        const parsed = r.message;
                        const reordered = [];
                        parsed.forEach(savedCol => {
                            const match = columns.find(c => (c.dataIndex || c.key) === savedCol.dataIndex);
                            if (match) {
                                reordered.push({ ...match, visible: savedCol.visible !== false });
                            }
                        });
                        columns.forEach(c => {
                            const key = c.dataIndex || c.key;
                            if (key && !reordered.find(r => (r.dataIndex || r.key) === key)) {
                                reordered.push({ ...c, visible: true });
                            }
                        });
                        setCustomizedColumns(reordered);

                        // Sync back to local storage
                        const storageData = reordered.map(c => ({
                            dataIndex: c.dataIndex || c.key,
                            visible: c.visible !== false
                        }));
                        localStorage.setItem(`columns_order_${doctype}`, JSON.stringify(storageData));
                    }
                }
            });
        }
    }, [doctype, columns]);

    const handleSaveColumns = (newCols) => {
        setCustomizedColumns(newCols);
        const storageData = newCols.map(c => ({
            dataIndex: c.dataIndex || c.key,
            visible: c.visible !== false
        }));

        // Save to local storage for fast local experience
        localStorage.setItem(`columns_order_${doctype}`, JSON.stringify(storageData));

        // Save to backend database
        if (typeof frappe !== "undefined") {
            frappe.call({
                method: "temple_donation.api.save_column_order",
                args: {
                    reference_doctype: doctype,
                    columns_json: JSON.stringify(storageData)
                }
            });
        }
    };

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

        const saveData = {
            filters: validRows,
            sorters: renamingView.sorters || []
        };

        if (typeof frappe !== "undefined") {
            frappe.call({
                method: "temple_donation.api.update_filter_view",
                args: {
                    old_view_name: renamingView.name,
                    new_view_name: renameValue.trim(),
                    reference_doctype: doctype,
                    filters_json: JSON.stringify(saveData)
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
                    setSavedViews(r.message.map(item => {
                        let parsed = null;
                        try {
                            parsed = JSON.parse(item.filters_json);
                        } catch (e) {
                            console.error(e);
                        }

                        let rawRows = [];
                        let sorters = [];

                        if (Array.isArray(parsed)) {
                            rawRows = parsed;
                        } else if (parsed && typeof parsed === "object") {
                            rawRows = parsed.filters || [];
                            sorters = parsed.sorters || [];
                        }

                        const mappedFilters = rawRows.map(row => {
                            let val = row.value;
                            let field = row.field;
                            const colMatch = columns?.find(c => c.dataIndex === row.field);
                            if (colMatch && colMatch.filterField) {
                                field = colMatch.filterField;
                            }
                            if (row.operator === "like" || row.operator === "not like") {
                                val = `%${val}%`;
                            }
                            return [field, row.operator, val];
                        });

                        return {
                            name: item.view_name,
                            rawRows: rawRows,
                            sorters: sorters,
                            filters: mappedFilters
                        };
                    }));
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
                let field = row.field;
                const colMatch = columns?.find(c => c.dataIndex === row.field);
                if (colMatch && colMatch.filterField) {
                    field = colMatch.filterField;
                }
                if (row.operator === "like" || row.operator === "not like") {
                    val = `%${val}%`;
                }
                return [field, row.operator, val];
            });

        return [
            ...normalizeFilters(filters),
            ...activeFiltersMapped
        ];
    }, [filters, appliedFilters, columns]);

    // Fetch data
    const { data, loading, error, mutate } = useFrappeGetDocList(doctype, {
        fields: fields,
        filters: combinedFilters,
        limit: 100,
        orderBy: { field: 'modified', order: 'desc' }
    });

    // Fetch Temples list for link field mapping in columns
    const { data: temples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        limit: 1000
    });

    // Fetch Donations list for link field mapping in columns
    const { data: donations } = useFrappeGetDocList("Donation", {
        fields: ["name", "donor_name", "total_amount"],
        limit: 1000
    });

    // Fetch Donors list for link field mapping in columns
    const { data: donors } = useFrappeGetDocList("Donor", {
        fields: ["name", "donor_name"],
        limit: 1000
    });

    // Fetch Rooms list for link field mapping in columns
    const { data: rooms } = useFrappeGetDocList("Room", {
        fields: ["name", "room_number"],
        limit: 1000
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

    const sortedData = React.useMemo(() => {
        if (!enrichedData) return [];
        if (!appliedSorters || appliedSorters.length === 0) return enrichedData;

        return [...enrichedData].sort((a, b) => {
            for (const sorter of appliedSorters) {
                const { field, order } = sorter;
                if (!field) continue;

                let valA = a[field];
                let valB = b[field];

                // Resolve related names to sort alphabetically by display text instead of IDs
                if (field === "temple") {
                    const tA = temples?.find(item => item.name === valA);
                    const tB = temples?.find(item => item.name === valB);
                    valA = tA ? tA.temple_name : (a["temple.temple_name"] || a.temple_name || valA);
                    valB = tB ? tB.temple_name : (b["temple.temple_name"] || b.temple_name || valB);
                } else if (field === "donor") {
                    const dA = donors?.find(item => item.name === valA);
                    const dB = donors?.find(item => item.name === valB);
                    valA = dA ? dA.donor_name : valA;
                    valB = dB ? dB.donor_name : valB;
                } else if (field === "room") {
                    const rA = rooms?.find(item => item.name === valA);
                    const rB = rooms?.find(item => item.name === valB);
                    valA = rA ? rA.room_number : valA;
                    valB = rB ? rB.room_number : valB;
                }

                if (valA === valB) continue;

                if (valA === undefined || valA === null) return order === 'asc' ? -1 : 1;
                if (valB === undefined || valB === null) return order === 'asc' ? 1 : -1;

                const numA = Number(valA);
                const numB = Number(valB);
                if (!isNaN(numA) && !isNaN(numB) && typeof valA !== "boolean" && typeof valB !== "boolean") {
                    return order === 'asc' ? numA - numB : numB - numA;
                }

                const strA = String(valA).toLowerCase();
                const strB = String(valB).toLowerCase();
                const compareResult = strA.localeCompare(strB);

                if (compareResult !== 0) {
                    return order === 'asc' ? compareResult : -compareResult;
                }
            }
            return 0;
        });
    }, [enrichedData, appliedSorters, temples, donors, rooms]);

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

    const visibleColumns = customizedColumns.length > 0
        ? customizedColumns.filter(c => c.visible !== false)
        : (columns || []);

    const processedColumns = React.useMemo(() => {
        return visibleColumns.map(col => {
            if (col.dataIndex === "temple") {
                return {
                    ...col,
                    render: (text) => {
                        if (!text) return <span className="text-gray-400 text-xs italic">Global</span>;
                        const t = temples?.find(item => item.name === text);
                        const name = t ? t.temple_name : text;
                        const config = getTagConfig("temple admin");
                        return (
                            <span style={{ whiteSpace: "nowrap" }}>
                                <Tag className={`tag-glass ${config.glassClass} font-bold rounded-full`}>
                                    {name}
                                </Tag>
                            </span>
                        );
                    }
                };
            }
            if (col.dataIndex === "reference_name") {
                return {
                    ...col,
                    render: (text, record) => {
                        if (!text) return "—";
                        if (record.reference_type === "Donation") {
                            const d = donations?.find(item => item.name === text);
                            return d
                                ? `${d.donor_name || 'Anonymous'} (₹${parseFloat(d.total_amount).toFixed(2)}) - ${text}`
                                : text;
                        }
                        return text;
                    }
                };
            }
            if (col.dataIndex === "donor") {
                return {
                    ...col,
                    render: (text) => {
                        if (!text) return "—";
                        const d = donors?.find(item => item.name === text);
                        return d ? d.donor_name : text;
                    }
                };
            }
            if (col.dataIndex === "room") {
                return {
                    ...col,
                    render: (text) => {
                        if (!text) return "—";
                        const r = rooms?.find(item => item.name === text);
                        return r ? `Room ${r.room_number}` : text;
                    }
                };
            }
            return col;
        });
    }, [visibleColumns, temples, donations, donors, rooms]);

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
        <ViewContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

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
                    appliedSorters={appliedSorters}
                    onApplySorters={handleApplySorters}
                    savedViews={savedViews}
                    onRefreshViews={fetchSavedViews}
                    customizedColumns={customizedColumns}
                    onSaveColumns={handleSaveColumns}
                />

                {allowFilter && savedViews.length > 0 && (
                    <SavedViewsBar
                        views={savedViews}
                        appliedFilters={appliedFilters}
                        onSelectView={(viewObj) => {
                            setAppliedFilters(viewObj.rawRows || []);
                            handleApplySorters(viewObj.sorters || []);
                        }}
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

                {allowFilter && (
                    <ActiveFiltersBar
                        appliedFilters={appliedFilters}
                        columns={columns}
                        onApplyFilters={setAppliedFilters}
                    />
                )}

                <CommonTable
                    columns={processedColumns}
                    dataSource={sortedData}
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
            </div>

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
                    destroyOnHidden
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
                                Applied Filters Preview:
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                                {editModalFilters.filter(row => row.field && row.operator && row.value !== "").map((row, idx) => {
                                    const col = columns?.find(c => c.dataIndex === row.field);
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
                                            style={{
                                                padding: "4px 12px",
                                                borderRadius: "16px",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                backgroundColor: "#f4f4f5",
                                                color: "#27272a",
                                                border: "1px solid #e4e4e7",
                                                display: "inline-flex",
                                                alignItems: "center"
                                            }}
                                        >
                                            <span style={{ color: "#71717a", marginRight: "4px" }}>{fieldLabel}</span>
                                            <span style={{ color: "#a1a1aa", marginRight: "4px", fontSize: "11px" }}>{row.operator}</span>
                                            <strong style={{ color: "#09090b" }}>{displayVal}</strong>
                                        </Tag>
                                    );
                                })}
                                {editModalFilters.filter(row => row.field && row.operator && row.value !== "").length === 0 && (
                                    <span style={{ fontSize: "13px", color: "#a1a1aa", fontStyle: "italic" }}>No filters configured</span>
                                )}
                            </div>
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
                                        <div key={index} className="filter-row">
                                            <Select
                                                placeholder="Filter field"
                                                value={row.field}
                                                onChange={(val) => updateEditFilterRow(index, "field", val)}
                                                className="filter-select-field h-9 font-medium"
                                                options={filterableColumns.map(col => ({
                                                    label: col.title,
                                                    value: col.dataIndex
                                                }))}
                                            />

                                            <Select
                                                placeholder="Filter relation"
                                                value={row.operator}
                                                onChange={(val) => updateEditFilterRow(index, "operator", val)}
                                                className="filter-select-relation h-9 font-medium"
                                                disabled={!row.field}
                                                options={row.field ? relationOptions : []}
                                            />

                                            {selectedCol?.filterType === "select" ? (
                                                <Select
                                                    placeholder="Select value"
                                                    value={row.value || undefined}
                                                    onChange={(val) => updateEditFilterRow(index, "value", val)}
                                                    className="filter-value-input h-9 font-medium"
                                                    disabled={!row.operator}
                                                    options={selectedCol.filterOptions}
                                                />
                                            ) : (
                                                <Input
                                                    placeholder="Value"
                                                    type={selectedCol?.filterType === "number" ? "number" : "text"}
                                                    value={row.value}
                                                    onChange={(e) => updateEditFilterRow(index, "value", e.target.value)}
                                                    className="filter-value-input h-9 font-medium"
                                                    disabled={!row.operator}
                                                />
                                            )}

                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => removeEditFilterRow(index)}
                                                className="filter-delete-btn"
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
            {/* </div> */}
        </ViewContainer>
    );
};

export default ListingPage;
