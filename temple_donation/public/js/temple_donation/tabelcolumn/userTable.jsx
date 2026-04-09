import React from "react";
import { Tag, Space, Button, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";

export const userColumns = [
    {
        title: "User",
        dataIndex: "full_name",
        key: "full_name",
        render: (text, record) => (
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-400 border border-zinc-200 uppercase">
                    {text ? text.substring(0, 2) : (record.first_name ? record.first_name.substring(0, 2) : "UN")}
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-zinc-800 leading-tight">
                        {text || `${record.first_name || ""} ${record.last_name || ""}`.trim() || record.name}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium lowercase">
                        {record.email}
                    </span>
                </div>
            </div>
        )
    },
    {
        title: "Contact",
        dataIndex: "custom_test",
        key: "custom_test",
        render: (text) => <span className="text-zinc-500 font-medium">{text || "N/A"}</span>
    },
    {
        title: "Temples",
        dataIndex: "custom_assigned_temples",
        key: "custom_assigned_temples",
        render: (temples) => (
            <div className="flex flex-wrap gap-1">
                {temples && temples.length > 0 ? (
                    temples.map((t, index) => (
                        <Tag key={index} className="bg-zinc-50 border-zinc-200 text-zinc-500 font-bold rounded-full px-2 py-0 text-[10px]">
                            {t.temple}
                        </Tag>
                    ))
                ) : (
                    <span className="text-zinc-400 italic text-[11px]">Global</span>
                )}
            </div>
        )
    },
    {
        title: "Role",
        dataIndex: "custom_user_role",
        key: "custom_user_role",
        render: (text) => (
            <Tag className="bg-zinc-50 border-zinc-200 text-zinc-500 font-bold border-0 rounded-full px-3 py-0.5 uppercase text-[9px] tracking-wider">
                {text || "Standard"}
            </Tag>
        )
    },
    {
        title: "Status",
        dataIndex: "enabled",
        key: "enabled",
        render: (enabled) => (
            <Tag color={enabled ? "success" : "error"} className="rounded-full px-4 border-0 font-bold uppercase text-[9px]">
                {enabled ? "ACTIVE" : "INACTIVE"}
            </Tag>
        )
    }
];
