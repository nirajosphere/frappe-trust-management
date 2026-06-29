import React from 'react';
import { Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { formatDateTime } from '../utils/ledgerUtils';

const { Text } = Typography;

export const originalBalanceColsBase = [
    {
        title: 'User',
        dataIndex: 'full_name',
        key: 'full_name',
        width: 250,
        filterType: 'string'
    },
    {
        title: "Role",
        dataIndex: "custom_user_role",
        key: "custom_user_role",
        width: 140,
        filterType: 'select',
        filterOptions: [
            { value: "cashier", label: "Cashier" },
            { value: "temple admin", label: "Trust Admin" }
        ]
    },
    {
        title: "Trusts",
        dataIndex: "custom_select_temple",
        key: "custom_select_temple",
        width: 180,
        filterType: 'string'
    },
    {
        title: 'Opening Balance',
        dataIndex: 'opening_balance',
        key: 'opening_balance',
        align: 'right',
        width: 180,
        filterType: 'number'
    }
];

export const originalLogColsBase = [
    {
        title: 'Cashier',
        dataIndex: 'user_name',
        key: 'user_name',
        width: 250,
        filterType: 'string',
        render: (text, record) => {
            const name = text || record.user || "Unknown";
            const initials = name.substring(0, 2).toUpperCase();

            return (
                <div className="flex items-center gap-3">
                    <Avatar
                        src={record.user_image}
                        size={26}
                        className="bg-zinc-100 text-zinc-500 font-semibold text-[11px] border border-zinc-200 shrink-0"
                    >
                        {initials}
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-gray-800 text-sm">
                            {name}
                        </span>
                        <span className="text-xs text-gray-400 truncate">
                            {record.user}
                        </span>
                    </div>
                </div>
            );
        }
    },
    {
        title: 'Amount Handed Over',
        dataIndex: 'opening_balance',
        key: 'opening_balance',
        align: 'right',
        width: 240,
        filterType: 'number',
        render: (value) => (
            <div className="flex items-center justify-end gap-2 pr-4">
                <Text strong className="text-green-600 text-base">
                    ₹{Number(value || 0).toLocaleString()}
                </Text>
            </div>
        )
    },
    {
        title: 'Latest Hand Over',
        dataIndex: 'reset_date',
        key: 'reset_date',
        width: 200,
        filterType: 'date',
        render: (value) => (
            <span className="text-sm font-medium text-gray-600">
                {formatDateTime(value)}
            </span>
        )
    },
    {
        title: 'Latest Collector',
        dataIndex: 'collector_name',
        key: 'collector_name',
        width: 220,
        filterType: 'string',
        render: (text, record) => (
            <div className="flex items-center gap-2">
                <Avatar size="small" icon={<UserOutlined />} className="bg-zinc-800" />
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-800">{text}</span>
                    <span className="text-[10px] text-zinc-400">{record.owner}</span>
                </div>
            </div>
        )
    }
];

export const activeDonationColumns = [
    {
        title: "Donation Id",
        dataIndex: "name",
        key: "name",
        render: (text) => (
            <a 
                onClick={() => {
                    if (typeof frappe !== "undefined") {
                        frappe.set_route("temple-donation", "donations", "view", text);
                    }
                }}
                className="font-mono text-xs font-semibold text-zinc-600 hover:text-zinc-950 underline cursor-pointer"
            >
                {text}
            </a>
        )
    },
    {
        title: "Donor",
        dataIndex: "donor_name",
        key: "donor_name",
        render: (text) => <span className="font-semibold text-sm text-zinc-800">{text || "Anonymous"}</span>
    },
    {
        title: "Trust",
        dataIndex: "temple_name",
        key: "temple_name",
        render: (text) => <span className="text-xs text-zinc-500 font-medium">{text}</span>
    },
    {
        title: "Date & Time",
        dataIndex: "creation",
        key: "creation",
        render: (val) => <span className="text-xs text-zinc-500">{formatDateTime(val)}</span>
    },
    {
        title: "Amount",
        dataIndex: "total_amount",
        key: "total_amount",
        align: "right",
        render: (val) => (
            <span className="font-bold text-zinc-900 pr-2">
                ₹{Number(val || 0).toLocaleString("en-IN")}
            </span>
        )
    }
];
