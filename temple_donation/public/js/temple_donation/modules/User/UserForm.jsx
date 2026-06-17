// import React, { useEffect } from "react";
// import {
//     Form, Input, Button, Card, Typography, Space, Row, Col,
//     message, Spin, Alert, Select
// } from "antd";
// import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
// import {
//     useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDoc, useFrappeGetDocList
// } from "../../hooks/useFrappe";
// import { DOCTYPE_USER, DOCTYPE_TEMPLE } from "../../config/constants";
// import { userFormFields } from "../../formfield/userFormFields";
// import PageHeader from "../../components/common/PageHeader";

// const { Title, Text } = Typography;

// const UserForm = ({ id, onBack }) => {
//     const isEdit = !!id;
//     const [form] = Form.useForm();

//     const { createDoc, loading: creating } = useFrappeCreateDoc();
//     const { updateDoc, loading: updating } = useFrappeUpdateDoc();
//     const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(DOCTYPE_USER, id);

//     // Fetch temples for the dropdown
//     const { data: temples } = useFrappeGetDocList(DOCTYPE_TEMPLE, { fields: ["name", "temple_name"] });

//     useEffect(() => {
//         if (isEdit && initialValues) {
//             console.log("Setting form values with:", initialValues);
//             const values = { ...initialValues };

//             // Transform enabled numeric value to string for Select
//             if (values.hasOwnProperty('enabled')) {
//                 values.enabled = values.enabled ? "Active" : "Inactive";
//             }

//             // Transform child table array to string array for MultiSelect
//             if (values.custom_assigned_temples && Array.isArray(values.custom_assigned_temples)) {
//                 values.custom_assigned_temples = values.custom_assigned_temples.map(t => t.temple);
//             }

//             form.setFieldsValue(values);
//         } else if (!isEdit) {
//             const defaultValues = {};
//             userFormFields.fields.forEach(f => {
//                 if (f.defaultValue) defaultValues[f.name] = f.defaultValue;
//             });
//             form.setFieldsValue(defaultValues);
//         }
//     }, [isEdit, initialValues, form]);

//     const handleSave = async (values) => {
//         try {
//             // Transform values for Frappe
//             const payload = { ...values };

//             // Convert status to boolean for Frappe 'enabled' field
//             if (payload.enabled) {
//                 payload.enabled = payload.enabled === "Active" ? 1 : 0;
//             }

//             // Transform string array back to child table array for Frappe
//             if (payload.custom_assigned_temples && Array.isArray(payload.custom_assigned_temples)) {
//                 payload.custom_assigned_temples = payload.custom_assigned_temples.map(t => ({ temple: t }));
//             }

//             // Remove confirm_password as it's not a DocType field
//             delete payload.confirm_password;

//             if (isEdit) {
//                 // On edit, if password is empty, don't send it
//                 if (!payload.new_password) {
//                     delete payload.new_password;
//                 }
//                 await updateDoc(DOCTYPE_USER, id, payload);
//                 message.success("User updated successfully!");
//             } else {
//                 await createDoc(DOCTYPE_USER, payload);
//                 message.success("User created successfully!");
//             }
//             if (onBack) onBack();
//         } catch (err) {
//             message.error(err.message || "Something went wrong.");
//         }
//     };

//     if (isEdit && fetching) {
//         return (
//             <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
//                 <Spin size="large" />
//                 <Text className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Fetching user record...</Text>
//             </div>
//         );
//     }

//     return (
//         <div className="max-w-5xl mx-auto py-6">
//             <PageHeader
//                 onBack={onBack}
//                 subtitle="User & Security Management"
//                 title={isEdit ? "Edit User" : "Add New User"}
//             />

//             <Card size="small" className="aavatto-card border-zinc-100 shadow-sm rounded-xl">
//                 <Form
//                     form={form}
//                     layout="vertical"
//                     onFinish={handleSave}
//                     scrollToFirstError
//                     requiredMark={false}
//                     className="p-8"
//                 >
//                     <Row gutter={[24, 0]}>
//                         <Col xs={24} md={12}>
//                             <Form.Item
//                                 name="email"
//                                 label={<Text strong className="text-zinc-500">Email Address</Text>}
//                                 rules={[{ required: true, message: 'Required' }]}
//                             >
//                                 <Input placeholder="Email" className="h-10 border-zinc-200 bg-zinc-50/30 rounded-lg px-4" />
//                             </Form.Item>
//                         </Col>

//                         <Col xs={24} md={12}>
//                             <Form.Item
//                                 name="first_name"
//                                 label={<Text strong className="text-zinc-500">First Name</Text>}
//                                 rules={[{ required: true, message: 'Required' }]}
//                             >
//                                 <Input placeholder="First Name" className="h-10 border-zinc-200 bg-zinc-50/30 rounded-lg px-4" />
//                             </Form.Item>
//                         </Col>

