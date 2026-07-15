import React from "react";
import { Alert, Button, Checkbox, Empty, Popconfirm, Space, Spin, Typography } from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    SaveOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import SectionCard from "../../../components/common/SectionCard";
import FormFooter from "../../../components/common/FormFooter";

const { Text } = Typography;

const DOCTYPE_GROUPS = [
    {
        title: "Trust Management",
        doctypes: ["Temple", "Temple General Settings", "Temple Booking Settings", "Temple Notification Settings", "Receipt Settings", "Document Template"]
    },
    {
        title: "Donations & Donors",
        doctypes: ["Donor", "Donation", "Donation Type"]
    },
    {
        title: "Room Booking",
        doctypes: ["Room", "Room Booking", "Building", "Room Type"]
    },
    {
        title: "Inventory Management",
        doctypes: ["Item", "Inventory Entry", "Item Category", "Store Location"]
    },
    {
        title: "System & Users",
        doctypes: ["User"]
    }
];

const getCategoryIcon = (title) => {
    switch (title) {
        case "Trust Management": return "🏛";
        case "Donations & Donors": return "💰";
        case "Room Booking": return "🏨";
        case "Inventory Management": return "📦";
        case "System & Users": return "👥";
        default: return "🧩";
    }
};

const getModuleLabel = (doctype) => {
    switch (doctype) {
        case "Temple": return "Trust";
        case "Temple Details": return "Trust Details";
        case "Temple General Settings": return "Trust General Settings";
        case "Temple Booking Settings": return "Trust Booking Settings";
        case "Temple Notification Settings": return "Trust Notification Settings";
        default: return doctype;
    }
};

const groupPermissions = (permsList) => {
    const grouped = [];
    const groupedDocTypes = new Set();

    DOCTYPE_GROUPS.forEach(group => {
        const items = permsList.filter(p => group.doctypes.includes(p.doctype));
        if (items.length > 0) {
            grouped.push({ title: group.title, items });
            group.doctypes.forEach(dt => groupedDocTypes.add(dt));
        }
    });

    const others = permsList.filter(p => !groupedDocTypes.has(p.doctype));
    if (others.length > 0) {
        grouped.push({ title: "Other Modules", items: others });
    }

    return grouped;
};

