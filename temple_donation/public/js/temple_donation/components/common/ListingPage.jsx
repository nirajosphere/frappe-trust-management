import React, { useEffect, useState } from "react";
import { Spin, Alert, Modal, message } from "antd";
import { useFrappeGetDocList, useFrappeDeleteDoc } from "../../hooks/useFrappe";
import CommonTable from "./CommonTable";
import PageHeader from "./PageHeader";
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
    addLabel
}) => {
    // Fetch data
    const { data, loading, error, mutate } = useFrappeGetDocList(doctype, {
        fields: fields,
        filters: filters,
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
            />
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
        </div>
    );
};

export default ListingPage;
