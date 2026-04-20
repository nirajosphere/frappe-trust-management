import React from "react";
import { Typography, Tag } from "antd";

const { Text } = Typography;

export const itemColumns = [
    {
        title: "Item Code",
        dataIndex: "item_code",
        key: "item_code",
        width: 120,
        render: (text) => <Text copyable>{text || "—"}</Text>
    },
    {
        title: "Item Name",
        dataIndex: "item_name",
        key: "item_name",
        render: (text) => <Text strong>{text}</Text>,
    },
    {
        title: "Unit",
        dataIndex: "unit",
        key: "unit",
        width: 100,
        render: (unit) => <Tag>{unit}</Tag>,
    },
    {
        title: "Temple",
        dataIndex: "temple",
        key: "temple",
        width: 160,
    },
    {
        title: "Stock",
        dataIndex: "total_stock",
        key: "total_stock",
        width: 120,
        render: (val) => {
            const stock = Number(val || 0);
            const color = stock <= 0 ? "red" : stock < 10 ? "orange" : "green";
            return <Tag color={color}>{stock}</Tag>;
        },
        sorter: (a, b) => (a.total_stock || 0) - (b.total_stock || 0),
    },
];
