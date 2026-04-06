import React from "react";
import { Typography } from "antd";

const { Text } = Typography;

export const templeColumns = [
    {
        title: 'ID',
        dataIndex: 'name',
        key: 'name',
        width: 150,
        render: (text) => <Text copyable>{text}</Text>
    },
    {
        title: 'Temple Name',
        dataIndex: 'temple_name',
        key: 'temple_name',
        render: (text) => <Text strong>{text}</Text>,
        sorter: (a, b) => (a.temple_name || '').localeCompare(b.temple_name || ''),
    },
    {
        title: 'City',
        dataIndex: 'city',
        key: 'city',
    },
    {
        title: 'State',
        dataIndex: 'state',
        key: 'state',
    },
    {
        title: 'Registration No',
        dataIndex: 'trust_registration_no',
        key: 'trust_registration_no',
    },
];
