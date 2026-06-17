import React from "react";
import { Tag, Space, Avatar } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { getTagConfig } from "../utils/tagUtils";

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

                    <Avatar
                        src={record.user_image}
                        size={26}
                        className="bg-zinc-100 text-zinc-500 font-semibold text-[11px] border border-zinc-200 shrink-0"
                    >
                        {initials}
                    </Avatar>

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
        },
        filterable: true,
        filterType: "text"
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
        ),
        filterable: true,
        filterType: "text"
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
                        Global
                    </span>
                )}
            </div>
        ),
        filterable: false
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
        },
        filterable: true,
        filterType: "select",
        filterOptions: [
            { label: "Administrator", value: "Administrator" },
            { label: "Cashier", value: "Cashier" },
            { label: "Super Admin", value: "Super Admin" },
            { label: "Temple Admin", value: "Temple Admin" }
        ]
    },

    {
        title: "STATUS",
        dataIndex: "enabled",
        key: "enabled",
        width: 140,
        render: (enabled) => {
            const config = getTagConfig(enabled ? "Active" : "Inactive");
            return (
                <Tag className={`tag-glass ${config.glassClass} font-bold rounded-full`}>
                    {config.label}
                </Tag>
            );
        },
        filterable: true,
        filterType: "select",
        filterOptions: [
            { label: "Active", value: 1 },
            { label: "Inactive", value: 0 }
        ]
    },

    // className="!m-0 bg-gray-100 border border-gray-200 text-gray-600 font-medium rounded-full px-2 py-[2px] text-[10px]"

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