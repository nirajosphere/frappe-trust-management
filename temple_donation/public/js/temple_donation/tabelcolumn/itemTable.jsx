import React from "react";
import { Typography, Tag } from "antd";
import { getTagConfig } from "../utils/tagUtils";

const { Text } = Typography;

export const itemColumns = [
    {
        title: "Item Code",
        dataIndex: "item_code",
        key: "item_code",
        width: 150,
        render: (text) => (
            <span style={{ whiteSpace: "nowrap" }}>
                <Text copyable>{text || "—"}</Text>
            </span>
        )
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
        render: (unit) => {
            const config = getTagConfig(unit || "Default");
            return (
                <Tag className={`tag-glass ${config.glassClass} font-bold rounded-full`}>
                    {config.label}
                </Tag>
            );
        },
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
        title: "Stock",
        dataIndex: "total_stock",
        key: "total_stock",
        width: 120,
        render: (val) => {
            const stock = Number(val || 0);
            const status = stock <= 0 ? "inactive" : stock < 10 ? "super admin" : "active";
            const config = getTagConfig(status);
            return (
                <Tag className={`tag-glass ${config.glassClass} font-bold rounded-full`}>
                    {stock}
                </Tag>
            );
        },
        sorter: (a, b) => (a.total_stock || 0) - (b.total_stock || 0),
    },
];
