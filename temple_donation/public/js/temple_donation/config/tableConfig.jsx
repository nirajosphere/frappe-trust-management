import React from "react";
import { Typography, Tag } from "antd";

const { Text } = Typography;

/**
 * Centralized column definitions for Ant Design Table.
 * Separated by entity for easier importing and better typing.
 */

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
        sorter: (a, b) => a.donor_name.localeCompare(b.donor_name),
    },
    {
        title: 'Mobile Number',
        dataIndex: 'mobile_number',
        key: 'mobile_number',
    },
    {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
        ellipsis: true,
        render: (text) => text || <Text type="secondary">-</Text>
    },
];

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
        sorter: (a, b) => a.temple_name.localeCompare(b.temple_name),
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

export const donationTypeColumns = [
    {
        title: 'ID',
        dataIndex: 'name',
        key: 'name',
        width: 150,
        render: (text) => <Text copyable>{text}</Text>
    },
    {
        title: 'Donation Type',
        dataIndex: 'donation_type',
        key: 'donation_type',
        render: (text) => <Text strong>{text}</Text>,
        sorter: (a, b) => a.donation_type.localeCompare(b.donation_type),
    },
    {
        title: 'Donation Type Code',
        dataIndex: 'donation_type_code',
        key: 'donation_type_code',
        render: (text) => <Tag color="orange">{text}</Tag>,
    },
    {
        title: 'Temple',
        dataIndex: 'temple',
        key: 'temple',
    },
    {
        title: 'Default Amount',
        dataIndex: 'default_amount',
        key: 'default_amount',
        render: (val) => val ? `₹${Number(val).toLocaleString()}` : '-'
    },
    {
        title: 'Image',
        dataIndex: 'donation_image',
        key: 'donation_image',
        render: (img) => img ? <img src={img} alt="Donation" style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }} /> : '-'
    },
];

