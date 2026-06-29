import React from "react";
import { Typography, Tag } from "antd";

const { Text } = Typography;

export const roomTypeColumns = [
    {
        title: 'Room Type Name',
        dataIndex: 'room_type_name',
        key: 'room_type_name',
        render: (text) => <Text strong>{text}</Text>,
        sorter: (a, b) => (a.room_type_name || '').localeCompare(b.room_type_name || ''),
        filterable: true,
        filterType: "text"
    },
    {
        title: 'Default Capacity',
        dataIndex: 'default_capacity',
        key: 'default_capacity',
        sorter: (a, b) => (a.default_capacity || 0) - (b.default_capacity || 0)
    },
    {
        title: 'Default Price Per Day',
        dataIndex: 'default_price_per_day',
        key: 'default_price_per_day',
        render: (val) => `₹${parseFloat(val || 0).toFixed(2)}`,
        sorter: (a, b) => (a.default_price_per_day || 0) - (b.default_price_per_day || 0)
    },
    {
        title: 'Active',
        dataIndex: 'active',
        key: 'active',
        render: (active) => {
            const label = active ? "Yes" : "No";
            const color = active ? "green" : "red";
            return <Tag color={color}>{label}</Tag>;
        },
        filterable: true,
        filterType: "select",
        filterOptions: [
            { label: "Yes", value: 1 },
            { label: "No", value: 0 }
        ]
    },
    {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        filterable: true,
        filterType: "text"
    }
];
