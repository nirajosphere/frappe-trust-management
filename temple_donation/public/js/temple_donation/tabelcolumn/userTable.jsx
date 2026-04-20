import React from "react";
import { Tag, Space } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";

export const userColumns = [
    {
        title: "USER",
        dataIndex: "full_name",
        key: "full_name",
        width: 250,
        render: (text, record) => {
            const name =
                text ||
                `${record.first_name || ""} ${record.last_name || ""}`.trim() ||
                record.name ||
                "Unknown";

            const initials = name.substring(0, 2).toUpperCase();

            return (
                <div className="flex items-center gap-3">

                    {/* Avatar */}
                    {record.user_image ? (
                        <img
                            src={record.user_image}
                            alt={name}
                            className="h-9 w-9 rounded-full object-cover border border-gray-200"
                        />
                    ) : (
                        <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-semibold text-gray-500 border border-gray-200">
                            {initials}
                        </div>
                    )}

                    {/* Name + Email */}
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-gray-800 text-sm">
                            {name}
                        </span>
                        <span className="text-xs text-gray-400 truncate">
                            {record.email || "no-email"}
                        </span>
                    </div>
                </div>
            );
        }
    },
    {
        title: "CONTACT",
        dataIndex: "custom_test",
        key: "custom_test",
        width: 180,
        render: (text) => (
            <span className="text-gray-600 text-sm font-medium">
                {text || "N/A"}
            </span>
        )
    },

    {
        title: "TEMPLES",
        dataIndex: "custom_assigned_temples",
        key: "custom_assigned_temples",
        width: 180,
        render: (temples) => (
            <div className="flex flex-wrap gap-1">
                {temples && temples.length > 0 ? (
                    temples.slice(0, 2).map((t, index) => (
                        <Tag
                            key={index}
                            className="bg-gray-100 border border-gray-200 text-gray-600 font-medium rounded-full px-2 py-[2px] text-[10px]"
                        >
                            {t.temple}
                        </Tag>
                    ))
                ) : (
                    <span className="text-gray-400 text-xs italic">
                        Global
                    </span>
                )}
            </div>
        )
    },

    {
        title: "ROLE",
        dataIndex: "custom_user_role",
        key: "custom_user_role",
        width: 140,
        render: (text) => (
            <Tag className="bg-gray-100 border border-gray-200 text-gray-700 font-semibold rounded-full px-3 py-0 text-[10px] uppercase">
                {text || "Standard"}
            </Tag>
        )
    },

    {
        title: "STATUS",
        dataIndex: "enabled",
        key: "enabled",
        width: 140,
        render: (enabled) => (
            <Tag
                color={enabled ? "success" : "error"}
                className="rounded-full px-3 py-[2px] border-0 font-semibold text-[10px]"
            >
                {enabled ? "ACTIVE" : "INACTIVE"}
            </Tag>
        )
    },

    // {
    //     title: "ACTIONS",
    //     key: "actions",
    //     width: 120,
    //     align: "center",
    //     render: (_, record) => (
    //         <Space size="middle">
    //             <EyeOutlined className="cursor-pointer text-orange-500" />
    //             <EditOutlined className="cursor-pointer text-yellow-500" />
    //             <DeleteOutlined className="cursor-pointer text-red-500" />
    //         </Space>
    //     )
    // }
];