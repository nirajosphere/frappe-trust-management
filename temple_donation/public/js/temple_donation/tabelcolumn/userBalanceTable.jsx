import React from "react";
import { Typography, Space } from "antd";
import { UserOutlined, WalletOutlined } from "@ant-design/icons";

const { Text } = Typography;

export const userBalanceColumns = [
    {
        title: 'User Name',
        dataIndex: 'full_name',
        key: 'full_name',
        render: (text, record) => (
            <Space>
                <UserOutlined className="text-zinc-400" />
                <div>
                    <div className="font-bold text-zinc-900">{text || record.user_name}</div>
                    <div className="text-xs text-zinc-400 font-medium">{record.user_name}</div>
                </div>
            </Space>
        )
    },
    {
        title: 'Opening Balance (Cash Only)',
        dataIndex: 'opening_balance',
        key: 'opening_balance',
        render: (value) => (
            <div className="flex items-center gap-2">
                <WalletOutlined className="text-zinc-400" />
                <span className="font-bold text-lg text-zinc-900">
                    ₹{value?.toLocaleString() || '0'}
                </span>
            </div>
        )
    },
];