//                         <Col xs={24} md={12}>
//                             <Form.Item
//                                 name="last_name"
//                                 label={<Text strong className="text-zinc-500">Last Name</Text>}
//                             >
//                                 <Input placeholder="Last Name" className="h-10 border-zinc-200 bg-zinc-50/30 rounded-lg px-4" />
//                             </Form.Item>
//                         </Col>

//                         <Col xs={24} md={12}>
//                             <Form.Item
//                                 name="custom_test"
//                                 label={<Text strong className="text-zinc-500">Contact Number</Text>}
//                                 rules={[{ required: true, message: 'Required' }]}
//                             >
//                                 <Input placeholder="Contact" className="h-10 border-zinc-200 bg-zinc-50/30 rounded-lg px-4" />
//                             </Form.Item>
//                         </Col>

//                         <Col xs={24} md={12}>
//                             <Form.Item
//                                 name="custom_user_role"
//                                 label={<Text strong className="text-zinc-500">User Role</Text>}
//                                 rules={[{ required: true, message: 'Required' }]}
//                             >
//                                 <Select placeholder="Select Role" className="h-10 w-full">
//                                     <Select.Option value="Super Admin">Super Admin</Select.Option>
//                                     <Select.Option value="Temple Admin">Temple Admin</Select.Option>
//                                     <Select.Option value="Cashier">Cashier</Select.Option>
//                                 </Select>
//                             </Form.Item>
//                         </Col>

//                         <Col xs={24} md={12}>
//                             <Form.Item
//                                 name="custom_assigned_temples"
//                                 label={<Text strong className="text-zinc-500">Select Temples</Text>}
//                                 rules={[{ required: true, message: 'Required' }]}
//                             >
//                                 <Select mode="multiple" placeholder="Select Temples" className="h-10 w-full" allowClear>
//                                     {temples?.map(t => (
//                                         <Select.Option key={t.name} value={t.name}>{t.temple_name || t.name}</Select.Option>
//                                     ))}
//                                 </Select>
//                             </Form.Item>
//                         </Col>

//                         <Col xs={24} md={12}>
//                             <Form.Item
//                                 name="new_password"
//                                 label={<Text strong className="text-zinc-500">Password</Text>}
//                                 rules={[{ required: !isEdit, message: 'Required' }]}
//                             >
//                                 <Input.Password placeholder="Password" size="large" className="border-zinc-200 bg-zinc-50/30 rounded-lg" />
//                             </Form.Item>
//                         </Col>

//                         {/* Enabled Status */}
//                         <Col xs={24} md={12}>
//                             <Form.Item
//                                 name="enabled"
//                                 label={<Text strong className="text-zinc-500">Account Status</Text>}
//                                 rules={[{ required: true }]}
//                             >
//                                 <Select className="h-10 w-full">
//                                     <Select.Option value="Active">Active</Select.Option>
//                                     <Select.Option value="Inactive">Inactive</Select.Option>
//                                 </Select>
//                             </Form.Item>
//                         </Col>

//                         {/* Custom Status */}
//                         <Col xs={24} md={12}>
//                             <Form.Item
//                                 name="custom_status"
//                                 label={<Text strong className="text-zinc-500">Status</Text>}
//                                 rules={[{ required: true }]}
//                             >
//                                 <Select className="h-10 w-full">
//                                     <Select.Option value="Active">Active</Select.Option>
//                                     <Select.Option value="Inactive">Inactive</Select.Option>
//                                 </Select>
//                             </Form.Item>
//                         </Col>

//                         <Col xs={24} md={12}>
//                             <Form.Item
//                                 name="custom_opening_balance"
//                                 label={<Text strong className="text-zinc-500">Opening Balance</Text>}
//                             >
//                                 <Input placeholder="0.00" className="h-10 border-zinc-200 bg-zinc-50/30 rounded-lg px-4" />
//                             </Form.Item>
//                         </Col>

//                         <Col xs={24}>
//                             <Form.Item
//                                 name="custom_internal_notes"
//                                 label={<Text strong className="text-zinc-500">Internal Notes</Text>}
//                             >
//                                 <Input.TextArea rows={4} placeholder="Notes..." className="border-zinc-200 bg-zinc-50/30 rounded-lg p-4" />
//                             </Form.Item>
//                         </Col>
//                     </Row>

//                     <div className="flex items-center justify-end gap-3 mt-10 border-t border-zinc-100 pt-8">
//                         <Button
//                             onClick={onBack}
//                             className="h-10 px-8 font-bold border-zinc-200 text-zinc-400 hover:text-zinc-900 transition-all text-xs uppercase tracking-widest"
//                         >
//                             Cancel
//                         </Button>
//                         <Button
//                             type="primary"
//                             htmlType="submit"
//                             loading={creating || updating}
//                             icon={<SaveOutlined />}
//                             className="h-10 px-10 font-bold bg-zinc-900 hover:bg-black border-none shadow-md flex items-center gap-2 text-xs uppercase tracking-widest"
//                         >
//                             {isEdit ? "Update User" : "Create User"}
//                         </Button>
//                     </div>
//                 </Form>
//             </Card>
//         </div>
//     );
// };

