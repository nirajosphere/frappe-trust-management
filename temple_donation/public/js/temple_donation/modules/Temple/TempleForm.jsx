import React, { useEffect, useState } from "react";
import {
    Form, Input, Button, Card, Typography, Space, Row, Col,
    message, Spin, Alert, List, Avatar
} from "antd";
import { ArrowLeftOutlined, SaveOutlined, CheckCircleFilled } from "@ant-design/icons";
import {
    useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDoc, useFrappeGetDocList
} from "../../hooks/useFrappe";
import { DOCTYPE_TEMPLE, DOCTYPE_DONATION_TYPE } from "../../config/constants";
import { templeFormFields } from "../../formfield/templeFormFields";
import PageHeader from "../../components/common/PageHeader";

const { Title, Text } = Typography;

const TempleForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();
    const [selectedDonationTypes, setSelectedDonationTypes] = useState([]);

    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(DOCTYPE_TEMPLE, id);
    const { data: allDonationTypes, loading: loadingDTypes } = useFrappeGetDocList(DOCTYPE_DONATION_TYPE, {
        fields: ["name", "donation_type", "donation_image"]
    });

    useEffect(() => {
        if (isEdit && initialValues) {
            form.setFieldsValue(initialValues);
            if (initialValues.donation_types) {
                setSelectedDonationTypes(initialValues.donation_types.map(dt => dt.donation_type));
            }
        } else if (!isEdit) {
            const defaultValues = {};
            templeFormFields.fields.forEach(f => {
                if (f.defaultValue) defaultValues[f.name] = f.defaultValue;
            });
            form.setFieldsValue(defaultValues);
            setSelectedDonationTypes([]);
        }
    }, [isEdit, initialValues, form]);

    const handleSave = async (values) => {
        try {
            const formData = {
                ...values,
                donation_types: selectedDonationTypes.map(name => ({ donation_type: name }))
            };

            if (isEdit) {
                await updateDoc(DOCTYPE_TEMPLE, id, formData);
                message.success("Temple updated successfully!");
            } else {
                await createDoc(DOCTYPE_TEMPLE, formData);
                message.success("Temple created successfully!");
            }
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
                <Spin size="large" />
                <Text className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Loading temple data...</Text>
            </div>
        );
    }

    if (isEdit && fetchError) {
        return (
            <div className="p-8">
                <Alert
                    message="Identification Error"
                    description={fetchError.message || "Failed to fetch temple details."}
                    type="error"
                    showIcon
                    action={<Button onClick={onBack} icon={<ArrowLeftOutlined />}>Return</Button>}
                />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-6 pb-20">
            <PageHeader
                onBack={onBack}
                subtitle="Operational Infrastructure"
                title={isEdit ? `Configure ${initialValues?.temple_name || 'Temple'}` : "Register New Temple"}
            />

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                scrollToFirstError
                requiredMark={false}
            >
                <Card size="small" className="aavatto-card mb-8">
                    <Text className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-900 block mb-6 px-4">Entity Details</Text>
                    <Row gutter={[24, 0]} className="px-4">
                        {templeFormFields.fields.map((field) => (
                            <Col xs={24} md={field.type === 'textarea' ? 24 : 12} key={field.name}>
                                <Form.Item
                                    name={field.name}
                                    label={<Text strong className="text-zinc-500 uppercase text-[10px] tracking-widest">{field.label}</Text>}
                                    rules={[
                                        { required: field.required, message: field.message }
                                    ].filter(Boolean)}
                                >
                                    {field.type === 'textarea' ? (
                                        <Input.TextArea
                                            placeholder={field.placeholder}
                                            rows={field.rows || 3}
                                            className="border-zinc-200 bg-zinc-50/30 focus:bg-white transition-all rounded-lg p-3"
                                        />
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
                </Card>

                <Card size="small" className="aavatto-card mb-10">
                    <Text className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-900 block mb-6 px-4">Enabled Donation Categories</Text>
                    <div className="px-4 pb-4">
                        <List
                            loading={loadingDTypes}
                            grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
                            dataSource={allDonationTypes}
                            renderItem={item => {
                                const isSelected = selectedDonationTypes.includes(item.name);
                                return (
                                    <List.Item>
                                        <div
                                            onClick={() => toggleDonationType(item.name)}
                                            className={`
                                                p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3
                                                ${isSelected
                                                    ? 'border-zinc-900 bg-black text-white'
                                                    : 'border-zinc-100 bg-zinc-50/50 text-zinc-400 hover:border-zinc-300'}
                                            `}
                                        >
                                            <Avatar
                                                src={item.donation_image}
                                                shape="circle"
                                                size="small"
                                                className={isSelected ? 'border-zinc-700' : 'border-white'}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <Text className={`block text-xs font-bold truncate tracking-tight ${isSelected ? 'text-white' : 'text-zinc-800'}`}>
                                                    {item.donation_type}
                                                </Text>
                                            </div>
                                            {isSelected && <CheckCircleFilled className="text-white text-xs" />}
                                        </div>
                                    </List.Item>
                                );
                            }}
                        />
                    </div>
                </Card>

                <div className="flex items-center justify-end gap-3 rounded-2xl bg-white p-6 border-2 border-zinc-100 shadow-xl shadow-zinc-100/20">
                    <Button
                        onClick={onBack}
                        className="h-10 px-8 font-bold border-zinc-200 text-zinc-400 hover:text-zinc-900 transition-all text-[10px] uppercase tracking-widest bg-transparent"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={creating || updating}
                        icon={<SaveOutlined />}
                        className="h-10 px-10 font-bold bg-black hover:bg-zinc-800 border-none shadow-md flex items-center gap-2 text-[10px] uppercase tracking-widest"
                    >
                        {isEdit ? "Synchronize Configuration" : "Initialize Entity"}
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default TempleForm;
