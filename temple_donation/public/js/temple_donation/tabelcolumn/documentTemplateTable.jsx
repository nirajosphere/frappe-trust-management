import React from "react";
import { Typography, Tag } from "antd";

const { Text } = Typography;

export const documentTemplateColumns = [
    {
        title: "Template Name",
        dataIndex: "template_name",
        key: "template_name",
        render: (text) => <Text strong>{text}</Text>,
        sorter: (a, b) => (a.template_name || "").localeCompare(b.template_name || ""),
        filterable: true,
        filterType: "text"
    },
    {
        title: "Temple",
        dataIndex: "temple",
        key: "temple",
        filterable: true,
        filterType: "text"
    },
    {
        title: "Template Type",
        dataIndex: "template_type",
        key: "template_type",
        filterable: true,
        filterType: "select",
        filterOptions: [
            { label: "Donation Receipt", value: "Donation Receipt" },
            { label: "Room Receipt", value: "Room Receipt" },
            { label: "Inventory Receipt", value: "Inventory Receipt" },
            { label: "Expense Voucher", value: "Expense Voucher" },
            { label: "Purchase Receipt", value: "Purchase Receipt" },
            { label: "Visitor Pass", value: "Visitor Pass" },
            { label: "Donation Certificate", value: "Donation Certificate" },
            { label: "Custom", value: "Custom" }
        ]
    },
    {
        title: "Paper Size",
        dataIndex: "paper_size",
        key: "paper_size",
        filterable: true,
        filterType: "select",
        filterOptions: [
            { label: "A4", value: "A4" },
            { label: "A5", value: "A5" },
            { label: "Thermal 80mm", value: "Thermal 80mm" },
            { label: "Thermal 58mm", value: "Thermal 58mm" }
        ]
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => {
            const color = status === "Active" ? "green" : "red";
            return <Tag color={color}>{status || "Active"}</Tag>;
        },
        filterable: true,
        filterType: "select",
        filterOptions: [
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" }
        ]
    },
    {
        title: "Default",
        dataIndex: "default_template",
        key: "default_template",
        render: (isDefault) => {
            return isDefault ? <Tag color="blue">Default</Tag> : <Text type="secondary">-</Text>;
        },
        filterable: true,
        filterType: "select",
        filterOptions: [
            { label: "Default", value: 1 },
            { label: "Non-Default", value: 0 }
        ]
    }
];
