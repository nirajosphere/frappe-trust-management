import React, { useEffect, useState } from "react";
import {
    Form, Input, Button, Card, Typography, Space, Row, Col,
    message, Spin, Alert, Upload, Divider, Switch, List, Avatar
} from "antd";
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined, CheckCircleFilled } from "@ant-design/icons";
import {
    useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDoc,
    useFrappeFileUpload, useFrappeGetDocList
} from "../../hooks/useFrappe";
import { formConfigs } from "../../config/formConfig";
import { DOCTYPE_TEMPLE, DOCTYPE_DONATION_TYPE } from "../../config/constants";

const { Title, Text } = Typography;

/**
 * CommonForm Component
 */
const CommonForm = ({ doctype, id, onBack }) => {
    const isEdit = !!id;
    const config = formConfigs[doctype];
    const [form] = Form.useForm();
    const [selectedDonationTypes, setSelectedDonationTypes] = useState([]);

    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { upload, loading: uploading } = useFrappeFileUpload();
    const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(doctype, id);

    // Fetch all donation types if we are in Temple form
    const { data: allDonationTypes, loading: loadingDTypes } = useFrappeGetDocList(DOCTYPE_DONATION_TYPE, {
        fields: ["name", "donation_type", "donation_image"]
    });

    useEffect(() => {
        if (isEdit && initialValues) {
            form.setFieldsValue(initialValues);

            // Map child table 'donation_types' to selected state if it exists
            if (doctype === DOCTYPE_TEMPLE && initialValues.donation_types) {
                setSelectedDonationTypes(initialValues.donation_types.map(dt => dt.donation_type));
            }
        } else if (!isEdit) {
            // Set default values from config if available
            const defaultValues = {};
            config.fields.forEach(f => {
                if (f.defaultValue) defaultValues[f.name] = f.defaultValue;
            });
            form.setFieldsValue(defaultValues);
            setSelectedDonationTypes([]);
        }
    }, [isEdit, initialValues, form, doctype]);

    const handleSave = async (values) => {
        try {
            let doc;
            const formData = { ...values };

            // For Temple, include the selected donation types as a child table
            if (doctype === DOCTYPE_TEMPLE) {
                formData.donation_types = selectedDonationTypes.map(name => ({
                    donation_type: name
                }));
            }

            const fileFields = config.fields.filter(f => f.type === 'image' || f.type === 'file');
            fileFields.forEach(f => delete formData[f.name]);

            if (isEdit) {
                doc = await updateDoc(doctype, id, formData);
            } else {
                doc = await createDoc(doctype, formData);
            }

            const docName = isEdit ? id : doc.name;

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

    const toggleDonationType = (typeName) => {
        setSelectedDonationTypes(prev =>
            prev.includes(typeName)
                ? prev.filter(t => t !== typeName)
                : [...prev, typeName]
        );
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
                    action={<Button onClick={onBack} icon={<ArrowLeftOutlined />}>Go Back</Button>}
                />
            </div>
        );
    }

    return (
        <div style={{ padding: "24px 0", maxWidth: "1200px", margin: "0 auto" }}>
            <Card bordered={false} className="shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <Row align="middle" justify="space-between" style={{ marginBottom: "32px" }}>
                    <Col>
                        <Space size="middle">
                            <Button
                                type="default"
                                shape="circle"
                                icon={<ArrowLeftOutlined />}
                                onClick={onBack}
                            />
                            <div>
                                <Text type="secondary" style={{ display: 'block', marginBottom: -4 }}>
                                    {config.title} Management
                                </Text>
                                <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
                                    {isEdit ? `Edit ${config.title}` : `Add New ${config.title}`}
                                </Title>
                            </div>
                        </Space>
                    </Col>
                </Row>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    scrollToFirstError
                    requiredMark="optional"
                >
                    <Row gutter={[24, 0]}>
                        {config.fields.map((field) => (
                            <Col xs={24} sm={field.type === 'textarea' ? 24 : 12} lg={field.type === 'textarea' ? 24 : 8} key={field.name}>
                                <Form.Item
                                    name={field.name}
                                    label={<Text strong>{field.label}</Text>}
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
                                            style={{ borderRadius: '8px' }}
                                        />
                                    ) : field.type === 'image' || field.type === 'file' ? (
                                        <Upload
                                            maxCount={1}
                                            beforeUpload={() => false}
                                            listType={field.type === 'image' ? "picture" : "text"}
                                        >
                                            <Button icon={<UploadOutlined />} style={{ borderRadius: '8px', width: '100%', height: '40px' }}>
                                                Choose File
                                            </Button>
                                        </Upload>
                                    ) : (
                                        <Input
                                            placeholder={field.placeholder}
                                            disabled={field.readOnly || field.disabled}
                                            style={{ borderRadius: '8px', height: '40px' }}
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                        ))}
                    </Row>

                    {/* Donation Types Assignment Logic for Temple Doctype */}
                    {doctype === DOCTYPE_TEMPLE && (
                        <div style={{ marginTop: '24px' }}>
                            <Divider orientation="left">
                                <Title level={4} style={{ margin: 0, color: '#4f46e5' }}>Donation Types</Title>
                            </Divider>

                            <Card style={{ background: '#f8fafc', border: '1px dashed #e2e8f0', borderRadius: '12px' }} bodyStyle={{ padding: '16px' }}>
                                <List
                                    loading={loadingDTypes}
                                    grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 3 }}
                                    dataSource={allDonationTypes}
                                    renderItem={item => (
                                        <List.Item>
                                            <Card
                                                size="small"
                                                hoverable
                                                style={{
                                                    borderRadius: '10px',
                                                    border: selectedDonationTypes.includes(item.name) ? '1.5px solid #4f46e5' : '1px solid #e2e8f0'
                                                }}
                                                bodyStyle={{ padding: '12px' }}
                                                onClick={() => toggleDonationType(item.name)}
                                            >
                                                <Row align="middle" justify="space-between" gutter={12}>
                                                    <Col flex="48px">
                                                        <Avatar
                                                            src={item.donation_image}
                                                            shape="square"
                                                            size={40}
                                                            style={{ border: '1px solid #f1f5f9' }}
                                                        />
                                                    </Col>
                                                    <Col flex="auto">
                                                        <Text strong>{item.donation_type}</Text>
                                                    </Col>
                                                    <Col>
                                                        <Switch
                                                            checked={selectedDonationTypes.includes(item.name)}
                                                            onChange={() => toggleDonationType(item.name)}
                                                            size="small"
                                                        />
                                                    </Col>
                                                </Row>
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </div>
                    )}

                    <Divider />

                    <div style={{ textAlign: 'right' }}>
                        <Space size="middle">
                            <Button onClick={onBack} size="large" style={{ borderRadius: '8px', minWidth: '100px' }}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                loading={creating || updating || uploading}
                                icon={<SaveOutlined />}
                                style={{ borderRadius: '8px', minWidth: '160px', height: '45px', fontWeight: 600 }}
                            >
                                {isEdit ? "Save Changes" : `Create ${config.title}`}
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default CommonForm;
