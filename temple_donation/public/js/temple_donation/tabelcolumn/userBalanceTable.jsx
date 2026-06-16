import React from "react";
import { Space, Avatar, Typography, Tag } from "antd";
import { WalletOutlined, UserOutlined } from "@ant-design/icons";
import { getTagConfig } from "../utils/tagUtils";

const { Text } = Typography;

export const userBalanceColumns = [
    {
        title: 'USER',
        dataIndex: 'full_name',
        key: 'full_name',
        width: 250,
        render: (text, record) => {
            const name = text || record.user_name || "Unknown";
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
                            {record.user_name}
                        </span>
                    </div>
                </div>
            );
        }
    },

    {
        title: "ROLE",
        dataIndex: "custom_user_role",
        key: "custom_user_role",
        width: 140,
        render: (text) => {
            const config = getTagConfig(text);
            return (
                <Tag className={`tag-glass ${config.glassClass} font-bold rounded-full`}>
                    {config.label}
                </Tag>
            );
        }
    },

    {
        title: "TEMPLES",
        dataIndex: "custom_select_temple",
        key: "custom_select_temple",
        width: 180,
        render: (temples) => (
            <div className="flex flex-wrap gap-1">
                {temples && temples.length > 0 ? (
                    temples.slice(0, 2).map((t, index) => (
                        <Tag
                            key={index}
                            className="tag-glass tag-glass-gray !m-0"
                        >
                            {t.temple_name || t.temple}
                        </Tag>
                    ))
                ) : (
                    <span className="text-gray-400 text-xs italic">
                        Not Assigned
                    </span>
                )}
            </div>
        )
    },

    {
        title: 'OPENING BALANCE',
        dataIndex: 'opening_balance',
        key: 'opening_balance',
        align: 'right',
        width: 180,
        render: (value) => (
            <div className="flex items-center justify-end gap-2 pr-4">
                <Text strong className="text-zinc-900 text-base">
                    ₹{Number(value || 0).toLocaleString()}
                </Text>
            </div>
        )
    }
];