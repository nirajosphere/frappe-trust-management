import React, { useEffect, useState } from "react";
import {
    Form, Input, Select, Avatar, Tag, Row, Col, Alert, Card, Space, Button, Modal, Checkbox, Spin
} from "antd";
import {
    UserOutlined, MailOutlined, PhoneOutlined, LockOutlined,
    SafetyOutlined, FileTextOutlined, DollarOutlined, CheckCircleOutlined
} from "@ant-design/icons";
import {
    useFrappeCreateDoc,
    useFrappeUpdateDoc,
    useFrappeGetDoc,
    useFrappeGetDocList
} from "../../hooks/useFrappe";
import { DOCTYPE_USER, DOCTYPE_TEMPLE } from "../../config/constants";
import AddPageHeader from "../../components/common/AddPageHeader";
import PageLoader from "../../components/common/PageLoader";
import FormFooter from "../../components/common/FormFooter";
import ViewContainer from "../../components/common/ViewContainer";
import SectionCard from "../../components/common/SectionCard";


const UserForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    const userRoles = typeof frappe !== "undefined" ? (frappe.user_roles || []) : [];
    const isUserAdmin = userRoles.some(r => ["System Manager","Super Admin","Administrator","Temple Admin"].includes(r));
    const isSelfProfile = isEdit && id === (typeof frappe !== "undefined" ? frappe.session.user : "");
    const disableAdminFields = isSelfProfile && !isUserAdmin;

    // --- Frappe API Hooks ---
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data, loading, error } = useFrappeGetDoc(DOCTYPE_USER, id);
    const { data: temples } = useFrappeGetDocList(DOCTYPE_TEMPLE, { fields: ["name", "temple_name"] });
    const [assignableRoles, setAssignableRoles] = useState([]);

    // --- Extra Permission State ---
    const [permModalOpen, setPermModalOpen] = useState(false);
    const [userPermissions, setUserPermissions] = useState([]);
    const [loadingUserPerms, setLoadingUserPerms] = useState(false);

    useEffect(() => {
        if (typeof frappe === "undefined") return;
        frappe.call({
            method: "temple_donation.api.get_assignable_roles",
            callback: (r) => {
                if (r.message) setAssignableRoles(r.message);
            },
        });
    }, []);

    // --- Form Watchers for Live Preview Panel ---
    const firstName  = Form.useWatch("first_name", form) || "";
    const lastName   = Form.useWatch("last_name",  form) || "";
    const userRole   = Form.useWatch("custom_user_role", form) || "";
    const userImage  = data?.user_image || "";
    const initials   = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";

    const fetchPermissionsForRole = (role) => {
        if (typeof frappe === "undefined" || !role) return;
        setLoadingUserPerms(true);
        frappe.call({
            method: "temple_donation.api.get_user_extra_permissions",
            args: {
                role_name: role,
                user_name: isEdit ? id : undefined
            },
            callback: (r) => {
                setLoadingUserPerms(false);
                if (r.message) {
                    setUserPermissions(r.message);
                }
            },
            error: () => setLoadingUserPerms(false)
        });
    };

    const handleRoleChange = (val) => {
        form.setFieldValue("custom_user_role", val);
        fetchPermissionsForRole(val);
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

    const handleResetUserPermissions = () => {
        setUserPermissions((prev) =>
            prev.map((row) => ({
                ...row,
                read: 0,
                write: 0,
                create: 0,
                delete: 0,
                is_extra: false
            }))
        );
    };

    // --- Effect for Form Setup and Binding ---
    useEffect(() => {
        if (isEdit && data) {
            const values = { ...data };
            values.enabled = values.enabled ? "Active" : "Inactive";
            if (data.custom_select_temple) {
                values.custom_select_temple = data.custom_select_temple.map(t => t.temple);
            }
            form.setFieldsValue(values);
            if (data.custom_user_role) {
                fetchPermissionsForRole(data.custom_user_role);
            }
        } else {
            form.setFieldsValue({ enabled: "Active" });
        }
    }, [data, isEdit, form]);

    // --- Form Submission Logic ---
    const handleSave = async (values) => {
        try {
            const payload = { ...values };
            payload.enabled = payload.enabled === "Active" ? 1 : 0;
            if (payload.custom_select_temple)
                payload.custom_select_temple = payload.custom_select_temple.map(t => ({ temple: t }));
            delete payload.confirm_password;
            if (!payload.new_password) delete payload.new_password;

            if (isEdit) {
                await updateDoc(DOCTYPE_USER, id, payload);
            } else {
                await createDoc(DOCTYPE_USER, payload);
            }

            // Save the extra permissions!
            const userName = isEdit ? id : values.email;
            if (userName && userPermissions.length > 0 && typeof frappe !== "undefined") {
                await new Promise((resolve, reject) => {
                    frappe.call({
                        method: "temple_donation.api.save_user_extra_permissions",
                        args: {
                            user_name: userName,
                            permissions: JSON.stringify(userPermissions),
                        },
                        callback: (r) => {
                            resolve(r.message);
                        },
                        error: (err) => reject(err)
                    });
                });
            }

            if (onBack) onBack();
        } catch (err) { 
            console.error("Save Error:", err); 
        }
    };

    if (isEdit && loading) return <PageLoader />;
    if (isEdit && error)   return <Alert message="Error loading user" type="error" />;

    // --- Premium Glassmorphism & Soft UI Configuration ---
    // const premiumCardProps = {
    //     size: "small",
    //     className: "transition-all duration-300 hover:shadow-md border border-zinc-200/80 rounded-2xl overflow-hidden",
    //     style: { 
    //         background: '#ffffff',
    //         boxShadow: '0 4px 20px -2px rgba(24, 24, 27, 0.03), 0 2px 8px -1px rgba(24, 24, 27, 0.02)'
    //     },
    //     headStyle: {
    //         background: 'linear-gradient(to right, #f8f8f9, #f4f4f5)',
    //         borderBottom: '1px solid #e4e4e7',
    //         paddingTop: '12px',
    //         paddingBottom: '12px',
    //     },
    //     bodyStyle: { 
    //         padding: '20px' 
    //     }
    // };

    return (
        <ViewContainer className="donation-page">
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Edit User" : "Add User"}
                subtitle="User Management Portal"
                showBack={true}
            />

            <Form layout="vertical" form={form} onFinish={handleSave} requiredMark={false} size="middle">
                <Row gutter={[24, 24]}>

                    {/* ─── LEFT COLUMN: Profile Panel (7/24 Span) ─── */}
                    <Col xs={24} lg={7}>
                        <div className="sticky top-6" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <SectionCard 
                                title="User Profile"
                                icon={<UserOutlined style={{ color: '#09090b' }} />}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '12px 0 4px 0' }}>
                                    <Avatar
                                        size={96}
                                        src={userImage || undefined}
                                        icon={!userImage && <UserOutlined />}
                                        style={{
                                            fontSize: 32, 
                                            fontWeight: 800,
                                            border: '4px solid #fff',
                                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
                                            background: userImage ? undefined : 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
                                            color: '#fff'
                                        }}
                                    >
                                        {!userImage && initials}
                                    </Avatar>

                                    <div style={{ textAlign: 'center', width: '100%' }}>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#09090b', letterSpacing: '-0.02em', lineBreak: 'anywhere' }}>
                                            {firstName || lastName ? `${firstName} ${lastName}`.trim() : (isEdit ? data?.full_name : "New User")}
                                        </div>
                                        {isEdit && (
                                            <div style={{ fontSize: 11, color: '#71717a', marginTop: 6, wordBreak: 'break-all', fontFamily: 'monospace', background: '#f4f4f5', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>
                                                {id}
                                            </div>
                                        )}
                                    </div>

                                    {userRole && (
                                        <Tag style={{ borderRadius: 6, padding: '3px 12px', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', backgroundColor: '#09090b', color: '#fff', border: 'none', margin: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                            {userRole}
                                        </Tag>
                                    )}

                                    {isEdit && (
                                        <div style={{ width: '100%', borderTop: '1px solid #e4e4e7', paddingTop: 14, marginTop: 4, textAlign: 'center' }}>
                                            <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                <CheckCircleOutlined style={{ fontSize: 14 }} />
                                                Verified Identity
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </SectionCard>
                        </div>
                    </Col>

                    {/* ─── RIGHT COLUMN: Form Worksurface (17/24 Span) ─── */}
                    <Col xs={24} lg={17}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                            {/* Section 1: Basic Info */}
                            <SectionCard 
                                title="Basic Information"
                                icon={<UserOutlined style={{ color: '#09090b' }} />}
                            >
                                <Row gutter={[16, 4]}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="first_name" label={<span style={{ fontWeight: 600, color: '#27272a' }}>First Name</span>} rules={[{ required: true, message: "Required" }]}>
                                            <Input prefix={<UserOutlined style={{ color: '#a1a1aa' }} />} placeholder="First Name" style={{ borderRadius: '8px' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="last_name" label={<span style={{ fontWeight: 600, color: '#27272a' }}>Last Name</span>}>
                                            <Input prefix={<UserOutlined style={{ color: '#a1a1aa' }} />} placeholder="Last Name" style={{ borderRadius: '8px' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="email" label={<span style={{ fontWeight: 600, color: '#27272a' }}>Email Address</span>} rules={[{ required: true, type: "email", message: "Valid email required" }]}>
                                            <Input prefix={<MailOutlined style={{ color: '#a1a1aa' }} />} placeholder="email@example.com" disabled={isEdit} style={{ borderRadius: '8px' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="custom_test" label={<span style={{ fontWeight: 600, color: '#27272a' }}>Contact Number</span>} rules={[{ required: true, message: "Required" }]}>
                                            <Input prefix={<PhoneOutlined style={{ color: '#a1a1aa' }} />} placeholder="Mobile Number" maxLength={10} style={{ borderRadius: '8px' }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </SectionCard>

                            {/* Section 2: Role & Access */}
                            <SectionCard 
                                title="Role & Access Matrix"
                                icon={<SafetyOutlined style={{ color: '#09090b' }} />}
                            >
                                <Row gutter={[16, 4]}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="custom_user_role" label={<span style={{ fontWeight: 600, color: '#27272a' }}>User Role</span>} rules={[{ required: true, message: "Required" }]}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <Select
                                                    value={userRole || undefined}
                                                    placeholder="Select Role"
                                                    disabled={disableAdminFields}
                                                    style={{ flex: 1 }}
                                                    onChange={handleRoleChange}
                                                    options={assignableRoles.length > 0
                                                        ? assignableRoles.map((role) => ({
                                                            label: role.label,
                                                            value: role.name,
                                                        }))
                                                        : [
                                                            { label: "Super Admin", value: "Super Admin" },
                                                            { label: "Trust Admin", value: "Temple Admin" },
                                                            { label: "Cashier", value: "Cashier" },
                                                        ]}
                                                />
                                                {userRole && (
                                                    <Button
                                                        type={userPermissions.some(p => p.read || p.write || p.create || p.delete) ? "primary" : "default"}
                                                        icon={<SafetyOutlined />}
                                                        onClick={() => setPermModalOpen(true)}
                                                        style={{ 
                                                            borderRadius: '8px', 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            justifyContent: 'center',
                                                            backgroundColor: userPermissions.some(p => p.read || p.write || p.create || p.delete) ? '#09090b' : undefined,
                                                            borderColor: userPermissions.some(p => p.read || p.write || p.create || p.delete) ? '#09090b' : undefined,
                                                            color: userPermissions.some(p => p.read || p.write || p.create || p.delete) ? '#ffffff' : '#09090b',
                                                        }}
                                                    >
                                                        Permissions
                                                    </Button>
                                                )}
                                            </div>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="custom_select_temple" label={<span style={{ fontWeight: 600, color: '#27272a' }}>Assigned Trust</span>} rules={[{ required: true, message: "Required" }]}>
                                            <Select mode="multiple" placeholder="Select Trusts" disabled={disableAdminFields} allowClear maxTagCount="responsive" style={{ width: '100%' }}>
                                                {temples?.map(t => (
                                                    <Select.Option key={t.name} value={t.name}>{t.temple_name}</Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="enabled" label={<span style={{ fontWeight: 600, color: '#27272a' }}>Account Status</span>} rules={[{ required: true }]}>
                                            <Select disabled={disableAdminFields} style={{ width: '100%' }}
                                                options={[
                                                    { label: "Active",   value: "Active"   },
                                                    { label: "Inactive", value: "Inactive" },
                                                ]}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="custom_status" label={<span style={{ fontWeight: 600, color: '#27272a' }}>System Status</span>} rules={[{ required: true }]}>
                                            <Select disabled={disableAdminFields} style={{ width: '100%' }}
                                                options={[
                                                    { label: "Active",   value: "Active"   },
                                                    { label: "Inactive", value: "Inactive" },
                                                ]}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </SectionCard>

                            {/* Section 3: Security */}
                            <SectionCard 
                                title="Security & Balances"
                                icon={<LockOutlined style={{ color: '#09090b' }} />}
                            >
                                <Row gutter={[16, 4]}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="new_password" label={<span style={{ fontWeight: 600, color: '#27272a' }}>{isEdit ? "New Password (optional)" : "Password"}</span>} rules={[{ required: !isEdit, message: "Required" }]}>
                                            <Input.Password prefix={<LockOutlined style={{ color: '#a1a1aa' }} />} placeholder={isEdit ? "Leave blank to keep current" : "Set password"} style={{ borderRadius: '8px' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="custom_opening_balance" label={<span style={{ fontWeight: 600, color: '#27272a' }}>Opening Balance</span>}>
                                            <Input prefix={<DollarOutlined style={{ color: '#a1a1aa' }} />} placeholder="0.00" disabled={disableAdminFields} type="number" step="0.01" style={{ borderRadius: '8px' }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </SectionCard>

                            {/* Section 4: Notes */}
                            <SectionCard 
                                title="Internal Notes"
                                icon={<FileTextOutlined style={{ color: '#09090b' }} />}
                            >
                                <Form.Item name="custom_internal_notes" style={{ marginBottom: 0 }}>
                                    <Input.TextArea
                                        rows={3}
                                        placeholder="Add sensitive internal logs or operation notes here..."
                                        disabled={disableAdminFields}
                                        style={{ resize: 'none', borderRadius: '8px', padding: '10px' }}
                                    />
                                </Form.Item>
                            </SectionCard>

                        </div>
                    </Col>

                </Row>

                {/* Bottom Save/Cancel Actions */}
                <div style={{ marginTop: '24px' }}>
                    <FormFooter
                        onCancel={onBack}
                        loading={creating || updating}
                        isEdit={isEdit}
                        saveText={isEdit ? "Update User" : "Create User"}
                    />
                </div>
            </Form>

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 700, color: '#09090b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, backgroundColor: '#f4f4f5' }}>
                            <SafetyOutlined style={{ color: '#09090b', fontSize: 16 }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, lineHeight: '1.2' }}>Extra Permission Overrides</div>
                            <div style={{ fontSize: 11, fontWeight: 400, color: '#71717a', marginTop: 2 }}>Custom overrides for user permissions</div>
                        </div>
                    </div>
                }
                open={permModalOpen}
                onOk={() => setPermModalOpen(false)}
                onCancel={() => setPermModalOpen(false)}
                width={800}
                bodyStyle={{ maxHeight: '60vh', overflowY: 'auto', padding: '16px 24px' }}
                footer={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 24px 16px 24px' }}>
                        <Button 
                            danger 
                            type="text" 
                            onClick={handleResetUserPermissions}
                            style={{ 
                                padding: 0, 
                                fontWeight: 500, 
                                fontSize: 13, 
                                display: 'inline-flex', 
                                alignItems: 'center',
                                gap: 6 
                            }}
                        >
                            Reset overrides to default
                        </Button>
                        <Space size={12}>
                            <Button 
                                onClick={() => setPermModalOpen(false)}
                                style={{ borderRadius: 8, fontWeight: 500 }}
                            >
                                Close
                            </Button>
                            <Button 
                                type="primary" 
                                onClick={() => setPermModalOpen(false)}
                                style={{ borderRadius: 8, fontWeight: 500, backgroundColor: '#09090b', borderColor: '#09090b' }}
                            >
                                Apply
                            </Button>
                        </Space>
                    </div>
                }
            >
                <div>
                    <Alert
                        message="Configure extra permissions that this user should have in addition to their default role. Grayed-out checkboxes are already active from the selected role."
                        type="info"
                        showIcon
                        style={{ marginBottom: 20, borderRadius: 8, border: '1px solid #e0f2fe', backgroundColor: '#f0f9ff' }}
                    />
                    {loadingUserPerms ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Spin />
                        </div>
                    ) : userPermissions.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#71717a', padding: '32px 0', fontSize: 13 }}>
                            Please select a user role first to view permission defaults.
                        </div>
                    ) : (
                        <div style={{ border: '1px solid #e4e4e7', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #e4e4e7' }}>
                                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DocType</th>
                                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Read</th>
                                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Write</th>
                                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Create</th>
                                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Delete</th>
                                        <th style={{ padding: '12px 18px', fontSize: 12, fontWeight: 600, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>All</th>
                                    </tr>
                                </thead>
                                <tbody>
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
                                        const hasActiveOverride = row.read || row.write || row.create || row.delete;

                                        return (
                                            <tr 
                                                key={row.doctype} 
                                                style={{ borderBottom: '1px solid #f4f4f5', transition: 'background-color 0.2s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <td style={{ padding: '12px 18px', fontSize: 13, fontWeight: 500, color: '#18181b' }}>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                                        {row.doctype}
                                                        {hasActiveOverride ? (
                                                            <Tag color="blue" style={{ fontSize: 10, borderRadius: 4, padding: '0 6px', fontWeight: 600, border: 'none', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>override</Tag>
                                                        ) : null}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                                                    <Checkbox
                                                        checked={!!row.role_read || !!row.read}
                                                        disabled={!!row.role_read}
                                                        onChange={(e) => handleUserPermissionChange(row.doctype, "read", e.target.checked)}
                                                    />
                                                </td>
                                                <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                                                    <Checkbox
                                                        checked={!!row.role_write || !!row.write}
                                                        disabled={!!row.role_write}
                                                        onChange={(e) => handleUserPermissionChange(row.doctype, "write", e.target.checked)}
                                                    />
                                                </td>
                                                <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                                                    <Checkbox
                                                        checked={!!row.role_create || !!row.create}
                                                        disabled={!!row.role_create}
                                                        onChange={(e) => handleUserPermissionChange(row.doctype, "create", e.target.checked)}
                                                    />
                                                </td>
                                                <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                                                    <Checkbox
                                                        checked={!!row.role_delete || !!row.delete}
                                                        disabled={!!row.role_delete}
                                                        onChange={(e) => handleUserPermissionChange(row.doctype, "delete", e.target.checked)}
                                                    />
                                                </td>
                                                <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                                                    <Checkbox
                                                        checked={!!isAllChecked}
                                                        disabled={!!isAllDisabled}
                                                        onChange={(e) => handleUserToggleAll(row.doctype, e.target.checked)}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Modal>
        </ViewContainer>
    );
};

export default UserForm;