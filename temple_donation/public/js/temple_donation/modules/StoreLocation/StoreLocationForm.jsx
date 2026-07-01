import React, { useEffect } from "react";
import { Form, Input, Button, Alert, Select, Row, Col } from "antd";
import { useFrappeGetDoc, useFrappeUpdateDoc, useFrappeCreateDoc, useFrappeGetDocList } from "../../hooks/useFrappe";
import { DOCTYPE_STORE_LOCATION } from "../../config/constants";
import AddPageHeader from "../../components/common/AddPageHeader";
import PageLoader from "../../components/common/PageLoader";
import FormFooter from "../../components/common/FormFooter";
import ViewContainer from "../../components/common/ViewContainer";
import SectionCard from "../../components/common/SectionCard";

const StoreLocationForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(DOCTYPE_STORE_LOCATION, id);

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
                await updateDoc(DOCTYPE_STORE_LOCATION, id, values);
            } else {
                await createDoc(DOCTYPE_STORE_LOCATION, values);
            }
            if (onBack) onBack();
        } catch (err) {
            console.error(err);
        }
    };

    if (fetching && isEdit) return <PageLoader />;
    if (fetchError) return <Alert message="Error loading store location" type="error" action={<Button onClick={onBack}>Back</Button>} />;

    const formItemStyle = { marginBottom: '14px' };

    return (
        <ViewContainer className="store-location-form-page">
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Edit Store Location" : "Add Store Location"}
                subtitle="Store Location Details"
                showBack={true}
            />

            <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false} size="middle">
                <SectionCard title="Store Location Details">
                    <Row gutter={[24, 0]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="location_name"
                                label="Location Name"
                                style={formItemStyle}
                                rules={[{ required: true, message: "Please enter the location name!" }]}
                            >
                                <Input placeholder="Enter Location Name" />
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

                        <Col xs={24} md={24}>
                            <Form.Item
                                name="description"
                                label="Description"
                                style={formItemStyle}
                            >
                                <Input.TextArea placeholder="Enter Location Description" rows={2} />
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

export default StoreLocationForm;
