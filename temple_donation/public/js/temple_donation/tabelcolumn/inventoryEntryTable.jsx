import React from "react";
import { Typography, Tag } from "antd";
import dayjs from "dayjs";
import { getTagConfig } from "../utils/tagUtils";

const { Text } = Typography;

export const inventoryEntryColumns = [
    {
        title: "Entry ID",
        dataIndex: "name",
        key: "name",
        width: 160,
        render: (text) => (
            <span style={{ whiteSpace: "nowrap" }}>
                <Text copyable>{text}</Text>
            </span>
        )
    },
    {
        title: "Purpose",
        dataIndex: "entry_type",
        key: "entry_type",
        width: 130,
        render: (entry_type, record) => {
            let status = "default";
            let label = entry_type;
            if (entry_type === "Stock In" || entry_type === "IN") {
                status = "active";
                label = "Receipt";
            } else if (entry_type === "Stock Out" || entry_type === "OUT") {
                status = "inactive";
                label = "Issue";
            } else if (entry_type === "Stock Adjustment") {
                if (record.source_location && record.target_location) {
                    status = "manager";
                    label = "Transfer";
                } else {
                    status = "manager";
                    label = "Adjustment";
                }
            }
            
            const config = getTagConfig(status);
            return (
                <Tag className={`tag-glass ${config.glassClass} font-bold rounded-full`}>
                    {label || "Receipt"}
                </Tag>
            );
        },
    },
    {
        title: "Movement Type",
        dataIndex: "movement_type",
        key: "movement_type",
        width: 140,
        filterType: "select",
        filterOptions: [
            { label: "Internal", value: "Internal" },
            { label: "External", value: "External" }
        ],
        filterOperators: ["=", "!="]
    },
    {
        title: "Source Location",
        dataIndex: "source_location",
        key: "source_location",
        width: 150,
        render: (text) => text || <span className="text-zinc-400">—</span>
    },
    {
        title: "Target Location",
        dataIndex: "target_location",
        key: "target_location",
        width: 150,
        render: (text) => text || <span className="text-zinc-400">—</span>
    },
    {
        title: "Reference Type",
        dataIndex: "reference_type",
        key: "reference_type",
        width: 130,
        render: (type) => {
            if (!type) return <span className="text-zinc-400">—</span>;
            const config = getTagConfig(type);
            return (
                <Tag className={`tag-glass ${config.glassClass} font-bold rounded-full`}>
                    {config.label}
                </Tag>
            );
        },
    },
    {
        title: "Reference Name",
        dataIndex: "reference_name",
        key: "reference_name",
        render: (text) => text || <span className="text-zinc-400">—</span>
    },
    {
        title: "Trust Name",
        dataIndex: "temple",
        key: "temple",
        width: 160,
    },
    {
        title: "Posting Date",
        dataIndex: "posting_date",
        key: "posting_date",
        width: 200,
        render: (date) => (
            <span style={{ whiteSpace: "nowrap" }}>
                {date ? dayjs(date).format("ddd, DD MMM YYYY, hh:mm A") : "—"}
            </span>
        )
    },
];
