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
                            className={`cursor-pointer px-3 py-2.5 rounded-md transition-colors flex justify-between items-center mb-1.5 last:mb-0 hover:bg-zinc-50 ${
                                isSelected
                                    ? "bg-zinc-100/80 font-semibold"
                                    : ""
                             }`}
                        >
                            <Space size={10} align="center">
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
                                    <span className="text-[10px] text-zinc-400 font-mono">
                                        {item.name}
                                    </span>
                                </div>
                                {item.custom_user_role && (
                                    <Tag className="!m-0 text-[10px] bg-zinc-50">
                                        {item.custom_user_role}
                                    </Tag>
                                )}
                            </Space>
                        </List.Item>
                    );
                }}
            />
        </SectionCard>
    );
};

export default UserListSidePanel;
