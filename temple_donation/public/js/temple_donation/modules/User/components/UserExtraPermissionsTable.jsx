import React from "react";
import { Alert, Button, Checkbox, Empty, Select, Space, Spin, Typography } from "antd";
import {
    SaveOutlined,
    UndoOutlined,
} from "@ant-design/icons";
import SectionCard from "../../../components/common/SectionCard";

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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {groupPermissions(userPermissions).map((group) => (
                                <React.Fragment key={group.title}>
                                    <tr className="bg-zinc-50/40 border-y border-zinc-100/60">
                                        <td colSpan={6} className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50/10">
                                            {group.title}
                                        </td>
                                    </tr>
                                    {group.items.map((row) => {
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
                                                <td className="p-3 pl-6 text-sm font-medium text-zinc-700">
                                                    {getModuleLabel(row.doctype)}
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
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </SectionCard>
    );
};

export default UserExtraPermissionsTable;
