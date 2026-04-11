// import React, { useEffect } from "react";
// import {
//     Form, Input, Button, Card, Typography, Space, Row, Col,
//     message, Spin, Alert, Select
// } from "antd";
// import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
// import {
//     useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDoc
// } from "../../hooks/useFrappe";
// import { DOCTYPE_DONOR } from "../../config/constants";
// import { donorFormFields } from "../../formfield/donorFormFields";
// import PageHeader from "../../components/common/PageHeader";

// const { Title, Text } = Typography;

// const DonorForm = ({ id, onBack }) => {
//     const isEdit = !!id;
//     const [form] = Form.useForm();

//     const { createDoc, loading: creating } = useFrappeCreateDoc();
//     const { updateDoc, loading: updating } = useFrappeUpdateDoc();
//     const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(DOCTYPE_DONOR, id);

//     useEffect(() => {
//         if (isEdit && initialValues) {
//             form.setFieldsValue(initialValues);
//         } else if (!isEdit) {
//             const defaultValues = {};
//             donorFormFields.fields.forEach(f => {
//                 if (f.defaultValue) defaultValues[f.name] = f.defaultValue;
//             });
//             form.setFieldsValue(defaultValues);
//         }
//     }, [isEdit, initialValues, form]);

//     const handleSave = async (values) => {
//         try {
//             if (isEdit) {
//                 await updateDoc(DOCTYPE_DONOR, id, values);
//                 message.success("Donor updated successfully!");
//             } else {
//                 await createDoc(DOCTYPE_DONOR, values);
//                 message.success("Donor created successfully!");
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
//                 <Text className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Identitiying donor record...</Text>
//             </div>
//         );
//     }

//     if (isEdit && fetchError) {
//         return (
//             <div className="p-8">
//                 <Alert
//                     message="Identification Error"
//                     description={fetchError.message || "Failed to fetch donor details."}
//                     type="error"
//                     showIcon
//                     action={<Button onClick={onBack} icon={<ArrowLeftOutlined />}>Return</Button>}
//                 />
//             </div>
//         );
//     }

//     return (
//         <div className="max-w-4xl mx-auto py-6">
//             <PageHeader
//                 onBack={onBack}
//                 subtitle="Donor Relationship Management"
//                 title={isEdit ? "Edit Profile" : "Register Donor"}
//             />

//             <Card size="small" className="aavatto-card">
//                 <Form
//                     form={form}
//                     layout="vertical"
//                     onFinish={handleSave}
//                     scrollToFirstError
//                     requiredMark={false}
//                     className="p-6"
//                 >
//                     <Row gutter={[24, 0]}>
//                         {donorFormFields.fields.map((field) => (
//                             <Col xs={24} md={field.type === 'textarea' ? 24 : 12} key={field.name}>
//                                 <Form.Item
//                                     name={field.name}
//                                     label={<Text strong className="text-zinc-500">{field.label}</Text>}
//                                     rules={[
//                                         { required: field.required, message: field.message },
//                                         field.pattern ? { pattern: field.pattern, message: field.patternMessage } : null
//                                     ].filter(Boolean)}
//                                 >
//                                     {field.type === 'textarea' ? (
//                                         <Input.TextArea
//                                             placeholder={field.placeholder}
//                                             rows={field.rows || 3}
//                                             className="border-zinc-200 bg-zinc-50/30 focus:bg-white transition-all rounded-lg p-3"
//                                         />
//                                     ) : field.type === 'select' ? (
//                                         <Select placeholder={field.placeholder} className="h-10 w-full">
//                                             {field.options?.map(opt => (
//                                                 <Select.Option key={opt} value={opt}>{opt}</Select.Option>
//                                             ))}
//                                         </Select>
//                                     ) : (
//                                         <Input
//                                             placeholder={field.placeholder}
//                                             className="h-10 border-zinc-200 bg-zinc-50/30 focus:bg-white transition-all rounded-lg px-4 font-medium"
//                                         />
//                                     )}
//                                 </Form.Item>
//                             </Col>
//                         ))}
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
//                             className="h-10 px-10 font-bold bg-black hover:bg-zinc-800 border-none shadow-md flex items-center gap-2 text-xs uppercase tracking-widest"
//                         >
//                             {isEdit ? "Update Profile" : "Identify & Register"}
//                         </Button>
//                     </div>
//                 </Form>
//             </Card>
//         </div>
//     );
// };

// export default DonorForm;

import React, { useEffect } from "react";
import {
    Form, Input, Button, Card, Typography, Row, Col,
    message, Spin, Alert, Select, DatePicker
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
    useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDoc
} from "../../hooks/useFrappe";
import { DOCTYPE_DONOR } from "../../config/constants";
import PageHeader from "../../components/common/PageHeader";
import AddPageHeader from "../../components/common/AddPageHeader";

const { Text } = Typography;

const DonorForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data, loading, error } = useFrappeGetDoc(DOCTYPE_DONOR, id);

    useEffect(() => {
        if (isEdit && data) {
            form.setFieldsValue({
                ...data,
                date_of_birth: data.date_of_birth ? dayjs(data.date_of_birth) : null,
                anniversary_date: data.anniversary_date ? dayjs(data.anniversary_date) : null
            });
        } else {
            form.setFieldsValue({
                country: "India",
                state: "Gujarat",
                marital_status: "Unmarried"
            });
        }
    }, [isEdit, data]);

    const handleSave = async (values) => {
        try {
            const payload = {
                ...values,
                date_of_birth: values.date_of_birth?.format("YYYY-MM-DD"),
                anniversary_date: values.anniversary_date?.format("YYYY-MM-DD")
            };

            if (isEdit) {
                await updateDoc(DOCTYPE_DONOR, id, payload);
                message.success("Updated successfully");
            } else {
                await createDoc(DOCTYPE_DONOR, payload);
                message.success("Created successfully");
            }

            onBack && onBack();
        } catch (err) {
            message.error("Error saving data");
        }
    };

    if (loading) return <Spin />;

    if (error) {
        return (
            <Alert
                message="Error loading donor"
                type="error"
                action={<Button onClick={onBack}>Back</Button>}
            />
        );
    }

    return (
        <div className="px-3 sm:px-4 py-4">

            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Edit Donor" : "Add Donor"}
                subtitle="Donor Management"
            />

            <Card className="border border-zinc-200">
                <Form form={form} layout="vertical" onFinish={handleSave}>

                    <Row gutter={[16, 0]}>

                        {/* CONTACT */}
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="mobile_number"
                                label={<Text>Contact No</Text>}
                                rules={[
                                    { required: true, message: "Enter mobile" },
                                    { pattern: /^\d{10}$/, message: "Invalid number" }
                                ]}
                            >
                                <Input maxLength={10} className="h-10" />
                            </Form.Item>
                        </Col>

                        {/* NAME */}
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="donor_name"
                                label={<Text>Full Name</Text>}
                                rules={[{ required: true, message: "Enter name" }]}
                            >
                                <Input className="h-10" />
                            </Form.Item>
                        </Col>

                        {/* EMAIL */}
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="email" label={<Text>Email</Text>}>
                                <Input className="h-10" />
                            </Form.Item>
                        </Col>

                        {/* ADDRESS 1 */}
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="address" label={<Text>Address Line 1</Text>}>
                                <Input className="h-10" />
                            </Form.Item>
                        </Col>

                        {/* ADDRESS 2 */}
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="address_line_2" label={<Text>Address Line 2</Text>}>
                                <Input className="h-10" />
                            </Form.Item>
                        </Col>

                        {/* PAN */}
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="pan_card"
                                label={<Text>PAN</Text>}
                                rules={[
                                    { pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: "Invalid PAN" }
                                ]}
                            >
                                <Input className="h-10" />
                            </Form.Item>
                        </Col>

                        {/* COUNTRY */}
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="country" label={<Text>Country</Text>}>
                                <Input className="h-10" />
                            </Form.Item>
                        </Col>

                        {/* STATE */}
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="state" label={<Text>State</Text>} rules={[{ required: true }]}>
                                <Input className="h-10" />
                            </Form.Item>
                        </Col>

                        {/* CITY */}
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="city" label={<Text>City</Text>} rules={[{ required: true }]}>
                                <Input className="h-10" />
                            </Form.Item>
                        </Col>

                        {/* PINCODE */}
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="pincode" label={<Text>Pincode</Text>}>
                                <Input className="h-10" />
                            </Form.Item>
                        </Col>

                        {/* NATIVE */}
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="native_place" label={<Text>Native Place</Text>}>
                                <Input className="h-10" />
                            </Form.Item>
                        </Col>

                        {/* DOB */}
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="date_of_birth" label={<Text>Date of Birth</Text>}>
                                <DatePicker className="w-full h-10" format="DD-MM-YYYY" />
                            </Form.Item>
                        </Col>

                        {/* MARITAL */}
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="marital_status" label={<Text>Marital Status</Text>}>
                                <Select
                                    options={[
                                        { label: "Unmarried", value: "Unmarried" },
                                        { label: "Married", value: "Married" }
                                    ]}
                                />
                            </Form.Item>
                        </Col>

                        {/* ANNIVERSARY */}
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="anniversary_date" label={<Text>Anniversary</Text>}>
                                <DatePicker className="w-full h-10" format="DD-MM-YYYY" />
                            </Form.Item>
                        </Col>

                    </Row>

                    {/* ACTIONS */}
                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 border-t pt-4">

                        <Button onClick={onBack} className="h-10 px-6">
                            Cancel
                        </Button>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={creating || updating}
                            icon={<SaveOutlined />}
                            className="h-10 px-6 bg-black border-black"
                        >
                            {isEdit ? "Update" : "Save"}
                        </Button>

                    </div>

                </Form>
            </Card>
        </div>
    );
};

export default DonorForm;