import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, Typography, Space, Row, Col, message, Spin, Alert, Upload } from "antd";
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined } from "@ant-design/icons";
import { useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDoc, useFrappeFileUpload } from "../../hooks/useFrappe";
import { formConfigs } from "../../config/formConfig";

const { Title, Text } = Typography;

/**
 * CommonForm Component
 *
 * Props:
 * @param {string} doctype - Doctype name
 * @param {string} id - Document name/ID (for edit mode)
 * @param {string} onBack - Navigation callback to go back
 */
const CommonForm = ({ doctype, id, onBack }) => {
    const isEdit = !!id;
    const config = formConfigs[doctype];
    const [form] = Form.useForm();

    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { upload, loading: uploading } = useFrappeFileUpload();
    const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(doctype, id);

    useEffect(() => {
        if (isEdit && initialValues) {
            form.setFieldsValue(initialValues);
        } else if (!isEdit) {
            form.resetFields();
        }
    }, [isEdit, initialValues, form]);

    const handleSave = async (values) => {
        try {
            let doc;
            
            // Extract file data before saving doc as a raw object
            const formData = { ...values };
            const fileFields = config.fields.filter(f => f.type === 'image' || f.type === 'file');
            
            // Remove file field data from initial doc creation to avoid circular/invalid data
            fileFields.forEach(f => delete formData[f.name]);

            if (isEdit) {
                doc = await updateDoc(doctype, id, formData);
            } else {
                doc = await createDoc(doctype, formData);
            }

            const docName = isEdit ? id : doc.name;

            // Handle file uploads sequentially
            for (const field of fileFields) {
                const fileValue = values[field.name];
                if (fileValue && fileValue.fileList && fileValue.fileList.length > 0) {
                    const file = fileValue.fileList[0].originFileObj;
                    if (file) {
                        try {
                            await upload(file, {
                                doctype: doctype,
                                docname: docName,
                                fieldname: field.name
                            });
                        } catch (uploadErr) {
                            console.error(`Failed to upload ${field.label}:`, uploadErr);
                            message.warning(`${field.label} upload failed, but record was saved.`);
                        }
                    }
                }
            }

            message.success(`${config.title} ${isEdit ? 'updated' : 'created'} successfully!`);
            if (onBack) onBack();
        } catch (err) {
            message.error(err.message || "Something went wrong.");
        }
    };

    if (isEdit && fetching) {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <Spin size="large" tip={`Loading ${config.title} data...`} />
            </div>
        );
    }

    if (isEdit && fetchError) {
        return (
            <div style={{ padding: "24px" }}>
                <Alert
                    message="Error Loading Data"
                    description={fetchError.message || `Failed to fetch ${config.title} details.`}
                    type="error"
                    showIcon
                    action={
                        <Button onClick={onBack} icon={<ArrowLeftOutlined />}>Go Back</Button>
                    }
                />
            </div>
        );
    }

    return (
        <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
            <Card bordered={false} className="shadow-sm" style={{ borderRadius: '12px' }}>
                <Row align="middle" style={{ marginBottom: "24px" }} gutter={16}>
                    <Col>
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={onBack}
                            style={{ fontSize: '18px' }}
                        />
                    </Col>
                    <Col>
                        <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
                            {isEdit ? `Edit ${config.title}` : `Add New ${config.title}`}
                        </Title>
                    </Col>
                </Row>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    scrollToFirstError
                >
                    <Row gutter={16}>
                        {config.fields.map((field) => (
                            <Col span={field.type === 'textarea' ? 24 : 12} key={field.name}>
                                <Form.Item
                                    name={field.name}
                                    label={field.label}
                                    rules={[
                                        { required: field.required, message: field.message },
                                        field.pattern ? { pattern: field.pattern, message: field.patternMessage } : null
                                    ].filter(Boolean)}
                                >
                                    {field.type === 'textarea' ? (
                                        <Input.TextArea 
                                            placeholder={field.placeholder} 
                                            rows={field.rows || 3} 
                                            disabled={field.readOnly || field.disabled}
                                        />
                                    ) : field.type === 'image' || field.type === 'file' ? (
                                        <Upload 
                                            maxCount={1}
                                            beforeUpload={() => false}
                                            listType={field.type === 'image' ? "picture" : "text"}
                                            defaultFileList={isEdit && initialValues?.[field.name] ? [
                                                {
                                                    uid: '-1',
                                                    name: 'Current File',
                                                    status: 'done',
                                                    url: initialValues[field.name],
                                                }
                                            ] : []}
                                        >
                                            <Button icon={<UploadOutlined />}>Choose File</Button>
                                        </Upload>
                                    ) : (
                                        <Input 
                                            placeholder={field.placeholder} 
                                            disabled={field.readOnly || field.disabled}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                        ))}
                    </Row>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: '24px' }}>
                        <Space>
                            <Button onClick={onBack} style={{ borderRadius: '6px' }}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={creating || updating || uploading}
                                icon={<SaveOutlined />}
                                style={{ borderRadius: '6px', minWidth: '120px', height: '40px' }}
                            >
                                {isEdit ? "Update Details" : `Create ${config.title}`}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default CommonForm;
