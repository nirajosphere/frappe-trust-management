import React from "react";
import { Typography, Tag } from "antd";
import { getTagConfig } from "../utils/tagUtils";

const { Text } = Typography;

export const itemColumns = [
    {
        title: "Item Code",
        dataIndex: "item_code",
        key: "item_code",
        width: 130,
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
        sorter: (a, b) => (a.item_name || "").localeCompare(b.item_name || ""),
    },
    {
        title: "Category",
        dataIndex: "item_category",
        key: "item_category",
        width: 140,
        render: (text) => {
            if (!text) return "—";
            const config = getTagConfig("default");
            return (
                <Tag className={`tag-glass ${config.glassClass} font-bold rounded-full`}>
                    {text}
                </Tag>
            );
        }
    },
    {
        title: "Store Location",
        dataIndex: "store_location",
        key: "store_location",
        width: 150,
        render: (text) => {
            if (!text) return "—";
            const config = getTagConfig("manager");
            return (
                <Tag className={`tag-glass ${config.glassClass} font-bold rounded-full`}>
                    {text}
                </Tag>
            );
        }
    },
    {
        title: "Unit",
        dataIndex: "unit",
        key: "unit",
        width: 90,
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
        title: "Trust Name",
        dataIndex: "temple",
        key: "temple",
        width: 160,
    },
    {
        title: "Valuation (₹)",
        dataIndex: "valuation_rate",
        key: "valuation_rate",
        width: 120,
        align: "right",
        render: (val) => {
            const num = Number(val || 0);
            return <Text className="font-semibold">₹{num.toFixed(2)}</Text>;
        },
        sorter: (a, b) => (a.valuation_rate || 0) - (b.valuation_rate || 0),
    },
    {
        title: "Stock",
        dataIndex: "total_stock",
        key: "total_stock",
        width: 130,
        render: (val, record) => {
            const stock = Number(val || 0);
            const threshold = Number(record.minimum_stock || 0);
            let status = "active";
            let label = `${stock} ${record.unit || "Nos"}`;

            if (stock <= 0) {
                status = "inactive";
                label = `${stock} ${record.unit || "Nos"}`;
            } else if (stock < threshold) {
                status = "super admin";
                label = `Low (${stock})`;
            }

            const config = getTagConfig(status);
            return (
                <Tag className={`tag-glass ${config.glassClass} font-bold rounded-full`}>
                    {label}
                </Tag>
            );
        },
        sorter: (a, b) => (a.total_stock || 0) - (b.total_stock || 0),
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        render: (val) => {
            const isActive = val === "Active";
            const config = getTagConfig(isActive ? "active" : "inactive");
            return (
                <Tag className={`tag-glass ${config.glassClass} font-bold rounded-full`}>
                    {isActive ? "Active" : "Inactive"}
                </Tag>
            );
        }
    }
];
