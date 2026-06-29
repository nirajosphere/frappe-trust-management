import React from "react";
import { Typography, Tag } from "antd";

const { Text } = Typography;

export const buildingColumns = [
    {
        title: 'Building Name',
        dataIndex: 'building_name',
        key: 'building_name',
        render: (text) => <Text strong>{text}</Text>,
        sorter: (a, b) => (a.building_name || '').localeCompare(b.building_name || ''),
        filterable: true,
        filterType: "text"
    },
    {
        title: 'Building Code',
        dataIndex: 'building_code',
        key: 'building_code',
        render: (text) => <Text>{text}</Text>,
        sorter: (a, b) => (a.building_code || '').localeCompare(b.building_code || ''),
        filterable: true,
        filterType: "text"
    },
    {
        title: 'Temple',
        dataIndex: 'temple',
        key: 'temple',
        filterable: true,
        filterType: "text"
    },
    {
        title: 'Total Floors',
        dataIndex: 'total_floors',
        key: 'total_floors',
        sorter: (a, b) => (a.total_floors || 0) - (b.total_floors || 0)
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
            const color = status === "Active" ? "green" : "red";
            return <Tag color={color}>{status}</Tag>;
        },
        filterable: true,
        filterType: "select",
        filterOptions: [
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" }
        ]
    }
];
