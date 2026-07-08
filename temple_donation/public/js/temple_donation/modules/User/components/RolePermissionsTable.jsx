import React from "react";
import { Alert, Button, Checkbox, Empty, Popconfirm, Space, Spin, Typography } from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    SaveOutlined,
} from "@ant-design/icons";
import SectionCard from "../../../components/common/SectionCard";

const { Text } = Typography;

const RolePermissionsTable = ({
    selectedRole,
    selectedRoleMeta,
    loadingPerms,
    saving,
    permissions,
    onEditRoleClick,
    onSavePermissions,
    onPermissionChange,
    onToggleAll,
    onRemoveDoctype,
    canRemoveDoctypes
}) => {
    return (
        <SectionCard
            title={`Permissions — ${selectedRole}`}
            right={
                <Space wrap>
                    {!selectedRoleMeta?.is_protected && !selectedRoleMeta?.is_static && (
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                            onClick={onEditRoleClick}
                        >
                            Edit Role
                        </Button>
                    )}
                    <Button
                        size="small"
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={saving}
                        onClick={onSavePermissions}
                    >
                        Save Changes
                    </Button>
                </Space>
            }
        >
            <Alert
                message="Permission changes apply immediately after saving."
                type="info"
                showIcon
                style={{ marginBottom: "20px" }}
            />

            {loadingPerms ? (
                <div className="py-16 text-center">
                    <Spin />
                </div>
            ) : permissions.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <div className="flex flex-col gap-2">
                            <Text className="font-semibold text-zinc-700">
                                No DocTypes configured
                            </Text>
                            <Text className="text-zinc-400 text-xs">
                                Edit/configure permissions for this role to see them.
                            </Text>
                        </div>
                    }
                />
            ) : (
                <div className="overflow-x-auto border border-zinc-100 rounded-lg bg-white">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/70 border-b border-zinc-100">
                                <th className="p-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                    DocType
                                </th>
                                <th className="p-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">
                                    Read
                                </th>
                                <th className="p-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">
                                    Write
                                </th>
                                <th className="p-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">
                                    Create
                                </th>
                                <th className="p-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">
                                    Delete
                                </th>
                                <th className="p-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">
                                    All
                                </th>
                                {canRemoveDoctypes && (
                                    <th className="p-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">
                                        Remove
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {permissions.map((row) => {
                                const isAllChecked =
                                    row.read && row.write && row.create && row.delete;
                                return (
                                    <tr
                                        key={row.doctype}
                                        className="hover:bg-zinc-50/50 transition-colors"
                                    >
                                        <td className="p-3 text-sm font-medium text-zinc-700">
                                            {row.doctype === "Temple" ? "Trust" : (row.doctype === "Temple Details" ? "Trust Details" : row.doctype)}
                                        </td>
                                        <td className="p-3 text-center">
                                            <Checkbox
                                                checked={!!row.read}
                                                onChange={(e) =>
                                                    onPermissionChange(row.doctype, "read", e.target.checked)
                                                }
                                            />
                                        </td>
                                        <td className="p-3 text-center">
                                            <Checkbox
                                                checked={!!row.write}
                                                onChange={(e) =>
                                                    onPermissionChange(row.doctype, "write", e.target.checked)
                                                }
                                            />
                                        </td>
                                        <td className="p-3 text-center">
                                            <Checkbox
                                                checked={!!row.create}
                                                onChange={(e) =>
                                                    onPermissionChange(row.doctype, "create", e.target.checked)
                                                }
                                            />
                                        </td>
                                        <td className="p-3 text-center">
                                            <Checkbox
                                                checked={!!row.delete}
                                                onChange={(e) =>
                                                    onPermissionChange(row.doctype, "delete", e.target.checked)
                                                }
                                            />
                                        </td>
                                        <td className="p-3 text-center">
                                            <Checkbox
                                                checked={!!isAllChecked}
                                                onChange={(e) =>
                                                    onToggleAll(row.doctype, e.target.checked)
                                                }
                                            />
                                        </td>
                                        {canRemoveDoctypes && (
                                            <td className="p-3 text-center">
                                                <Popconfirm
                                                    title={`Remove ${row.doctype === "Temple" ? "Trust" : (row.doctype === "Temple Details" ? "Trust Details" : row.doctype)}?`}
                                                    onConfirm={() => onRemoveDoctype(row.doctype)}
                                                    okText="Remove"
                                                    cancelText="Cancel"
                                                >
                                                    <Button
                                                        type="text"
                                                        danger
                                                        size="small"
                                                        icon={<DeleteOutlined />}
                                                    />
                                                </Popconfirm>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </SectionCard>
    );
};

export default RolePermissionsTable;
