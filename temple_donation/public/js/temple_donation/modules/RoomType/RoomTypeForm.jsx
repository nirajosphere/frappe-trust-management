import React, { useEffect } from "react";
import { Form, Input, Button, Alert, Select, Row, Col, InputNumber } from "antd";
import { useFrappeGetDoc, useFrappeUpdateDoc, useFrappeCreateDoc } from "../../hooks/useFrappe";
import { DOCTYPE_ROOM_TYPE } from "../../config/constants";
import { roomTypeFormFields } from "../../formfield/roomTypeFormFields";
import AddPageHeader from "../../components/common/AddPageHeader";
import PageLoader from "../../components/common/PageLoader";
import FormFooter from "../../components/common/FormFooter";
import ViewContainer from "../../components/common/ViewContainer";
import SectionCard from "../../components/common/SectionCard";

const RoomTypeForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(DOCTYPE_ROOM_TYPE, id);

    useEffect(() => {
        if (isEdit && initialValues) {
            form.setFieldsValue(initialValues);
        } else {
            form.setFieldsValue({
                active: 1,
                default_capacity: 2,
                default_price_per_day: 0.0
            });
        }
    }, [isEdit, initialValues, form]);

    const handleSave = async (values) => {
        try {
            if (isEdit) {
                await updateDoc(DOCTYPE_ROOM_TYPE, id, values);
            } else {
                await createDoc(DOCTYPE_ROOM_TYPE, values);
            }
            if (onBack) onBack();
        } catch (err) {
            console.error(err);
        }
    };

    if (fetching && isEdit) return <PageLoader />;
    if (fetchError) return <Alert message="Error loading room category details" type="error" action={<Button onClick={onBack}>Back</Button>} />;

    const formItemStyle = { marginBottom: '14px' };

    return (
        <ViewContainer className="donation-page">
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Edit Room Category Details" : "Register New Room Category"}
                subtitle="Room Category Setup"
                showBack={true}
            />

            <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false} size="middle">
                <SectionCard title="Category Details">
                    <Row gutter={[24, 0]}>
                        {roomTypeFormFields.fields.map((field) => (
                            <Col xs={24} md={12} key={field.name}>
                                <Form.Item
                                    name={field.name}
                                    label={field.label}
                                    style={formItemStyle}
                                    rules={field.required ? [{ required: true, message: field.message || "Required" }] : []}
                                >
                                    {field.type === "select" ? (
                                        <Select placeholder={field.placeholder} options={field.options} />
                                    ) : field.type === "number" ? (
                                        <InputNumber placeholder={field.placeholder} className="w-full" style={{ height: '32px', display: 'flex', alignItems: 'center' }} />
                                    ) : field.name === "description" ? (
                                        <Input.TextArea placeholder={field.placeholder} rows={3} />
                                    ) : (
                                        <Input placeholder={field.placeholder} />
                                    )}
                                </Form.Item>
                            </Col>
                        ))}
                    </Row>
                </SectionCard>
                <div style={{ marginTop: '24px' }}>
                    <FormFooter
                        onCancel={onBack}
                        loading={updating || creating}
                        isEdit={isEdit}
                    />
                </div>
            </Form>
        </ViewContainer>
    );
};

export default RoomTypeForm;
