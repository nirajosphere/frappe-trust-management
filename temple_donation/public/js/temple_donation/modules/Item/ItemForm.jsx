import React, { useEffect } from "react";
import {
    Form, Input, Button, Alert, Select, Row, Col, Typography
} from "antd";
import {
    useFrappeGetDoc, useFrappeUpdateDoc, useFrappeCreateDoc, useFrappeGetDocList
} from "../../hooks/useFrappe";
import { DOCTYPE_ITEM } from "../../config/constants";
import AddPageHeader from "../../components/common/AddPageHeader";
import PageLoader from "../../components/common/PageLoader";
import FormFooter from "../../components/common/FormFooter";
import ViewContainer from "../../components/common/ViewContainer";
import SectionCard from "../../components/common/SectionCard";

const { Text } = Typography;

const ItemForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(DOCTYPE_ITEM, id);
    
    // Fetch Temples list for link field
    const { data: temples, loading: loadingTemples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        limit: 1000
    });

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

    if (fetching && isEdit) return <PageLoader />;
    if (fetchError) return <Alert message="Error loading item" type="error" action={<Button onClick={onBack}>Back</Button>} />;

    const formItemStyle = { marginBottom: '14px' };

    return (
        <ViewContainer className="donation-page">
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Edit Item" : "Add Item"}
                subtitle="Inventory Item Details"
                showBack={true}
            />

            <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false} size="middle">
                <SectionCard title="Item Details">
                    <Row gutter={[24, 0]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="item_name"
                                label="Item Name"
                                style={formItemStyle}
                                rules={[{ required: true, message: "Please enter the item name!" }]}
                            >
                                <Input placeholder="Enter Item Name" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="item_code"
                                label="Item Code"
                                style={formItemStyle}
                            >
                                <Input placeholder="Enter Item Code" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="unit"
                                label="Unit"
                                style={formItemStyle}
                                rules={[{ required: true, message: "Required" }]}
                            >
                                <Select 
                                    placeholder="Select Unit" 
                                    options={[
                                        { label: "Nos", value: "Nos" },
                                        { label: "Kg", value: "Kg" },
                                        { label: "Litre", value: "Litre" }
                                    ]} 
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="temple"
                                label="Trust Name"
                                style={formItemStyle}
                                rules={[{ required: true, message: "Required" }]}
                            >
                                <Select 
                                    showSearch
                                    placeholder="Select Trust Name" 
                                    optionFilterProp="children"
                                    loading={loadingTemples}
                                    options={temples?.map(t => ({ label: t.temple_name, value: t.name })) || []}
                                />
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

export default ItemForm;
