import React from "react";
import { Typography, Tag } from "antd";
import { getTagConfig } from "../utils/tagUtils";

const { Text } = Typography;

export const roomColumns = [
    {
        title: "Room No.",
        dataIndex: "room_number",
        key: "room_number",
        width: 150,
        render: (text) => (
            <span style={{ whiteSpace: "nowrap" }}>
                <Text strong>{text}</Text>
            </span>
        )
    },
    {
        title: "Temple",
        dataIndex: "temple",
        key: "temple",
        width: 180,
        render: (temple) => {
            if (!temple) return <span className="text-gray-400 text-xs italic">Global</span>;
            const config = getTagConfig("temple admin");
            return (
                <Tag className={`tag-glass ${config.glassClass} font-bold rounded-full`}>
                    {temple}
                </Tag>
            );
        }
    },
    {
        title: "Room Type",
        dataIndex: "room_type",
        key: "room_type",
        width: 120,
        render: (type) => {
            const matchedRole = type === "AC" ? "super admin" : type === "Non-AC" ? "default" : "manager";
            const config = getTagConfig(matchedRole);
            return (
                <Tag className={`tag-glass ${config.glassClass} font-bold rounded-full`}>
                    {type}
                </Tag>
            );
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
            const matchedStatus = status === "Available" ? "active" : status === "Occupied" ? "inactive" : "default";
            const config = getTagConfig(matchedStatus);
            return (
                <Tag className={`tag-glass ${config.glassClass} font-bold rounded-full`}>
                    {status}
                </Tag>
            );
        },
    },
];
