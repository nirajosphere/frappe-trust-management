import React from "react";
import { Typography, Tag } from "antd";

const { Text } = Typography;

export const donationColumns = [
    {
        title: 'Donation ID',
        dataIndex: 'name',
        key: 'name',
        width: 150,
        render: (text) => <Text copyable>{text}</Text>
    },
    {
        title: 'Donor',
        dataIndex: 'donor_name',
        key: 'donor_name',
        render: (text) => <Text strong>{text}</Text>,
    },
    {
        title: 'Temple',
        dataIndex: 'temple',
        key: 'temple',
    },
    {
        title: 'Amount',
        dataIndex: 'total_amount',
        key: 'total_amount',
        render: (val) => <Text type="success" strong>₹{Number(val || 0).toLocaleString()}</Text>,
        sorter: (a, b) => (a.total_amount || 0) - (b.total_amount || 0),
    },
    {
        title: 'Payment Mode',
        dataIndex: 'payment_mode',
        key: 'payment_mode',
        render: (mode) => (
            <Tag color={mode === 'Cash' ? 'green' : 'blue'}>{mode}</Tag>
        ),
    },
];
