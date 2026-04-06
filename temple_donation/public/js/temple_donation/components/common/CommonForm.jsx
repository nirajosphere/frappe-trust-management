import React, { useEffect, useState } from "react";
import {
    Form, Input, Button, Card, Typography, Space, Row, Col,
    message, Spin, Alert, Upload, Divider, Switch, List, Avatar, Select
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
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Spin size="large" tip={`Loading ${config.title} data...`} />
            </div>
        );
    }

    if (isEdit && fetchError) {
        return (
            <div className="p-8">
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
        <div className="max-w-6xl mx-auto space-y-8 py-6 mb-12">
             <div className="flex items-center justify-between mb-8 animate-fadeIn">
                <Space size="large">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={onBack}
                        shape="circle"
                        className="h-10 w-10 flex items-center justify-center shadow-md border-none bg-white dark:bg-slate-800 text-indigo-500 hover:scale-110 transition-transform"
                    />
                    <div>
                        <Text className="text-[11px] font-bold uppercase tracking-widest text-stone-400 block mb-1">
                            {config.title} Management
                        </Text>
                        <Title level={2} className="!m-0 font-black tracking-tight text-stone-800">
                            {isEdit ? `Edit ${config.title}` : `Add New ${config.title}`}
                        </Title>
                    </div>
                </Space>
            </div>

            <Card bordered={false} className="aavatto-card !p-0 overflow-hidden shadow-2xl shadow-amber-900/5">
                <div className="p-10">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSave}
                        scrollToFirstError
                        requiredMark="optional"
                        className="premium-form"
                    >
                        <Row gutter={[32, 0]}>
                            {config.fields.map((field) => (
                                <Col xs={24} sm={field.type === 'textarea' ? 24 : 12} lg={field.type === 'textarea' ? 24 : 8} key={field.name}>
                                    <Form.Item
                                        name={field.name}
                                        label={<Text className="font-bold text-stone-700 ml-1">{field.label}</Text>}
                                        rules={[
                                            { required: field.required, message: field.message },
                                            field.pattern ? { pattern: field.pattern, message: field.patternMessage } : null
                                        ].filter(Boolean)}
                                    >
                                        {field.type === 'textarea' ? (
                                            <Input.TextArea
                                                placeholder={field.placeholder}
                                                rows={field.rows || 4}
                                                disabled={field.readOnly || field.disabled}
                                                className="rounded-xl border-stone-200 bg-stone-50/50 focus:bg-white transition-all p-4"
                                            />
                                        ) : field.type === 'select' ? (
                                            <Select 
                                                placeholder={field.placeholder}
                                                disabled={field.readOnly || field.disabled}
                                                className="h-12 w-full premium-select"
                                            >
                                                {field.options?.map(opt => (
                                                    <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                                                ))}
                                            </Select>
                                        ) : field.type === 'image' || field.type === 'file' ? (
                                            <Upload
                                                maxCount={1}
                                                beforeUpload={() => false}
                                                listType={field.type === 'image' ? "picture" : "text"}
                                                className="w-full"
                                            >
                                                <Button icon={<UploadOutlined />} className="h-12 w-full rounded-xl border-dashed border-stone-300 bg-stone-50/50 text-stone-500 hover:border-amber-500 hover:text-amber-500 font-medium">
                                                    Click to {field.type === 'image' ? 'upload image' : 'attach file'}
                                                </Button>
                                            </Upload>
                                        ) : (
                                            <Input
                                                placeholder={field.placeholder}
                                                disabled={field.readOnly || field.disabled}
                                                className="h-12 rounded-xl border-stone-200 bg-stone-50/50 focus:bg-white transition-all px-4"
                                            />
                                        )}
                                    </Form.Item>
                                </Col>
                            ))}
                        </Row>

                        {/* Donation Types Assignment Logic for Temple Doctype */}
                        {doctype === DOCTYPE_TEMPLE && (
                            <div className="mt-10">
                                <Divider orientation="left" className="!mb-8">
                                    <Title level={4} className="!m-0 text-amber-700 font-bold tracking-tight">Donation Types Assignment</Title>
                                </Divider>

                                <div className="p-8 rounded-3xl bg-stone-50/80 border border-stone-100">
                                    <List
                                        loading={loadingDTypes}
                                        grid={{ gutter: 24, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
                                        dataSource={allDonationTypes}
                                        renderItem={item => {
                                            const isSelected = selectedDonationTypes.includes(item.name);
                                            return (
                                                <List.Item className="!mb-6">
                                                    <div
                                                        onClick={() => toggleDonationType(item.name)}
                                                        className={`
                                                            group relative overflow-hidden p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 bg-white
                                                            ${isSelected 
                                                                ? 'border-amber-500 shadow-lg shadow-amber-500/10' 
                                                                : 'border-transparent hover:border-stone-300 shadow-sm'}
                                                        `}
                                                    >
                                                        {isSelected && (
                                                            <div className="absolute top-2 right-2 z-10">
                                                                <CheckCircleFilled className="text-amber-500 text-lg bg-white rounded-full" />
                                                            </div>
                                                        )}
                                                        <Row align="middle" gutter={16}>
                                                            <Col>
                                                                <Avatar
                                                                    src={item.donation_image}
                                                                    shape="square"
                                                                    size={52}
                                                                    className="rounded-xl border border-stone-100"
                                                                />
                                                            </Col>
                                                            <Col flex="auto">
                                                                <Text className={`font-bold text-sm block transition-colors ${isSelected ? 'text-amber-700' : 'text-stone-700'}`}>
                                                                    {item.donation_type}
                                                                </Text>
                                                                <Text className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                                                                    {isSelected ? 'Enabled' : 'Disabled'}
                                                                </Text>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                </List.Item>
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        <Divider className="!my-10" />

                        <div className="flex items-center justify-end gap-6">
                            <Button 
                                onClick={onBack} 
                                className="h-12 px-10 rounded-xl font-bold border-stone-200 text-stone-500 hover:text-stone-700 hover:border-stone-400 transition-all"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={creating || updating || uploading}
                                icon={<SaveOutlined className="mr-1" />}
                                className="h-12 px-12 rounded-xl font-black bg-amber-600 hover:bg-amber-500 border-none shadow-xl shadow-amber-500/30 flex items-center justify-center min-w-[200px]"
                            >
                                {isEdit ? "Update Information" : "Create Record"}
                            </Button>
                        </div>

                    </Form>
                </div>
            </Card>
        </div>
    );
};


export default CommonForm;
