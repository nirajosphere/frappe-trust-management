import React, { useEffect, useMemo, useState } from "react";
import {
    Card,
    Col,
    Empty,
    Form,
    Input,
    Modal,
    Row,
    Select,
    Space,
    Typography,
    Tabs,
    Button,
    message,
} from "antd";
import RoleListSidePanel from "./components/RoleListSidePanel";
import RolePermissionsTable from "./components/RolePermissionsTable";
import UserListSidePanel from "./components/UserListSidePanel";
import UserExtraPermissionsTable from "./components/UserExtraPermissionsTable";

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
                fields: ["name", "full_name", "custom_user_role", "enabled", "user_image"],
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

    const handleUpdateUserRole = (userName, newRole) => {
        if (typeof frappe === "undefined") return;
        
        frappe.call({
            method: "frappe.client.set_value",
            args: {
                doctype: "User",
                name: userName,
                fieldname: "custom_user_role",
                value: newRole,
            },
            callback: (r) => {
                if (r.message) {
                    message.success(`Assigned role "${newRole}" to user "${userName}" successfully.`);
                    setUsers((prev) =>
                        prev.map((u) =>
                            u.name === userName ? { ...u, custom_user_role: newRole } : u
                        )
                    );
                    fetchUserPermissions(userName);
                }
            },
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
                        <RoleListSidePanel
                            loading={loadingRoles}
                            roles={roles}
                            selectedRole={selectedRole}
                            onSelectRole={(item) => {
                                setSelectedRole(item.name);
                                setSelectedRoleMeta(item);
                            }}
                            onAddRoleClick={() => setCreateModalOpen(true)}
                            onDeleteRole={handleDeleteRole}
                        />
                    </Col>

                    <Col xs={24} lg={16}>
                        {selectedRole ? (
                            <RolePermissionsTable
                                selectedRole={selectedRole}
                                selectedRoleMeta={selectedRoleMeta}
                                loadingPerms={loadingPerms}
                                saving={saving}
                                permissions={permissions}
                                onEditRoleClick={openEditModal}
                                onSavePermissions={handleSavePermissions}
                                onPermissionChange={handlePermissionChange}
                                onToggleAll={handleToggleAll}
                                onRemoveDoctype={handleRemoveDoctype}
                                canRemoveDoctypes={canRemoveDoctypes}
                            />
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
                        <UserListSidePanel
                            loading={loadingUsers}
                            users={users}
                            selectedUser={selectedUser}
                            onSelectUser={setSelectedUser}
                        />
                    </Col>

                    <Col xs={24} lg={16}>
                        {selectedUser ? (
                            <UserExtraPermissionsTable
                                selectedUser={selectedUser}
                                userNameDisplay={users.find(u => u.name === selectedUser)?.full_name || selectedUser}
                                loadingUserPerms={loadingUserPerms}
                                savingUserPerms={savingUserPerms}
                                userPermissions={userPermissions}
                                roles={roles}
                                currentRole={users.find(u => u.name === selectedUser)?.custom_user_role}
                                onRoleChange={(newRole) => handleUpdateUserRole(selectedUser, newRole)}
                                onReset={handleResetUserPermissions}
                                onSave={handleSaveUserPermissions}
                                onPermissionChange={handleUserPermissionChange}
                                onToggleAll={handleUserToggleAll}
                            />
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
                        label="Modules (optional)"
                        extra="Select which modules this role can access. You can add more later."
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Select Modules"
                            options={availableDoctypes.map((dt) => ({ label: dt === "Temple" ? "Trust" : (dt === "Temple Details" ? "Trust Details" : dt), value: dt }))}
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
                title="Add Modules"
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
                        label="Modules"
                        rules={[{ required: true, message: "Select at least one module" }]}
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Select modules to add"
                            options={addableDoctypes.map((dt) => ({ label: dt === "Temple" ? "Trust" : (dt === "Temple Details" ? "Trust Details" : dt), value: dt }))}
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
