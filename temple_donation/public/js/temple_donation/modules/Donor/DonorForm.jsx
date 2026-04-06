import React, { useEffect } from "react";
import {
    Form, Input, Button, Card, Typography, Space, Row, Col,
    message, Spin, Alert, Select
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import {
    useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDoc
} from "../../hooks/useFrappe";
import { DOCTYPE_DONOR } from "../../config/constants";
import { donorFormFields } from "../../formfield/donorFormFields";
import PageHeader from "../../components/common/PageHeader";

const { Title, Text } = Typography;

const DonorForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(DOCTYPE_DONOR, id);

    useEffect(() => {
        if (isEdit && initialValues) {
            form.setFieldsValue(initialValues);
        } else if (!isEdit) {
            const defaultValues = {};
            donorFormFields.fields.forEach(f => {
                if (f.defaultValue) defaultValues[f.name] = f.defaultValue;
            });
            form.setFieldsValue(defaultValues);
        }
    }, [isEdit, initialValues, form]);

    const handleSave = async (values) => {
        try {
            if (isEdit) {
                await updateDoc(DOCTYPE_DONOR, id, values);
                message.success("Donor updated successfully!");
            } else {
                await createDoc(DOCTYPE_DONOR, values);
                message.success("Donor created successfully!");
            }
            if (onBack) onBack();
        } catch (err) {
            message.error(err.message || "Something went wrong.");
        }
    };

    if (isEdit && fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Spin size="large" />
                <Text className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Identitiying donor record...</Text>
            </div>
        );
    }

    if (isEdit && fetchError) {
        return (
            <div className="p-8">
                <Alert
                    message="Identification Error"
                    description={fetchError.message || "Failed to fetch donor details."}
                    type="error"
                    showIcon
                    action={<Button onClick={onBack} icon={<ArrowLeftOutlined />}>Return</Button>}
                />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-6">
            <PageHeader
                onBack={onBack}
                subtitle="Donor Relationship Management"
                title={isEdit ? "Edit Profile" : "Register Donor"}
            />

            <Card size="small" className="aavatto-card">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    scrollToFirstError
                    requiredMark={false}
                    className="p-6"
                >
                    <Row gutter={[24, 0]}>
                        {donorFormFields.fields.map((field) => (
                            <Col xs={24} md={field.type === 'textarea' ? 24 : 12} key={field.name}>
                                <Form.Item
                                    name={field.name}
                                    label={<Text strong className="text-zinc-500">{field.label}</Text>}
                                    rules={[
                                        { required: field.required, message: field.message },
                                        field.pattern ? { pattern: field.pattern, message: field.patternMessage } : null
                                    ].filter(Boolean)}
                                >
                                    {field.type === 'textarea' ? (
                                        <Input.TextArea
                                            placeholder={field.placeholder}
                                            rows={field.rows || 3}
                                            className="border-zinc-200 bg-zinc-50/30 focus:bg-white transition-all rounded-lg p-3"
                                        />
                                    ) : field.type === 'select' ? (
                                        <Select placeholder={field.placeholder} className="h-10 w-full">
                                            {field.options?.map(opt => (
                                                <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                                            ))}
                                        </Select>
                                    ) : (
                                        <Input
                                            placeholder={field.placeholder}
                                            className="h-10 border-zinc-200 bg-zinc-50/30 focus:bg-white transition-all rounded-lg px-4 font-medium"
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                        ))}
                    </Row>

                    <div className="flex items-center justify-end gap-3 mt-10 border-t border-zinc-100 pt-8">
                        <Button
                            onClick={onBack}
                            className="h-10 px-8 font-bold border-zinc-200 text-zinc-400 hover:text-zinc-900 transition-all text-xs uppercase tracking-widest"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={creating || updating}
                            icon={<SaveOutlined />}
                            className="h-10 px-10 font-bold bg-black hover:bg-zinc-800 border-none shadow-md flex items-center gap-2 text-xs uppercase tracking-widest"
                        >
                            {isEdit ? "Update Profile" : "Identify & Register"}
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default DonorForm;
