import React, { useEffect } from "react";
import {
    Form, Input, Button, Alert, Select, DatePicker, Row, Col, Typography
} from "antd";
import dayjs from "dayjs";
import {
    useFrappeGetDoc, useFrappeUpdateDoc, useFrappeCreateDoc, useFrappeGetDocList
} from "../../hooks/useFrappe";
import { DOCTYPE_INVENTORY_ENTRY } from "../../config/constants";
import { inventoryEntryFormFields } from "../../formfield/inventoryEntryFormFields";
import AddPageHeader from "../../components/common/AddPageHeader";
import PageLoader from "../../components/common/PageLoader";
import FormFooter from "../../components/common/FormFooter";
import ViewContainer from "../../components/common/ViewContainer";
import SectionCard from "../../components/common/SectionCard";

const { Text } = Typography;

const InventoryEntryForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(DOCTYPE_INVENTORY_ENTRY, id);

    // Watch reference_type value
    const referenceType = Form.useWatch("reference_type", form);

    // Fetch Temples list for link field
    const { data: temples, loading: loadingTemples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        limit: 1000
    });

    // Fetch Donations list for link field when reference_type is "Donation"
    const { data: donations, loading: loadingDonations } = useFrappeGetDocList("Donation", {
        fields: ["name", "donor_name", "total_amount", "creation"],
        limit: 1000,
        orderBy: "creation desc"
    });

    useEffect(() => {
        if (isEdit && initialValues) {
            form.setFieldsValue({
                ...initialValues,
                posting_date: initialValues.posting_date ? dayjs(initialValues.posting_date) : null
            });
        } else {
            form.setFieldsValue({
                posting_date: dayjs()
            });
        }
    }, [isEdit, initialValues, form]);

    const handleSave = async (values) => {
        try {
            const payload = {
                ...values,
                posting_date: values.posting_date?.format("YYYY-MM-DD HH:mm:ss") || null
            };

            if (isEdit) {
                await updateDoc(DOCTYPE_INVENTORY_ENTRY, id, payload);
            } else {
                await createDoc(DOCTYPE_INVENTORY_ENTRY, payload);
            }
            if (onBack) onBack();
        } catch (err) {
            console.error(err);
        }
    };

    if (fetching && isEdit) return <PageLoader />;
    if (fetchError) return <Alert message="Error loading stock entry" type="error" action={<Button onClick={onBack}>Back</Button>} />;

    const formItemStyle = { marginBottom: '14px' };

    return (
        <ViewContainer className="donation-page">
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Edit Stock Entry" : "New Stock Entry"}
                subtitle="Manage Inventory Movements"
                showBack={true}
            />

            <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false} size="middle">
                <SectionCard title="Stock Entry Details">
                    <Row gutter={[24, 0]}>
                        {inventoryEntryFormFields.fields.map((field) => (
                            <Col xs={24} md={12} key={field.name}>
                                <Form.Item
                                    name={field.name}
                                    label={field.label}
                                    style={formItemStyle}
                                    rules={field.required ? [{ required: true, message: field.message || "Required" }] : []}
                                >
                                    {field.name === "reference_name" && referenceType === "Donation" ? (
                                        <Select 
                                            showSearch
                                            placeholder="Select Donation" 
                                            optionFilterProp="children"
                                            loading={loadingDonations}
                                            options={donations?.map(d => ({
                                                label: `${d.donor_name || 'Anonymous'} - ₹${parseFloat(d.total_amount).toFixed(2)} (${d.name})`,
                                                value: d.name
                                            })) || []}
                                        />
                                    ) : field.type === "select" ? (
                                        <Select 
                                            placeholder={field.placeholder} 
                                            options={field.options} 
                                            onChange={field.name === "reference_type" ? () => form.setFieldValue("reference_name", undefined) : undefined}
                                        />
                                    ) : field.type === "link" && field.doctype === "Temple" ? (
                                        <Select 
                                            showSearch
                                            placeholder={field.placeholder} 
                                            optionFilterProp="children"
                                            loading={loadingTemples}
                                            options={temples?.map(t => ({ label: t.temple_name, value: t.name })) || []}
                                        />
                                    ) : field.type === "datetime" ? (
                                        <DatePicker showTime format="DD-MM-YYYY HH:mm:ss" className="w-full" />
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

export default InventoryEntryForm;