// export default UserForm;

import React, { useEffect } from "react";
import {
    Form, Input, Button, Card, Typography, Row, Col,
    message, Alert, Select
} from "antd";
import { SaveOutlined } from "@ant-design/icons";

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

const { Text } = Typography;

const UserForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    const userRoles = typeof frappe !== "undefined" ? (frappe.user_roles || []) : [];
    const isUserAdmin = userRoles.includes("System Manager") || userRoles.includes("Super Admin") || userRoles.includes("Administrator") || userRoles.includes("Temple Admin");
    const isSelfProfile = isEdit && id === (typeof frappe !== "undefined" ? frappe.session.user : "");
    const disableAdminFields = isSelfProfile && !isUserAdmin;

    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data, loading, error } = useFrappeGetDoc(DOCTYPE_USER, id);

    const { data: temples } = useFrappeGetDocList(DOCTYPE_TEMPLE, {
        fields: ["name", "temple_name"]
    });

    useEffect(() => {
        if (isEdit && data) {
            const values = { ...data };

            values.enabled = values.enabled ? "Active" : "Inactive";

            if (data.custom_select_temple) {
                values.custom_select_temple =
                    data.custom_select_temple.map(t => t.temple);
            }

            form.setFieldsValue(values);
        } else {
            form.setFieldsValue({
                enabled: "Active"
            });
        }
    }, [data]);

    const handleSave = async (values) => {
        try {
            const payload = { ...values };

            payload.enabled = payload.enabled === "Active" ? 1 : 0;

            if (payload.custom_select_temple) {
                payload.custom_select_temple =
                    payload.custom_select_temple.map(t => ({ temple: t }));
            }

            delete payload.confirm_password;

            if (!payload.new_password) delete payload.new_password;

            if (isEdit) {
                await updateDoc(DOCTYPE_USER, id, payload);
            } else {
                await createDoc(DOCTYPE_USER, payload);
            }

            onBack && onBack();

        } catch (err) {
            console.error("Save Error:", err);
        }
    };

    if (isEdit && loading) return <PageLoader />;

    if (isEdit && error) return <Alert message="Error loading" type="error" />;

    return (
        <div className="max-w-6xl mx-auto p-4 pb-24">

            {/* HEADER */}
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Edit User" : "Add User"}
                subtitle="User Management"
            />

            <Card className="border border-zinc-200 rounded-xl">

                <Form layout="vertical" form={form} onFinish={handleSave}>

                    <Row gutter={[16, 16]}>

                        <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="email" label="Email" rules={[{ required: true }]}>
                                <Input disabled={isEdit} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="last_name" label="Last Name">
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="custom_test" label="Contact Number" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="custom_user_role" label="User Role" rules={[{ required: true }]}>
                                <Select disabled={disableAdminFields}>
                                    <Select.Option value="Super Admin">Super Admin</Select.Option>
                                    <Select.Option value="Temple Admin">Temple Admin</Select.Option>
                                    <Select.Option value="Cashier">Cashier</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="custom_select_temple" label="Temples" rules={[{ required: true }]}>
                                <Select mode="multiple" disabled={disableAdminFields}>
                                    {temples?.map(t => (
                                        <Select.Option key={t.name} value={t.name}>
                                            {t.temple_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="new_password" label="Password" rules={[{ required: !isEdit }]}>
                                <Input.Password />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="enabled" label="Account Status" rules={[{ required: true }]}>
                                <Select disabled={disableAdminFields}>
                                    <Select.Option value="Active">Active</Select.Option>
                                    <Select.Option value="Inactive">Inactive</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="custom_status" label="Status" rules={[{ required: true }]}>
                                <Select disabled={disableAdminFields}>
                                    <Select.Option value="Active">Active</Select.Option>
                                    <Select.Option value="Inactive">Inactive</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12} lg={8}>
                            <Form.Item name="custom_opening_balance" label="Opening Balance">
                                <Input disabled={disableAdminFields} />
                            </Form.Item>
                        </Col>

                        <Col xs={24}>
                            <Form.Item name="custom_internal_notes" label="Notes">
                                <Input.TextArea rows={4} disabled={disableAdminFields} />
                            </Form.Item>
                        </Col>

                    </Row>

                    <FormFooter
                        onCancel={onBack}
                        loading={creating || updating}
                        isEdit={isEdit}
                    />

                </Form>

            </Card>

            {isEdit && <ActivityLog doctype={DOCTYPE_USER} docname={id} />}
        </div>
    );
};

export default UserForm;