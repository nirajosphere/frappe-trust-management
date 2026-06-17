import React from "react";
import { Typography, Tag } from "antd";

const { Text } = Typography;

export const donationTypeColumns = [
    // {
    //     title: 'ID',
    //     dataIndex: 'name',
    //     key: 'name',
    //     width: 150,
    //     render: (text) => <Text copyable>{text}</Text>
    // },
    {
        title: 'Donation Image',
        dataIndex: 'donation_image',
        key: 'donation_image',
        render: (img) => {
            if (!img) return '-';
            const src = img.startsWith('http') ? img : `${window.location.origin}${img.startsWith('/') ? '' : '/'}${img}`;
            return <img src={src} alt="Donation" className="w-10 h-10 object-cover" />;
        }
    },
    {
        title: 'Donation Type',
        dataIndex: 'donation_type',
        key: 'donation_type',
        render: (text) => <Text strong>{text}</Text>,
        sorter: (a, b) => (a.donation_type || '').localeCompare(b.donation_type || ''),
    },
    // {
    //     title: 'Donation Type Code',
    //     dataIndex: 'donation_type_code',
    //     key: 'donation_type_code',
    //     render: (text) => <Tag color="orange">{text}</Tag>,
    // },
    // {
    //     title: 'Temple',
    //     dataIndex: 'temple',
    //     key: 'temple',
    // },
    {
        title: 'Default Amount',
        dataIndex: 'default_amount',
        key: 'default_amount',
        render: (val) => val ? `₹${Number(val).toLocaleString()}` : '-'
    },
];
