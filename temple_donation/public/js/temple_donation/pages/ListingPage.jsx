import React, { useState } from "react";
import { Spin, Alert, Modal, message } from "antd";
import { useFrappeGetDocList, useFrappeDeleteDoc } from "../hooks/useFrappe";
import CommonTable from "../components/common/CommonTable";
import PageHeader from "../components/common/PageHeader";
import { exportToCSV } from "../utils/exportUtils";

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
const ListingPage = ({ doctype, title, description, columns, basePath, fields = ["*"] }) => {
    // Fetch data
    const { data, loading, error, mutate } = useFrappeGetDocList(doctype, {
        fields: fields,
        limit: 100,
        orderBy: { field: 'modified', order: 'desc' }
    });

    const { deleteDoc } = useFrappeDeleteDoc();

    const [searchText, setSearchText] = useState("");

    const handleAdd = () => {
        if (typeof frappe !== "undefined" && basePath) {
            frappe.set_route("temple-donation", basePath, "new");
        }
    };

    const handleEdit = (record) => {
        if (typeof frappe !== "undefined" && basePath) {
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
                        message.success(`${doctype} deleted successfully!`);
                        mutate();
                    })
                    .catch((err) => {
                        message.error(err.message || "Failed to delete.");
                    });
            }
        });
    };

    const handleView = (record) => {
        if (typeof frappe !== "undefined" && basePath) {
            frappe.set_route("temple-donation", basePath, "view", record.name);
        }
    };

    const handlePrint = (record) => {
        window.print(); // Simple print trigger for now
    };

    const handleExport = () => {
        if (!data || data.length === 0) {
            message.warning("No data to export");
            return;
        }
        exportToCSV(data, columns, title);
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
                onAdd={handleAdd} 
                onExport={handleExport}
                onSearch={setSearchText}
                searchPlaceholder={`Search ${doctype}s...`}
                addLabel="Add New Record" 
            />
            <CommonTable
                columns={columns || []}
                dataSource={data}
                loading={loading}
                searchText={searchText}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onPrint={handlePrint}
            />
        </div>
    );
};

export default ListingPage;
