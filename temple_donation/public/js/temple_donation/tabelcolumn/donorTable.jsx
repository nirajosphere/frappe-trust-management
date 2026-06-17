import React from "react";
import { Typography } from "antd";

const { Text } = Typography;

export const donorColumns = [
    {
        title: 'Donor ID',
        dataIndex: 'name',
        key: 'name',
        width: 180,
        render: (text) => <Text copyable style={{ whiteSpace: "nowrap" }}>{text}</Text>,
        filterable: true,
        filterType: "text"
    },
    {
        title: 'Name',
        dataIndex: 'donor_name',
        key: 'donor_name',
        render: (text) => <Text strong>{text}</Text>,
        sorter: (a, b) => (a.donor_name || '').localeCompare(b.donor_name || ''),
        filterable: true,
        filterType: "text"
    },
    {
        title: 'Mobile Number',
        dataIndex: 'mobile_number',
        key: 'mobile_number',
        filterable: true,
        filterType: "text"
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        render: (text) => text || <Text type="secondary">-</Text>,
        filterable: true,
        filterType: "text"
    },
    {
        title: 'City',
        dataIndex: 'city',
        key: 'city',
        render: (text) => text || <Text type="secondary">-</Text>,
        filterable: true,
        filterType: "text"
    },
    {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        ellipsis: true,
        render: (text) => text || <Text type="secondary">-</Text>,
        filterable: true,
        filterType: "text"
    },
];
