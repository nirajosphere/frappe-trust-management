import React from "react";
import { Typography, Tag } from "antd";

const { Text } = Typography;

export const roomColumns = [
    {
        title: "Room No.",
        dataIndex: "room_number",
        key: "room_number",
        width: 120,
        render: (text) => <Text strong>{text}</Text>,
    },
    {
        title: "Temple",
        dataIndex: "temple",
        key: "temple",
    },
    {
        title: "Room Type",
        dataIndex: "room_type",
        key: "room_type",
        width: 120,
        render: (type) => {
            const colors = { AC: "blue", "Non-AC": "default", Hall: "purple" };
            return <Tag color={colors[type] || "default"}>{type}</Tag>;
        },
    },
    {
        title: "Capacity",
        dataIndex: "capacity",
        key: "capacity",
        width: 100,
    },
    {
        title: "Price / Day",
        dataIndex: "price_per_day",
        key: "price_per_day",
        width: 130,
        render: (val) => <Text strong>₹{Number(val || 0).toLocaleString()}</Text>,
        sorter: (a, b) => (a.price_per_day || 0) - (b.price_per_day || 0),
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 130,
        render: (status) => {
            const colors = { Available: "green", Occupied: "red", Maintenance: "orange" };
            return <Tag color={colors[status] || "default"}>{status}</Tag>;
        },
    },
];
