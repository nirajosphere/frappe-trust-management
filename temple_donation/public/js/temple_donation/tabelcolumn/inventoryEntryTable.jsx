import React from "react";
import { Typography, Tag } from "antd";

const { Text } = Typography;

export const inventoryEntryColumns = [
    {
        title: "Entry ID",
        dataIndex: "name",
        key: "name",
        width: 150,
        render: (text) => <Text copyable>{text}</Text>
    },
    {
        title: "Entry Type",
        dataIndex: "entry_type",
        key: "entry_type",
        width: 100,
        render: (type) => (
            <Tag color={type === "IN" ? "green" : "volcano"}>{type}</Tag>
        ),
    },
    {
        title: "Reference",
        dataIndex: "reference_type",
        key: "reference_type",
        width: 120,
        render: (type) => <Tag>{type || "Manual"}</Tag>,
    },
    {
        title: "Temple",
        dataIndex: "temple",
        key: "temple",
    },
    {
        title: "Posting Date",
        dataIndex: "posting_date",
        key: "posting_date",
        width: 180,
    },
];
