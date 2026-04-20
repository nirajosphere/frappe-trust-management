import React, { useEffect } from "react";
import {
    Form, Input, Button, Card, Typography, Row, Col, Spin, Alert, Select
} from "antd";
import { SaveOutlined } from "@ant-design/icons";
import {
    useFrappeGetDoc, useFrappeUpdateDoc, useFrappeCreateDoc
} from "../../hooks/useFrappe";
import { DOCTYPE_ITEM } from "../../config/constants";
import { itemFormFields } from "../../formfield/itemFormFields";
import PageHeader from "../../components/common/PageHeader";

const { Text } = Typography;

const ItemForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(DOCTYPE_ITEM, id);

    useEffect(() => {
        if (isEdit && initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [isEdit, initialValues, form]);

    const handleSave = async (values) => {
        try {
            if (isEdit) {
                await updateDoc(DOCTYPE_ITEM, id, values);
            } else {
                await createDoc(DOCTYPE_ITEM, values);
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
                title={isEdit ? "Edit Item" : "Create New Item"}
                subtitle="Inventory Item Details"
            />

            <Card size="small" className="aavatto-card">
                <Form form={form} layout="vertical" onFinish={handleSave} className="p-6">
                    <Row gutter={[24, 0]}>
                        {itemFormFields.fields.map((field) => (
                            <Col xs={24} md={12} key={field.name}>
                                <Form.Item
                                    name={field.name}
                                    label={<Text strong className="text-zinc-500 uppercase text-[10px] tracking-widest">{field.label}</Text>}
                                    rules={field.required ? [{ required: true, message: field.message }] : []}
                                >
                                    {field.type === "select" ? (
                                        <Select placeholder={field.placeholder} options={field.options} className="h-10" />
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
                            {isEdit ? "Save Changes" : "Create Item"}
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default ItemForm;
