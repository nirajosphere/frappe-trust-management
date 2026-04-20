import React, { useEffect } from "react";
import {
    Form, Input, Button, Card, Typography, Row, Col, Spin, Alert, Select, DatePicker
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import {
    useFrappeGetDoc, useFrappeUpdateDoc, useFrappeCreateDoc
} from "../../hooks/useFrappe";
import { DOCTYPE_INVENTORY_ENTRY } from "../../config/constants";
import { inventoryEntryFormFields } from "../../formfield/inventoryEntryFormFields";
import PageHeader from "../../components/common/PageHeader";

const { Text } = Typography;

const InventoryEntryForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(DOCTYPE_INVENTORY_ENTRY, id);

    useEffect(() => {
        if (isEdit && initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [isEdit, initialValues, form]);

    const handleSave = async (values) => {
        try {
            if (isEdit) {
                await updateDoc(DOCTYPE_INVENTORY_ENTRY, id, values);
            } else {
                await createDoc(DOCTYPE_INVENTORY_ENTRY, values);
            }
            if (onBack) onBack();
        } catch (err) {
            console.error(err);
        }
    };

    if (fetching && isEdit) return <div className="p-20 text-center"><Spin /></div>;
    if (fetchError) return <Alert message="Error" description={fetchError.message} type="error" />;

    return (
        <div className="max-w-5xl mx-auto py-6">
            <PageHeader
                onBack={onBack}
                title={isEdit ? "Edit Stock Entry" : "New Stock Entry"}
                subtitle="Manage Inventory Movements"
            />

            <Card size="small" className="aavatto-card">
                <Form form={form} layout="vertical" onFinish={handleSave} className="p-6">
                    <Row gutter={[24, 0]}>
                        {inventoryEntryFormFields.fields.map((field) => (
                            <Col xs={24} md={12} key={field.name}>
                                <Form.Item
                                    name={field.name}
                                    label={<Text strong className="text-zinc-500 uppercase text-[10px] tracking-widest">{field.label}</Text>}
                                    rules={field.required ? [{ required: true, message: field.message || "Required" }] : []}
                                >
                                    {field.type === "select" ? (
                                        <Select placeholder={field.placeholder} options={field.options} className="h-10" />
                                    ) : field.type === "datetime" ? (
                                        <DatePicker showTime className="w-full h-10" />
                                    ) : (
                                        <Input placeholder={field.placeholder} className="h-10" />
                                    )}
                                </Form.Item>
                            </Col>
                        ))}
                    </Row>
                    <div className="flex justify-end gap-3 mt-10 border-t pt-8">
                        <Button onClick={onBack}>Cancel</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={updating || creating}
                            icon={<SaveOutlined />}
                            className="bg-black border-none"
                        >
                            {isEdit ? "Submit Changes" : "Create Entry"}
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default InventoryEntryForm;
