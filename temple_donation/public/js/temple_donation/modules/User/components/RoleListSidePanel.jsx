import React, { useMemo, useState } from "react";
import { Button, Input, List, Space, Tag, Tooltip, Popconfirm } from "antd";
import {
    DeleteOutlined,
    LockOutlined,
    PlusOutlined,
    SafetyCertificateOutlined,
    SafetyOutlined,
} from "@ant-design/icons";
import SectionCard from "../../../components/common/SectionCard";

const RoleListSidePanel = ({
    loading,
    roles,
    selectedRole,
    onSelectRole,
    onAddRoleClick,
    onDeleteRole
}) => {
    const [search, setSearch] = useState("");
    
    const filteredRoles = useMemo(() => {
        return roles.filter(role => 
            role.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [roles, search]);

    return (
        <SectionCard
            title="Roles"
            icon={<SafetyOutlined style={{ color: "#002140" }} />}
            right={
                <Button
                    size="small"
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={onAddRoleClick}
                >
                    Add Role
                </Button>
            }
        >
            <div style={{ marginBottom: 12 }}>
                <Input
                    placeholder="Search roles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    allowClear
                />
            </div>
            <List
                loading={loading}
                dataSource={filteredRoles}
                locale={{ emptyText: "No roles found" }}
                renderItem={(item) => {
                    const isSelected = selectedRole === item.name;
                    return (
                        <List.Item
                            onClick={() => onSelectRole(item)}
                            className={`cursor-pointer px-3 py-2.5 rounded-md transition-all duration-200 flex justify-between items-center mb-1.5 last:mb-0 hover:bg-zinc-50 border border-transparent ${
                                isSelected
                                    ? "bg-blue-50/50 border-blue-100/80 font-medium"
                                    : "hover:border-zinc-100"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                {item.is_protected ? (
                                    <Tooltip title="Protected role">
                                        <LockOutlined className="text-zinc-400 text-sm" />
                                    </Tooltip>
                                ) : (
                                    <SafetyCertificateOutlined className="text-blue-500 text-sm" />
                                )}
                                <span className="text-sm text-zinc-700 font-medium">
                                    {item.name === "Temple Admin" ? "Trust Admin" : item.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                {item.is_static && (
                                    <Tag className="!m-0 text-[10px] px-1.5 py-0.5 rounded border-zinc-200 bg-zinc-50 text-zinc-500">
                                        Static
                                    </Tag>
                                )}
                                {item.user_count > 0 && (
                                    <Tag className="!m-0 text-[10px] px-1.5 py-0.5 rounded border-blue-100 bg-blue-50/40 text-blue-600 font-medium">
                                        {item.user_count} user{item.user_count > 1 ? "s" : ""}
                                    </Tag>
                                )}
                                {!item.is_protected && (
                                    <Popconfirm
                                        title="Delete this role?"
                                        description="This removes the role and its permission configuration."
                                        onConfirm={() => onDeleteRole(item.name)}
                                        okText="Delete"
                                        cancelText="Cancel"
                                        okButtonProps={{ danger: true, size: "small" }}
                                        cancelButtonProps={{ size: "small" }}
                                    >
                                        <Button
                                            type="text"
                                            danger
                                            size="small"
                                            className="flex items-center justify-center p-1 rounded-md hover:bg-red-50"
                                            icon={
                                                <DeleteOutlined className="text-zinc-400 hover:text-red-500 transition-colors" />
                                            }
                                        />
                                    </Popconfirm>
                                )}
                            </div>
                        </List.Item>
                    );
                }}
            />
        </SectionCard>
    );
};

export default RoleListSidePanel;
