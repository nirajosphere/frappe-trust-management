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
        width: 180,
        render: (text) => (
            <span style={{ whiteSpace: "nowrap" }}>
                <Text copyable>{text}</Text>
            </span>
        )
    },
    {
        title: "Entry Type",
        dataIndex: "entry_type",
        key: "entry_type",
        width: 100,
        render: (type) => {
            const config = getTagConfig(type === "IN" ? "active" : "inactive");
            return (
                <Tag className={`tag-glass ${config.glassClass} font-bold rounded-full`}>
                    {type}
                </Tag>
            );
        },
    },
    {
        title: "Reference Type",
        dataIndex: "reference_type",
        key: "reference_type",
        width: 120,
        render: (type) => {
            const config = getTagConfig(type || "Manual");
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
        width: 250,
        render: (text) => text || "—"
    },
    {
        title: "Temple",
        dataIndex: "temple",
        key: "temple",
        filterField: "temple.temple_name",
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
        title: "Posting Date",
        dataIndex: "posting_date",
        key: "posting_date",
        width: 220,
        render: (date) => (
            <span style={{ whiteSpace: "nowrap" }}>
                {date ? dayjs(date).format("ddd, DD MMM YYYY, hh:mm A") : "—"}
            </span>
        )
    },
];
