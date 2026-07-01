import React, { useEffect } from "react";
import { Form, Input, Button, Alert, Row, Col } from "antd";
import { useFrappeGetDoc, useFrappeUpdateDoc, useFrappeCreateDoc } from "../../hooks/useFrappe";
import { DOCTYPE_ITEM_CATEGORY } from "../../config/constants";
import AddPageHeader from "../../components/common/AddPageHeader";
import PageLoader from "../../components/common/PageLoader";
import FormFooter from "../../components/common/FormFooter";
import ViewContainer from "../../components/common/ViewContainer";
import SectionCard from "../../components/common/SectionCard";

const ItemCategoryForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(DOCTYPE_ITEM_CATEGORY, id);

    useEffect(() => {
        if (isEdit && initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [isEdit, initialValues, form]);

    const handleSave = async (values) => {
        try {
            if (isEdit) {
                await updateDoc(DOCTYPE_ITEM_CATEGORY, id, values);
            } else {
                await createDoc(DOCTYPE_ITEM_CATEGORY, values);
            }
            if (onBack) onBack();
        } catch (err) {
            console.error(err);
        }
    };

    if (fetching && isEdit) return <PageLoader />;
    if (fetchError) return <Alert message="Error loading item category" type="error" action={<Button onClick={onBack}>Back</Button>} />;

    const formItemStyle = { marginBottom: '14px' };

    return (
        <ViewContainer className="item-category-form-page">
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Edit Category" : "Add Category"}
                subtitle="Item Category Details"
                showBack={true}
            />

            <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false} size="middle">
                <SectionCard title="Category Details">
                    <Row gutter={[24, 0]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="category_name"
                                label="Category Name"
                                style={formItemStyle}
                                rules={[{ required: true, message: "Please enter the category name!" }]}
                            >
                                <Input placeholder="Enter Category Name" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="description"
                                label="Description"
                                style={formItemStyle}
                            >
                                <Input.TextArea placeholder="Enter Category Description" rows={2} />
                            </Form.Item>
                        </Col>
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

export default ItemCategoryForm;
