import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Button,
    Card,
    Checkbox,
    Col,
    Empty,
    Form,
    Input,
    List,
    Modal,
    Popconfirm,
    Row,
    Select,
    Space,
    Spin,
    Tag,
    Tooltip,
    Typography,
    Tabs,
    message,
} from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    LockOutlined,
    PlusOutlined,
    SafetyCertificateOutlined,
    SafetyOutlined,
    SaveOutlined,
    UserOutlined,
    UndoOutlined,
} from "@ant-design/icons";
import SectionCard from "../../components/common/SectionCard";

const { Text, Title, Paragraph } = Typography;

const RolePermissions = () => {
    const [activeTab, setActiveTab] = useState("roles");
    const [roles, setRoles] = useState([]);
    const [roleProfile, setRoleProfile] = useState(null);
    const [availableDoctypes, setAvailableDoctypes] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedRoleMeta, setSelectedRoleMeta] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [loadingPerms, setLoadingPerms] = useState(false);
    const [saving, setSaving] = useState(false);

    // User extra permission state
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userPermissions, setUserPermissions] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingUserPerms, setLoadingUserPerms] = useState(false);
    const [savingUserPerms, setSavingUserPerms] = useState(false);

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [addDoctypeModalOpen, setAddDoctypeModalOpen] = useState(false);

    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [addDoctypeForm] = Form.useForm();

    const configuredDoctypes = useMemo(
        () => permissions.map((row) => row.doctype),
        [permissions]
    );

    const addableDoctypes = useMemo(
        () => availableDoctypes.filter((dt) => !configuredDoctypes.includes(dt)),
        [availableDoctypes, configuredDoctypes]
    );

    useEffect(() => {
        fetchRoles();
        fetchAvailableDoctypes();
        fetchRoleProfile();
    }, []);

    useEffect(() => {
        if (activeTab === "users") {
            fetchUsers();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === "users" && selectedUser) {
            fetchUserPermissions(selectedUser);
        } else {
            setUserPermissions([]);
        }
    }, [selectedUser, activeTab]);

    const fetchUsers = () => {
        if (typeof frappe === "undefined") return;
        setLoadingUsers(true);
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "User",
                fields: ["name", "full_name", "custom_user_role", "enabled"],
                filters: {
                    enabled: 1,
                    name: ["not in", ["Administrator", "Guest"]]
                },
                limit_page_length: 1000
            },
            callback: (r) => {
                setLoadingUsers(false);
                if (r.message) {
                    setUsers(r.message);
                }
            },
            error: () => setLoadingUsers(false)
        });
    };

    const fetchUserPermissions = (userName) => {
        if (typeof frappe === "undefined") return;
        setLoadingUserPerms(true);
        frappe.call({
            method: "temple_donation.api.get_user_extra_permissions",
            args: { user_name: userName },
            callback: (r) => {
                setLoadingUserPerms(false);
                if (r.message) setUserPermissions(r.message);
            },
            error: () => setLoadingUserPerms(false),
        });
    };

    const handleUserPermissionChange = (doctype, field, value) => {
        setUserPermissions((prev) =>
            prev.map((row) =>
                row.doctype === doctype ? { ...row, [field]: value ? 1 : 0 } : row
            )
        );
    };

    const handleUserToggleAll = (doctype, checked) => {
        const val = checked ? 1 : 0;
        setUserPermissions((prev) =>
            prev.map((row) =>
                row.doctype === doctype
                    ? {
                          ...row,
                          read: row.role_read ? row.read : val,
                          write: row.role_write ? row.write : val,
                          create: row.role_create ? row.create : val,
                          delete: row.role_delete ? row.delete : val,
                      }
                    : row
            )
        );
    };

    const handleSaveUserPermissions = () => {
        if (typeof frappe === "undefined" || !selectedUser) return;
        setSavingUserPerms(true);
        frappe.call({
            method: "temple_donation.api.save_user_extra_permissions",
            args: {
                user_name: selectedUser,
                permissions: JSON.stringify(userPermissions),
            },
            callback: (r) => {
                setSavingUserPerms(false);
                if (r.message) {
                    message.success(`Extra permissions for "${selectedUser}" saved successfully.`);
                    fetchUserPermissions(selectedUser);
                }
            },
            error: () => setSavingUserPerms(false),
        });
    };

    const handleResetUserPermissions = () => {
        if (typeof frappe === "undefined" || !selectedUser) return;
        setSavingUserPerms(true);
        frappe.call({
            method: "temple_donation.api.reset_user_extra_permissions",
            args: { user_name: selectedUser },
            callback: (r) => {
                setSavingUserPerms(false);
                if (r.message) {
                    message.success("User permissions reset to role defaults.");
                    fetchUserPermissions(selectedUser);
                }
            },
            error: () => setSavingUserPerms(false),
        });
    };

    const fetchRoleProfile = () => {
        if (typeof frappe === "undefined") return;
        frappe.call({
            method: "temple_donation.api.get_role_profile_info",
            callback: (r) => {
                if (r.message) setRoleProfile(r.message);
            },
        });
    };

    useEffect(() => {
        if (selectedRole) {
            fetchPermissions(selectedRole);
        } else {
            setPermissions([]);
            setSelectedRoleMeta(null);
        }
    }, [selectedRole]);

    const fetchAvailableDoctypes = () => {
        if (typeof frappe === "undefined") return;
        frappe.call({
            method: "temple_donation.api.get_permission_doctypes",
            callback: (r) => {
                if (r.message) setAvailableDoctypes(r.message);
            },
        });
    };

    const fetchRoles = () => {
        if (typeof frappe === "undefined") return;
        setLoadingRoles(true);
        frappe.call({
            method: "temple_donation.api.get_custom_roles",
            callback: (r) => {
                setLoadingRoles(false);
                if (r.message) {
                    setRoles(r.message);
                    if (selectedRole) {
                        setSelectedRoleMeta(r.message.find((role) => role.name === selectedRole) || null);
                    }
                }
            },
            error: () => setLoadingRoles(false),
        });
    };

    const fetchPermissions = (roleName) => {
        if (typeof frappe === "undefined") return;
        setLoadingPerms(true);
        frappe.call({
            method: "temple_donation.api.get_role_permissions",
            args: { role_name: roleName },
            callback: (r) => {
                setLoadingPerms(false);
                if (r.message) setPermissions(r.message);
            },
            error: () => setLoadingPerms(false),
        });
    };

    const handleCreateRole = (values) => {
        if (typeof frappe === "undefined") return;

        frappe.call({
            method: "temple_donation.api.create_custom_role",
            args: {
                role_name: values.role_name,
                doctypes: JSON.stringify(values.doctypes || []),
            },
            callback: (r) => {
                if (r.message) {
                    message.success(`Role "${values.role_name}" created successfully.`);
                    setCreateModalOpen(false);
                    createForm.resetFields();
                    fetchRoles();
                    fetchRoleProfile();
                    setSelectedRole(values.role_name);
                }
            },
        });
    };

    const handleEditRole = (values) => {
        if (typeof frappe === "undefined" || !selectedRole) return;

        frappe.call({
            method: "temple_donation.api.update_custom_role",
            args: {
                role_name: selectedRole,
                new_role_name: values.new_role_name,
            },
            callback: (r) => {
                if (r.message) {
                    message.success("Role updated successfully.");
                    setEditModalOpen(false);
                    editForm.resetFields();
                    const updatedName = r.message.name || values.new_role_name;
                    fetchRoles();
                    setSelectedRole(updatedName);
                }
            },
        });
    };

    const handleDeleteRole = (roleName) => {
        if (typeof frappe === "undefined") return;

        frappe.call({
            method: "temple_donation.api.delete_custom_role",
            args: { role_name: roleName },
            callback: (r) => {
                if (r.message !== undefined) {
                    message.success(`Role "${roleName}" deleted successfully.`);
                    if (selectedRole === roleName) setSelectedRole(null);
                    fetchRoles();
                }
            },
        });
    };

    const handleAddDoctypes = (values) => {
        if (typeof frappe === "undefined" || !selectedRole) return;

        frappe.call({
            method: "temple_donation.api.add_role_doctypes",
            args: {
                role_name: selectedRole,
                doctypes: JSON.stringify(values.doctypes || []),
            },
            callback: (r) => {
                if (r.message) {
                    message.success("DocTypes added to role.");
                    setAddDoctypeModalOpen(false);
                    addDoctypeForm.resetFields();
                    setPermissions(r.message);
                }
            },
        });
    };

    const handleRemoveDoctype = (doctype) => {
        if (typeof frappe === "undefined" || !selectedRole) return;

        frappe.call({
            method: "temple_donation.api.remove_role_doctype",
            args: { role_name: selectedRole, doctype },
            callback: (r) => {
                if (r.message !== undefined) {
                    message.success(`Removed "${doctype}" from role permissions.`);
                    fetchPermissions(selectedRole);
                }
            },
        });
    };

    const handlePermissionChange = (doctype, field, value) => {
        setPermissions((prev) =>
            prev.map((row) =>
                row.doctype === doctype ? { ...row, [field]: value ? 1 : 0 } : row
            )
        );
    };

    const handleToggleAll = (doctype, checked) => {
        const val = checked ? 1 : 0;
        setPermissions((prev) =>
            prev.map((row) =>
                row.doctype === doctype
                    ? { ...row, read: val, write: val, create: val, delete: val }
                    : row
            )
        );
    };

    const handleSavePermissions = () => {
        if (typeof frappe === "undefined" || !selectedRole) return;

        setSaving(true);
        frappe.call({
            method: "temple_donation.api.save_role_permissions",
            args: {
                role_name: selectedRole,
                permissions: JSON.stringify(permissions),
            },
            callback: (r) => {
                setSaving(false);
                if (r.message !== undefined) {
                    message.success(`Permissions for "${selectedRole}" saved successfully.`);
                    fetchPermissions(selectedRole);
                }
            },
            error: () => setSaving(false),
        });
    };

    const openEditModal = () => {
        editForm.setFieldsValue({ new_role_name: selectedRole });
        setEditModalOpen(true);
    };

    const canRemoveDoctypes = selectedRoleMeta && !selectedRoleMeta.is_static;

    const tabItems = [
        {
            key: "roles",
            label: "Role Permissions",
            children: (
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={8}>
                        <SectionCard
                            title="Roles"
                            icon={<SafetyOutlined style={{ color: "#002140" }} />}
                            right={
                                <Button
                                    size="small"
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setCreateModalOpen(true)}
                                >
                                    Add Role
                                </Button>
                            }
                        >
                            <List
                                loading={loadingRoles}
                                dataSource={roles}
                                locale={{ emptyText: "No roles found" }}
                                renderItem={(item) => {
                                    const isSelected = selectedRole === item.name;
                                    return (
                                        <List.Item
                                            onClick={() => {
                                                setSelectedRole(item.name);
                                                setSelectedRoleMeta(item);
                                            }}
                                            className={`cursor-pointer px-3 py-2.5 rounded-md transition-colors flex justify-between items-center mb-1.5 last:mb-0 hover:bg-zinc-50 ${
                                                isSelected
                                                    ? "bg-zinc-100/80 border-l-4 border-zinc-900 font-semibold"
                                                    : ""
                                            }`}
                                        >
                                            <Space size={8} wrap>
                                                {item.is_protected ? (
                                                    <Tooltip title="Protected role">
                                                        <LockOutlined className="text-zinc-400 text-xs" />
                                                    </Tooltip>
                                                ) : (
                                                    <SafetyCertificateOutlined className="text-zinc-500 text-xs" />
                                                )}
                                                <span className="text-sm text-zinc-700">{item.name}</span>
                                                {item.is_static && (
                                                    <Tag className="!m-0 text-[10px]">Static</Tag>
                                                )}
                                                {item.user_count > 0 && (
                                                    <Tag className="!m-0 text-[10px]">
                                                        {item.user_count} user{item.user_count > 1 ? "s" : ""}
                                                    </Tag>
                                                )}
                                            </Space>

                                            {!item.is_protected && (
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <Popconfirm
                                                        title="Delete this role?"
                                                        description="This removes the role and its permission configuration."
                                                        onConfirm={() => handleDeleteRole(item.name)}
                                                        okText="Delete"
                                                        cancelText="Cancel"
                                                        okButtonProps={{ danger: true, size: "small" }}
                                                        cancelButtonProps={{ size: "small" }}
                                                    >
                                                        <Button
                                                            type="text"
                                                            danger
                                                            size="small"
                                                            icon={
                                                                <DeleteOutlined className="text-zinc-400 hover:text-red-500" />
                                                            }
                                                        />
                                                    </Popconfirm>
                                                </div>
                                            )}
                                        </List.Item>
                                    );
                                }}
                            />
                        </SectionCard>
                    </Col>

                    <Col xs={24} lg={16}>
                        {selectedRole ? (
                            <SectionCard
                                title={`Permissions — ${selectedRole}`}
                                right={
                                    <Space wrap>
                                        {!selectedRoleMeta?.is_protected && !selectedRoleMeta?.is_static && (
                                            <Button
                                                size="small"
                                                icon={<EditOutlined />}
                                                onClick={openEditModal}
                                            >
                                                Edit Role
                                            </Button>
                                        )}
                                        <Button
                                            size="small"
                                            icon={<PlusOutlined />}
                                            onClick={() => setAddDoctypeModalOpen(true)}
                                            disabled={addableDoctypes.length === 0}
                                        >
                                            Add DocType
                                        </Button>
                                        <Button
                                            size="small"
                                            type="primary"
                                            icon={<SaveOutlined />}
                                            loading={saving}
                                            onClick={handleSavePermissions}
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
                                                    Add DocTypes to this role to configure permissions.
                                                </Text>
                                                <Button
                                                    type="primary"
                                                    size="small"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => setAddDoctypeModalOpen(true)}
                                                    className="mt-2"
                                                >
                                                    Add DocType
                                                </Button>
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
                                                                {row.doctype}
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <Checkbox
                                                                    checked={!!row.read}
                                                                    onChange={(e) =>
                                                                        handlePermissionChange(
                                                                            row.doctype,
                                                                            "read",
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <Checkbox
                                                                    checked={!!row.write}
                                                                    onChange={(e) =>
                                                                        handlePermissionChange(
                                                                            row.doctype,
                                                                            "write",
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <Checkbox
                                                                    checked={!!row.create}
                                                                    onChange={(e) =>
                                                                        handlePermissionChange(
                                                                            row.doctype,
                                                                            "create",
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <Checkbox
                                                                    checked={!!row.delete}
                                                                    onChange={(e) =>
                                                                        handlePermissionChange(
                                                                            row.doctype,
                                                                            "delete",
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <Checkbox
                                                                    checked={!!isAllChecked}
                                                                    onChange={(e) =>
                                                                        handleToggleAll(
                                                                            row.doctype,
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            {canRemoveDoctypes && (
                                                                <td className="p-3 text-center">
                                                                    <Popconfirm
                                                                        title={`Remove ${row.doctype}?`}
                                                                        onConfirm={() =>
                                                                            handleRemoveDoctype(row.doctype)
                                                                        }
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
                        ) : (
                            <Card className="flex items-center justify-center p-16 text-center" bordered={false}>
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <div className="flex flex-col gap-1">
                                            <Text className="font-semibold text-zinc-700">
                                                No Role Selected
                                            </Text>
                                            <Text className="text-zinc-400 text-xs">
                                                Select a role from the left panel to configure permissions.
                                            </Text>
                                        </div>
                                    }
                                />
                            </Card>
                        )}
                    </Col>
                </Row>
            )
        },
        {
            key: "users",
            label: "User Extra Permissions",
            children: (
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={8}>
                        <SectionCard
                            title="Users"
                            icon={<UserOutlined style={{ color: "#002140" }} />}
                        >
                            <List
                                loading={loadingUsers}
                                dataSource={users}
                                locale={{ emptyText: "No users found" }}
                                renderItem={(item) => {
                                    const isSelected = selectedUser === item.name;
                                    return (
                                        <List.Item
                                            onClick={() => {
                                                setSelectedUser(item.name);
                                            }}
                                            className={`cursor-pointer px-3 py-2.5 rounded-md transition-colors flex justify-between items-center mb-1.5 last:mb-0 hover:bg-zinc-50 ${
                                                isSelected
                                                    ? "bg-zinc-100/80 border-l-4 border-zinc-900 font-semibold"
                                                    : ""
                                            }`}
                                        >
                                            <Space size={8} wrap>
                                                <UserOutlined className="text-zinc-500 text-xs" />
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
                    </Col>

                    <Col xs={24} lg={16}>
                        {selectedUser ? (
                            <SectionCard
                                title={`Extra Permissions — ${users.find(u => u.name === selectedUser)?.full_name || selectedUser}`}
                                right={
                                    <Space wrap>
                                        <Button
                                            size="small"
                                            danger
                                            type="dashed"
                                            icon={<UndoOutlined />}
                                            loading={savingUserPerms}
                                            onClick={handleResetUserPermissions}
                                        >
                                            Reset to Role Defaults
                                        </Button>
                                        <Button
                                            size="small"
                                            type="primary"
                                            icon={<SaveOutlined />}
                                            loading={savingUserPerms}
                                            onClick={handleSaveUserPermissions}
                                        >
                                            Save Changes
                                        </Button>
                                    </Space>
                                }
                            >
                                <Alert
                                    message="These permissions are added to (beside) the user's role-based permissions. Gray checkboxes show permissions already active from the user's role."
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
                                                                {row.doctype}
                                                                {row.is_extra && (
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-2 inline-block animate-pulse" title="Has active override" />
                                                                )}
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <Checkbox
                                                                    checked={!!row.role_read || !!row.read}
                                                                    disabled={!!row.role_read}
                                                                    onChange={(e) =>
                                                                        handleUserPermissionChange(
                                                                            row.doctype,
                                                                            "read",
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <Checkbox
                                                                    checked={!!row.role_write || !!row.write}
                                                                    disabled={!!row.role_write}
                                                                    onChange={(e) =>
                                                                        handleUserPermissionChange(
                                                                            row.doctype,
                                                                            "write",
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <Checkbox
                                                                    checked={!!row.role_create || !!row.create}
                                                                    disabled={!!row.role_create}
                                                                    onChange={(e) =>
                                                                        handleUserPermissionChange(
                                                                            row.doctype,
                                                                            "create",
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <Checkbox
                                                                    checked={!!row.role_delete || !!row.delete}
                                                                    disabled={!!row.role_delete}
                                                                    onChange={(e) =>
                                                                        handleUserPermissionChange(
                                                                            row.doctype,
                                                                            "delete",
                                                                            e.target.checked
                                                                        )
                                                                    }
                                                                />
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <Checkbox
                                                                    checked={!!isAllChecked}
                                                                    disabled={!!isAllDisabled}
                                                                    onChange={(e) =>
                                                                        handleUserToggleAll(
                                                                            row.doctype,
                                                                            e.target.checked
                                                                        )
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
                        ) : (
                            <Card className="flex items-center justify-center p-16 text-center" bordered={false}>
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <div className="flex flex-col gap-1">
                                            <Text className="font-semibold text-zinc-700">
                                                No User Selected
                                            </Text>
                                            <Text className="text-zinc-400 text-xs">
                                                Select a user from the left panel to configure extra permissions.
                                            </Text>
                                        </div>
                                    }
                                />
                            </Card>
                        )}
                    </Col>
                </Row>
            )
        }
    ];

    return (
        <div style={{ padding: "24px 0" }}>
            <div style={{ marginBottom: "24px" }}>
                <Title level={3} style={{ margin: 0 }}>
                    Roles & Permissions
                </Title>
                <Paragraph type="secondary" style={{ margin: 0 }}>
                    Configure role-based permissions or user-specific extra permissions.
                </Paragraph>
            </div>

            <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

            <Modal
                title="Create Role"
                open={createModalOpen}
                onCancel={() => {
                    setCreateModalOpen(false);
                    createForm.resetFields();
                }}
                footer={null}
                width={520}
                destroyOnClose
            >
                <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={handleCreateRole}
                    requiredMark={false}
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        name="role_name"
                        label="Role Name"
                        rules={[
                            { required: true, message: "Please enter a role name" },
                            {
                                pattern: /^[a-zA-Z0-9\s_-]+$/,
                                message: "Only letters, numbers, spaces, underscores, and dashes allowed",
                            },
                        ]}
                    >
                        <Input placeholder="e.g. Accounts Manager, Front Desk" />
                    </Form.Item>

                    <Form.Item
                        name="doctypes"
                        label="DocTypes (optional)"
                        extra="Select which modules this role can access. You can add more later."
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Select DocTypes"
                            options={availableDoctypes.map((dt) => ({ label: dt, value: dt }))}
                            maxTagCount="responsive"
                        />
                    </Form.Item>

                    <Form.Item style={{ textAlign: "right", margin: 0 }}>
                        <Space>
                            <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit">
                                Create Role
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Edit Role"
                open={editModalOpen}
                onCancel={() => {
                    setEditModalOpen(false);
                    editForm.resetFields();
                }}
                footer={null}
                width={420}
                destroyOnClose
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditRole}
                    requiredMark={false}
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        name="new_role_name"
                        label="Role Name"
                        rules={[
                            { required: true, message: "Please enter a role name" },
                            {
                                pattern: /^[a-zA-Z0-9\s_-]+$/,
                                message: "Only letters, numbers, spaces, underscores, and dashes allowed",
                            },
                        ]}
                    >
                        <Input placeholder="Enter new role name" />
                    </Form.Item>

                    <Form.Item style={{ textAlign: "right", margin: 0 }}>
                        <Space>
                            <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit">
                                Save
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Add DocTypes"
                open={addDoctypeModalOpen}
                onCancel={() => {
                    setAddDoctypeModalOpen(false);
                    addDoctypeForm.resetFields();
                }}
                footer={null}
                width={520}
                destroyOnClose
            >
                <Form
                    form={addDoctypeForm}
                    layout="vertical"
                    onFinish={handleAddDoctypes}
                    requiredMark={false}
                    style={{ marginTop: 16 }}
                >
                    <Form.Item
                        name="doctypes"
                        label="DocTypes"
                        rules={[{ required: true, message: "Select at least one DocType" }]}
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Select DocTypes to add"
                            options={addableDoctypes.map((dt) => ({ label: dt, value: dt }))}
                            maxTagCount="responsive"
                        />
                    </Form.Item>

                    <Form.Item style={{ textAlign: "right", margin: 0 }}>
                        <Space>
                            <Button onClick={() => setAddDoctypeModalOpen(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit">
                                Add
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RolePermissions;