const RolePermissionsTable = ({
    selectedRole,
    selectedRoleMeta,
    loadingPerms,
    saving,
    permissions,
    onEditRoleClick,
    onAddModuleClick,
    onSavePermissions,
    onPermissionChange,
    onToggleAll,
    onRemoveDoctype,
    canRemoveDoctypes
}) => {
    const isSuperAdminRole = selectedRole === "Super Admin";
    const finalCanRemoveDoctypes = canRemoveDoctypes && !isSuperAdminRole;

    return (
        <SectionCard
            title={`Permissions — ${selectedRole === "Temple Admin" ? "Trust Admin" : selectedRole}`}
            right={
                <Space wrap>
                    {!selectedRoleMeta?.is_protected && !selectedRoleMeta?.is_static && !isSuperAdminRole && (
                        <>
                            <Button
                                size="small"
                                icon={<EditOutlined />}
                                onClick={onEditRoleClick}
                            >
                                Edit Role
                            </Button>
                            <Button
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={onAddModuleClick}
                            >
                                Add Module
                            </Button>
                        </>
                    )}
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
                                No Modules configured
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
                                    Module
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
                                {finalCanRemoveDoctypes && (
                                    <th className="p-3 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">
                                        Remove
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {groupPermissions(permissions).map((group, groupIdx) => {
                                const totalPossible = group.items.length * 4;
                                const checkedCount = group.items.reduce((acc, row) => {
                                    return acc + (row.read ? 1 : 0) + (row.write ? 1 : 0) + (row.create ? 1 : 0) + (row.delete ? 1 : 0);
                                }, 0);
                                const isGroupAllChecked = checkedCount === totalPossible;
                                const isGroupIndeterminate = checkedCount > 0 && checkedCount < totalPossible;

                                return (
                                    <React.Fragment key={group.title}>
                                        <tr className="bg-zinc-50/50" style={{ borderTop: "2px solid #e4e4e7", borderBottom: "2px solid #e4e4e7" }}>
                                            <td colSpan={finalCanRemoveDoctypes ? 7 : 6} className="px-4 py-2 text-xs font-bold text-zinc-700 uppercase tracking-wider">
                                                <div className="flex items-center justify-between w-full">
                                                    <span>{getCategoryIcon(group.title)} &nbsp; {group.title}</span>
                                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <span className="text-[10px] font-normal text-zinc-400 normal-case">Select Group:</span>
                                                        <Checkbox
                                                            checked={isSuperAdminRole ? true : isGroupAllChecked}
                                                            indeterminate={isSuperAdminRole ? false : isGroupIndeterminate}
                                                            disabled={isSuperAdminRole}
                                                            onChange={(e) => {
                                                                group.items.forEach(item => {
                                                                    onToggleAll(item.doctype, e.target.checked);
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    {group.items.map((row) => {
                                        const isAllChecked =
                                            row.read && row.write && row.create && row.delete;
                                        const hasSomeChecked =
                                            row.read || row.write || row.create || row.delete;
                                        const isIndeterminate = hasSomeChecked && !isAllChecked;
                                        return (
                                            <tr
                                                key={row.doctype}
                                                className="hover:bg-zinc-50/50 transition-colors"
                                            >
                                                <td className="p-3 pl-6 text-sm font-medium text-zinc-700">
                                                    {getModuleLabel(row.doctype)}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <Checkbox
                                                        checked={isSuperAdminRole ? true : !!row.read}
                                                        disabled={isSuperAdminRole}
                                                        onChange={(e) =>
                                                            onPermissionChange(row.doctype, "read", e.target.checked)
                                                        }
                                                    />
                                                </td>
                                                <td className="p-3 text-center">
                                                    <Checkbox
                                                        checked={isSuperAdminRole ? true : !!row.write}
                                                        disabled={isSuperAdminRole}
                                                        onChange={(e) =>
                                                            onPermissionChange(row.doctype, "write", e.target.checked)
                                                        }
                                                    />
                                                </td>
                                                <td className="p-3 text-center">
                                                    <Checkbox
                                                        checked={isSuperAdminRole ? true : !!row.create}
                                                        disabled={isSuperAdminRole}
                                                        onChange={(e) =>
                                                            onPermissionChange(row.doctype, "create", e.target.checked)
                                                        }
                                                    />
                                                </td>
                                                <td className="p-3 text-center">
                                                    <Checkbox
                                                        checked={isSuperAdminRole ? true : !!row.delete}
                                                        disabled={isSuperAdminRole}
                                                        onChange={(e) =>
                                                            onPermissionChange(row.doctype, "delete", e.target.checked)
                                                        }
                                                    />
                                                </td>
                                                <td className="p-3 text-center">
                                                    <Checkbox
                                                        checked={isSuperAdminRole ? true : !!isAllChecked}
                                                        indeterminate={isSuperAdminRole ? false : !!isIndeterminate}
                                                        disabled={isSuperAdminRole}
                                                        onChange={(e) =>
                                                            onToggleAll(row.doctype, e.target.checked)
                                                        }
                                                    />
                                                </td>
                                                {finalCanRemoveDoctypes && (
                                                    <td className="p-3 text-center">
                                                        <Popconfirm
                                                            title={`Remove ${getModuleLabel(row.doctype)}?`}
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
                                </React.Fragment>
                            );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {!loadingPerms && permissions.length > 0 && !isSuperAdminRole && (
                <FormFooter
                    loading={saving}
                    saveText="Save Changes"
                    onSubmit={onSavePermissions}
                />
            )}
        </SectionCard>
    );
};

export default RolePermissionsTable;
