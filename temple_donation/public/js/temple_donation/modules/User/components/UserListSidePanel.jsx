import React, { useMemo, useState } from "react";
import { Avatar, Input, List, Space, Tag } from "antd";
import { UserOutlined } from "@ant-design/icons";
import SectionCard from "../../../components/common/SectionCard";

const UserListSidePanel = ({
    loading,
    users,
    selectedUser,
    onSelectUser
}) => {
    const [search, setSearch] = useState("");
    
    const filteredUsers = useMemo(() => {
        return users.filter(user => 
            (user.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
            (user.name || "").toLowerCase().includes(search.toLowerCase()) ||
            (user.custom_user_role || "").toLowerCase().includes(search.toLowerCase())
        );
    }, [users, search]);

    return (
        <SectionCard
            title="Users"
            icon={<UserOutlined style={{ color: "#002140" }} />}
        >
            <div style={{ marginBottom: 12 }}>
                <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    allowClear
                />
            </div>
            <List
                loading={loading}
                dataSource={filteredUsers}
                locale={{ emptyText: "No users found" }}
                renderItem={(item) => {
                    const isSelected = selectedUser === item.name;
                    return (
                        <List.Item
                            onClick={() => onSelectUser(item.name)}
                            className={`cursor-pointer px-3 py-2.5 rounded-md transition-all duration-200 flex justify-between items-center mb-1.5 last:mb-0 hover:bg-zinc-50 border border-transparent ${
                                isSelected
                                    ? "bg-blue-50/50 border-blue-100/80 font-medium"
                                    : "hover:border-zinc-100"
                             }`}
                        >
                            <div className="flex items-center gap-3">
                                <Avatar 
                                    src={item.user_image} 
                                    icon={<UserOutlined />} 
                                    size={32}
                                    className="bg-zinc-100 text-zinc-900 border border-zinc-200"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm text-zinc-700 font-medium">
                                        {item.full_name || item.name}
                                    </span>
                                    <span className="text-[11px] text-zinc-400 font-normal">
                                        {item.name}
                                    </span>
                                </div>
                            </div>
                            {item.custom_user_role && (
                                <Tag className="!m-0 text-[10px] px-2 py-0.5 rounded-full border-zinc-200 bg-zinc-50 text-zinc-600 font-medium">
                                    {item.custom_user_role === "Temple Admin" ? "Trust Admin" : item.custom_user_role}
                                </Tag>
                            )}
                        </List.Item>
                    );
                }}
            />
        </SectionCard>
    );
};

export default UserListSidePanel;
