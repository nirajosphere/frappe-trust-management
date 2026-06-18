import React, { useEffect } from "react";
import {
    Form, Input, Select, Avatar, Tag, Row, Col, Alert
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
import ActivityLog from "../../components/common/ActivityLog";
import PageLoader from "../../components/common/PageLoader";
import FormFooter from "../../components/common/FormFooter";

// --- Clean & Minimalist Section Title with Tailwind ---
const SectionTitle = ({ icon, children }) => (
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-200 pb-2.5 mb-5 mt-1">
        {icon} {children}
    </div>
);

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

    // --- Form Watchers for Live Preview Panel ---
    const firstName  = Form.useWatch("first_name", form) || "";
    const lastName   = Form.useWatch("last_name",  form) || "";
    const userRole   = Form.useWatch("custom_user_role", form) || "";
    const userImage  = data?.user_image || "";
    const initials   = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";

    // --- Effect for Form Setup and Binding ---
    useEffect(() => {
        if (isEdit && data) {
            const values = { ...data };
            values.enabled = values.enabled ? "Active" : "Inactive";
            if (data.custom_select_temple) {
                values.custom_select_temple = data.custom_select_temple.map(t => t.temple);
            }
            form.setFieldsValue(values);
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
            if (isEdit) await updateDoc(DOCTYPE_USER, id, payload);
            else        await createDoc(DOCTYPE_USER, payload);
            if (onBack) onBack();
        } catch (err) { 
            console.error("Save Error:", err); 
        }
    };

    if (isEdit && loading) return <PageLoader />;
    if (isEdit && error)   return <Alert message="Error loading user" type="error" />;

    return (
        <div className="max-w-6xl mx-auto p-4 pb-28 form-fade-in">
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Edit User" : "Add User"}
                subtitle="User Management"
            />

            <Form layout="vertical" form={form} onFinish={handleSave} requiredMark={false}>
                <div className="flex flex-col md:flex-row items-start gap-6">

                    {/* ─── LEFT: Avatar / Info Panel ─── */}
                    <div className="w-full md:w-[230px] shrink-0 bg-white border border-zinc-200 rounded-xl p-6 flex flex-col items-center gap-4 shadow-sm">
                        <Avatar
                            size={88}
                            src={userImage || undefined}
                            icon={!userImage && <UserOutlined />}
                            className={`text-2xl font-black border-2 border-zinc-100 shadow-sm ${
                                userImage ? "" : "bg-zinc-900 text-white"
                            }`}
                        >
                            {!userImage && initials}
                        </Avatar>

                        <div className="text-center w-full">
                            <div className="text-sm font-bold text-zinc-900 leading-snug break-words">
                                {firstName || lastName ? `${firstName} ${lastName}`.trim() : (isEdit ? data?.full_name : "New User")}
                            </div>
                            {isEdit && (
                                <div className="text-xs text-zinc-400 mt-1 break-all">
                                    {id}
                                </div>
                            )}
                        </div>

                        {userRole && (
                            <Tag className="rounded-full px-3 py-0.5 font-bold text-[10px] uppercase tracking-wider bg-zinc-900 text-white border-none m-0">
                                {userRole}
                            </Tag>
                        )}

                        <div className="w-full border-t border-zinc-100 pt-3 mt-1 flex flex-col gap-1.5">
                            {isEdit && (
                                <div className="text-[11px] text-zinc-500 text-center font-semibold flex items-center justify-center gap-1.5">
                                    <CheckCircleOutlined className="text-emerald-600" />
                                    Registered User
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ─── RIGHT: Form Inputs ─── */}
                    <div className="flex-1 w-full flex flex-col gap-6">

                        {/* Card 1: Basic Info */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                            <SectionTitle icon={<UserOutlined />}>Basic Information</SectionTitle>
                            <Row gutter={[24, 16]}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="first_name" label="First Name" rules={[{ required: true, message: "Required" }]}>
                                        <Input prefix={<UserOutlined className="text-zinc-400" />} placeholder="First Name" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="last_name" label="Last Name">
                                        <Input prefix={<UserOutlined className="text-zinc-400" />} placeholder="Last Name" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="email" label="Email Address" rules={[{ required: true, type: "email", message: "Valid email required" }]}>
                                        <Input prefix={<MailOutlined className="text-zinc-400" />} placeholder="email@example.com" disabled={isEdit} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="custom_test" label="Contact Number" rules={[{ required: true, message: "Required" }]}>
                                        <Input prefix={<PhoneOutlined className="text-zinc-400" />} placeholder="Mobile Number" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* Card 2: Role & Access */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                            <SectionTitle icon={<SafetyOutlined />}>Role & Access</SectionTitle>
                            <Row gutter={[24, 16]}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="custom_user_role" label="User Role" rules={[{ required: true, message: "Required" }]}>
                                        <Select placeholder="Select Role" disabled={disableAdminFields}
                                            options={[
                                                { label: "Super Admin",  value: "Super Admin"  },
                                                { label: "Temple Admin", value: "Temple Admin" },
                                                { label: "Cashier",      value: "Cashier"      },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="custom_select_temple" label="Assigned Temples" rules={[{ required: true, message: "Required" }]}>
                                        <Select mode="multiple" placeholder="Select Temples" disabled={disableAdminFields} allowClear>
                                            {temples?.map(t => (
                                                <Select.Option key={t.name} value={t.name}>{t.temple_name}</Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="enabled" label="Account Status" rules={[{ required: true }]}>
                                        <Select disabled={disableAdminFields}
                                            options={[
                                                { label: "Active",   value: "Active"   },
                                                { label: "Inactive", value: "Inactive" },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="custom_status" label="Status" rules={[{ required: true }]}>
                                        <Select disabled={disableAdminFields}
                                            options={[
                                                { label: "Active",   value: "Active"   },
                                                { label: "Inactive", value: "Inactive" },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* Card 3: Security */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                            <SectionTitle icon={<LockOutlined />}>Security</SectionTitle>
                            <Row gutter={[24, 16]}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="new_password" label={isEdit ? "New Password (optional)" : "Password"} rules={[{ required: !isEdit, message: "Required" }]}>
                                        <Input.Password prefix={<LockOutlined className="text-zinc-400" />} placeholder={isEdit ? "Leave blank to keep current" : "Set password"} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="custom_opening_balance" label="Opening Balance">
                                        <Input prefix={<DollarOutlined className="text-zinc-400" />} placeholder="0.00" disabled={disableAdminFields} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* Card 4: Notes */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                            <SectionTitle icon={<FileTextOutlined />}>Internal Notes</SectionTitle>
                            <Form.Item name="custom_internal_notes" label="Notes" className="m-0">
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Add internal notes about this user..."
                                    disabled={disableAdminFields}
                                    className="resize-none"
                                />
                            </Form.Item>
                        </div>

                    </div>
                </div>

                <FormFooter
                    onCancel={onBack}
                    loading={creating || updating}
                    isEdit={isEdit}
                    saveText={isEdit ? "Update User" : "Create User"}
                />
            </Form>

            {isEdit && <ActivityLog doctype={DOCTYPE_USER} docname={id} />}
        </div>
    );
};

export default UserForm;