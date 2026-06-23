import React from "react";
import { Typography, Tag } from "antd";

const { Text } = Typography;

export const donationColumns = [
    // {
    //     title: 'Donation ID',
    //     dataIndex: 'name',
    //     key: 'name',
    //     width: 150,
    //     render: (text) => <Text copyable>{text}</Text>
    // },
    {
        title: 'Donor',
        dataIndex: 'donor_name',
        key: 'donor_name',
        render: (text) => <Text strong>{text}</Text>,
        filterable: true,
        filterType: "text"
    },
    {
        title: 'Temple',
        dataIndex: 'temple',
        key: 'temple',
        render: (_, record) => <Text>{record["temple.temple_name"] || record.temple_name}</Text>,
        filterable: true,
        filterField: "temple.temple_name",
        filterType: "text"
    },
    {
        title: 'Amount',
        dataIndex: 'total_amount',
        key: 'total_amount',
        render: (val) => <Text type="success" strong>₹{Number(val || 0).toLocaleString()}</Text>,
        sorter: (a, b) => (a.total_amount || 0) - (b.total_amount || 0),
        filterable: true,
        filterType: "number"
    },
    {
        title: 'Payment Mode',
        dataIndex: 'payment_mode',
        key: 'payment_mode',
        render: (mode) => (
            <Tag
                className={`tag-glass tag-glass-${mode === 'Cash' ? 'green' : 'blue'}`}
                color={mode === 'Cash' ? 'green' : 'blue'}
            >
                {mode}
            </Tag>
        ),
        filterable: true,
        filterType: "select",
        filterOptions: [
            { label: "Cash", value: "Cash" },
            { label: "Online", value: "Online" },
            { label: "Cheque", value: "Cheque" },
            { label: "UPI", value: "UPI" },
            { label: "Card", value: "Card" }
        ]
    },
    {
        title: 'Receiver',
        dataIndex: 'cashier',
        key: 'cashier',
        render: (text) => <Text>{text}</Text>,
        filterable: true,
        filterType: "text"
    },
];
