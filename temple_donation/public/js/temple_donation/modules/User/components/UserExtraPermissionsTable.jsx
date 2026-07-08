import React from "react";
import { Alert, Button, Checkbox, Empty, Select, Space, Spin, Typography } from "antd";
import {
    SaveOutlined,
    UndoOutlined,
} from "@ant-design/icons";
import SectionCard from "../../../components/common/SectionCard";

const { Text } = Typography;

const UserExtraPermissionsTable = ({
    selectedUser,
    userNameDisplay,
    loadingUserPerms,
    savingUserPerms,
    userPermissions,
    roles,
    currentRole,
    onRoleChange,
    onReset,
    onSave,
    onPermissionChange,
    onToggleAll
}) => {
    return (
        <SectionCard
            title={`Extra Permissions — ${userNameDisplay}`}
            right={
                <Space wrap>
                    <Button
                        size="small"
                        danger
                        icon={<UndoOutlined />}
                        loading={savingUserPerms}
                        onClick={onReset}
                    >
                        Reset Overrides
                    </Button>
                    <Button
                        size="small"
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={savingUserPerms}
                        onClick={onSave}
                    >
                        Save Changes
                    </Button>
                </Space>
            }
        >
            <div style={{ 
                marginBottom: 20, 
                padding: '12px 16px', 
                backgroundColor: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap'
            }}>
                <span style={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>Assigned User Role:</span>
                <Select
                    placeholder="Select or Assign Role"
                    value={currentRole || undefined}
                    style={{ width: 220 }}
                    onChange={onRoleChange}
                    options={roles.map(r => ({ label: r.name, value: r.name }))}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                    Updating the role assigns standard permissions automatically.
                </Text>
            </div>

            <Alert
                message="These permissions are overrides added beside the user's role. Gray checkboxes show permissions already active from their role."
                type="info"
                showIcon
                style={{ marginBottom: "20px" }}
            />

            {loadingUserPerms ? (
                <div className="py-16 text-center">
                    <Spin />
                </div>
            ) : userPermissions.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No permissions loadable"
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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {userPermissions.map((row) => {
                                const isAllChecked =
                                    (!!row.role_read || !!row.read) &&
                                    (!!row.role_write || !!row.write) &&
                                    (!!row.role_create || !!row.create) &&
                                    (!!row.role_delete || !!row.delete);
                                const isAllDisabled =
                                    !!row.role_read &&
                                    !!row.role_write &&
                                    !!row.role_create &&
                                    !!row.role_delete;
                                return (
                                    <tr
                                        key={row.doctype}
                                        className="hover:bg-zinc-50/50 transition-colors"
                                    >
                                        <td className="p-3 text-sm font-medium text-zinc-700">
                                            {row.doctype === "Temple" ? "Trust" : (row.doctype === "Temple Details" ? "Trust Details" : row.doctype)}
                                            {row.is_extra && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-2 inline-block animate-pulse" title="Has active override" />
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            <Checkbox
                                                checked={!!row.role_read || !!row.read}
                                                disabled={!!row.role_read}
                                                onChange={(e) =>
                                                    onPermissionChange(row.doctype, "read", e.target.checked)
                                                }
                                            />
                                        </td>
                                        <td className="p-3 text-center">
                                            <Checkbox
                                                checked={!!row.role_write || !!row.write}
                                                disabled={!!row.role_write}
                                                onChange={(e) =>
                                                    onPermissionChange(row.doctype, "write", e.target.checked)
                                                }
                                            />
                                        </td>
                                        <td className="p-3 text-center">
                                            <Checkbox
                                                checked={!!row.role_create || !!row.create}
                                                disabled={!!row.role_create}
                                                onChange={(e) =>
                                                    onPermissionChange(row.doctype, "create", e.target.checked)
                                                }
                                            />
                                        </td>
                                        <td className="p-3 text-center">
                                            <Checkbox
                                                checked={!!row.role_delete || !!row.delete}
                                                disabled={!!row.role_delete}
                                                onChange={(e) =>
                                                    onPermissionChange(row.doctype, "delete", e.target.checked)
                                                }
                                            />
                                        </td>
                                        <td className="p-3 text-center">
                                            <Checkbox
                                                checked={!!isAllChecked}
                                                disabled={!!isAllDisabled}
                                                onChange={(e) =>
                                                    onToggleAll(row.doctype, e.target.checked)
                                                }
                                            />
                                        </td>
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

export default UserExtraPermissionsTable;
