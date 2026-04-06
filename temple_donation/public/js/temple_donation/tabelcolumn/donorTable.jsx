import React from "react";
import { Typography } from "antd";

const { Text } = Typography;

export const donorColumns = [
    {
        title: 'Donor ID',
        dataIndex: 'name',
        key: 'name',
        width: 150,
        render: (text) => <Text copyable>{text}</Text>
    },
    {
        title: 'Name',
        dataIndex: 'donor_name',
        key: 'donor_name',
        render: (text) => <Text strong>{text}</Text>,
        sorter: (a, b) => (a.donor_name || '').localeCompare(b.donor_name || ''),
    },
    {
        title: 'Mobile Number',
        dataIndex: 'mobile_number',
        key: 'mobile_number',
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: 'City',
        dataIndex: 'city',
        key: 'city',
    },
    {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        ellipsis: true,
        render: (text) => text || <Text type="secondary">-</Text>
    },
];
