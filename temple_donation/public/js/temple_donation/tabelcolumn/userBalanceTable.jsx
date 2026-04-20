// import React from "react";
// import { Typography, Space } from "antd";
// import { UserOutlined, WalletOutlined } from "@ant-design/icons";

// const { Text } = Typography;

// export const userBalanceColumns = [
//     {
//         title: 'User Name',
//         dataIndex: 'full_name',
//         key: 'full_name',
//         render: (text, record) => (
//             <Space>
//                 <UserOutlined className="text-zinc-400" />
//                 <div>
//                     <div className="font-bold text-zinc-900">{text || record.user_name}</div>
//                     <div className="text-xs text-zinc-400 font-medium">{record.user_name}</div>
//                 </div>
//             </Space>
//         )
//     },
//     {
//         title: 'Opening Balance (Cash Only)',
//         dataIndex: 'opening_balance',
//         key: 'opening_balance',
//         render: (value) => (
//             <div className="flex items-center gap-2">
//                 <WalletOutlined className="text-zinc-400" />
//                 <span className="font-bold text-lg text-zinc-900">
//                     ₹{value?.toLocaleString() || '0'}
//                 </span>
//             </div>
//         )
//     },
// ];

import React from "react";
import { Space } from "antd";
import { WalletOutlined } from "@ant-design/icons";

export const userBalanceColumns = [
    {
        title: 'USER',
        dataIndex: 'full_name',
        key: 'full_name',
        width: 260,
        render: (text, record) => {
            const name = text || record.user_name || "Unknown";
            const initials = name.substring(0, 2).toUpperCase();

            return (
                <div className="flex items-center gap-3">

                    {/* Avatar */}
                    <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-semibold text-gray-500 border border-gray-200">
                        {initials}
                    </div>

                    {/* Name */}
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
        title: 'OPENING BALANCE',
        dataIndex: 'opening_balance',
        key: 'opening_balance',
        align: 'center',
        width: 220,
        render: (value) => (
            <div className="flex items-center justify-center gap-2">
                <WalletOutlined className="text-gray-400 text-sm" />
                <span className="font-semibold text-gray-900 text-base">
                    ₹{Number(value || 0).toLocaleString()}
                </span>
            </div>
        )
    }
];