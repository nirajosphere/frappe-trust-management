import React, { useEffect } from "react";
import {
    Form, Input, Button, Alert, Select, DatePicker, Row, Col, Typography, InputNumber, message
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
    useFrappeGetDoc, useFrappeUpdateDoc, useFrappeCreateDoc, useFrappeGetDocList
} from "../../hooks/useFrappe";
import { DOCTYPE_INVENTORY_ENTRY, DOCTYPE_STORE_LOCATION } from "../../config/constants";
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

    // Watch purpose and reference_type
    const purpose = Form.useWatch("purpose", form);
    const referenceType = Form.useWatch("reference_type", form);

    // Fetch Temples list
    const { data: temples, loading: loadingTemples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        limit: 1000
    });

    // Fetch Store Locations list
    const { data: locations, loading: loadingLocations } = useFrappeGetDocList(DOCTYPE_STORE_LOCATION, {
        fields: ["name", "location_name"],
        limit: 1000
    });

    // Fetch Donations list
    const { data: donations, loading: loadingDonations } = useFrappeGetDocList("Donation", {
        fields: ["name", "donor_name", "total_amount", "creation"],
        limit: 1000,
        orderBy: "creation desc"
    });

    // Fetch Items list
    const { data: itemsList, loading: loadingItems } = useFrappeGetDocList("Item", {
        fields: ["name", "item_name", "item_code", "unit"],
        limit: 1000
    });

    useEffect(() => {
        if (isEdit && initialValues) {
            form.setFieldsValue({
                ...initialValues,
                purpose: initialValues.entry_type === "Stock In" ? "Receipt" : (initialValues.entry_type === "Stock Out" ? "Issue" : "Transfer"),
                posting_date: initialValues.posting_date ? dayjs(initialValues.posting_date) : null
            });
        } else {
            form.setFieldsValue({
                posting_date: dayjs(),
                purpose: "Receipt"
            });
        }
    }, [isEdit, initialValues, form]);

    const handleSave = async (values) => {
        try {
            // Validations
            if (values.purpose === "Transfer" && values.source_location === values.target_location) {
                message.error("Source and Target locations cannot be the same!");
                return;
            }

            const payload = {
                ...values,
                entry_type: values.purpose === "Receipt" ? "Stock In" : (values.purpose === "Issue" ? "Stock Out" : "Stock Adjustment"),
                posting_date: values.posting_date?.format("YYYY-MM-DD HH:mm:ss") || null,
                items: values.items?.map(item => ({
                    ...item,
                    qty: parseFloat(item.qty) || 0,
                    rate: parseFloat(item.rate) || 0,
                    total_amount: parseFloat(item.total_amount) || 0
                })) || []
            };
            delete payload.purpose;

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

    const handleItemChange = (itemId, fieldName) => {
        const itemObj = itemsList?.find(i => i.name === itemId);
        if (itemObj) {
            form.setFieldValue(['items', fieldName, 'unit'], itemObj.unit || "Nos");
            if (typeof frappe !== "undefined") {
                frappe.call({
                    method: "temple_donation.api.get_latest_item_rate",
                    args: {
                        item: itemId
                    },
                    callback: (r) => {
                        const latestRate = Number(r.message || 0);
                        form.setFieldValue(['items', fieldName, 'rate'], latestRate);
                        const qty = form.getFieldValue(['items', fieldName, 'qty']) || 0;
                        form.setFieldValue(['items', fieldName, 'total_amount'], qty * latestRate);
                    }
                });
            } else {
                form.setFieldValue(['items', fieldName, 'rate'], 0);
                form.setFieldValue(['items', fieldName, 'total_amount'], 0);
            }
        }
    };

    const handleQtyChange = (qty, fieldName) => {
        const rate = form.getFieldValue(['items', fieldName, 'rate']) || 0;
        form.setFieldValue(['items', fieldName, 'total_amount'], (qty || 0) * rate);
    };

    const handleRateChange = (rate, fieldName) => {
        const qty = form.getFieldValue(['items', fieldName, 'qty']) || 0;
        form.setFieldValue(['items', fieldName, 'total_amount'], qty * (rate || 0));
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
                        <Col xs={24} md={12}>
                            <Form.Item
                                name="purpose"
                                label="Purpose"
                                style={formItemStyle}
                                rules={[{ required: true, message: "Required" }]}
                            >
                                <Select 
                                    placeholder="Select Purpose" 
                                    options={[
                                        { label: "Receipt (Stock In)", value: "Receipt" },
                                        { label: "Issue (Stock Out)", value: "Issue" },
                                        { label: "Transfer (Between Locations)", value: "Transfer" }
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

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="posting_date"
                                label="Posting Date"
                                style={formItemStyle}
                            >
                                <DatePicker showTime format="DD-MM-YYYY HH:mm:ss" className="w-full" placeholder="Select date and time" />
                            </Form.Item>
                        </Col>

                        {/* Conditional warehouse selection based on purpose */}
                        {(purpose === "Issue" || purpose === "Transfer") && (
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="source_location"
                                    label="Source Location"
                                    style={formItemStyle}
                                    rules={[{ required: true, message: "Please select source location!" }]}
                                >
                                    <Select 
                                        showSearch
                                        placeholder="Select Source Location" 
                                        optionFilterProp="children"
                                        loading={loadingLocations}
                                        options={locations?.map(l => ({ label: l.location_name, value: l.name })) || []}
                                    />
                                </Form.Item>
                            </Col>
                        )}

                        {(purpose === "Receipt" || purpose === "Transfer") && (
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="target_location"
                                    label="Target Location"
                                    style={formItemStyle}
                                    rules={[{ required: true, message: "Please select target location!" }]}
                                >
                                    <Select 
                                        showSearch
                                        placeholder="Select Target Location" 
                                        optionFilterProp="children"
                                        loading={loadingLocations}
                                        options={locations?.map(l => ({ label: l.location_name, value: l.name })) || []}
                                    />
                                </Form.Item>
                            </Col>
                        )}

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="reference_type"
                                label="Reference Type"
                                style={formItemStyle}
                            >
                                <Select 
                                    placeholder="Select Reference Type" 
                                    options={[
                                        { label: "Donation", value: "Donation" },
                                        { label: "Purchase", value: "Purchase" },
                                        { label: "Kitchen Usage", value: "Kitchen Usage" },
                                        { label: "Pooja Usage", value: "Pooja Usage" },
                                        { label: "Manual Adjustment", value: "Manual Adjustment" }
                                    ]} 
                                    onChange={() => form.setFieldValue("reference_name", undefined)}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                name="reference_name"
                                label="Reference Name"
                                style={formItemStyle}
                            >
                                {referenceType === "Donation" ? (
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
                                ) : (
                                    <Input placeholder="Enter Reference ID" />
                                )}
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={24}>
                            <Form.Item
                                name="remarks"
                                label="Remarks"
                                style={formItemStyle}
                            >
                                <Input.TextArea placeholder="Enter internal remarks" rows={2} />
                            </Form.Item>
                        </Col>
                    </Row>
                </SectionCard>

                <div style={{ marginTop: '16px' }}>
                    <SectionCard title="Stock Items" icon={<PlusOutlined />}>
                        <Form.List name="items">
                            {(fields, { add, remove }) => (
                                <div className="flex flex-col gap-4">
                                    {fields.map(({ key, name: fieldName, ...restField }) => (
                                        <Row gutter={[16, 16]} key={key} align="bottom" className="pb-3 border-b border-zinc-100 last:border-0 last:pb-0">
                                            <Col xs={24} sm={8}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[fieldName, 'item']}
                                                    label={fieldName === 0 ? "Item" : ""}
                                                    rules={[{ required: true, message: "Please select an item" }]}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Select
                                                        showSearch
                                                        placeholder="Select Item"
                                                        optionFilterProp="children"
                                                        loading={loadingItems}
                                                        onChange={(val) => handleItemChange(val, fieldName)}
                                                        options={itemsList?.map(i => ({
                                                            label: `${i.item_name} (${i.item_code || 'No Code'})`,
                                                            value: i.name
                                                        })) || []}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={4}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[fieldName, 'qty']}
                                                    label={fieldName === 0 ? "Quantity" : ""}
                                                    rules={[{ required: true, message: "Required" }]}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <InputNumber 
                                                        placeholder="Qty" 
                                                        min={0.01} 
                                                        style={{ width: '100%' }} 
                                                        onChange={(val) => handleQtyChange(val, fieldName)} 
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={5}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[fieldName, 'rate']}
                                                    label={fieldName === 0 ? "Rate (₹)" : ""}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <InputNumber 
                                                        placeholder="Rate" 
                                                        style={{ width: '100%' }} 
                                                        onChange={(val) => handleRateChange(val, fieldName)}
                                                        precision={2} 
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={5}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[fieldName, 'total_amount']}
                                                    label={fieldName === 0 ? "Amount (₹)" : ""}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <InputNumber 
                                                        placeholder="Amount" 
                                                        disabled 
                                                        style={{ width: '100%' }} 
                                                        precision={2} 
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={2} className="text-center">
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => remove(fieldName)}
                                                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '36px', width: '36px' }}
                                                />
                                            </Col>
                                        </Row>
                                    ))}
                                    
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        block
                                        icon={<PlusOutlined />}
                                        className="h-10 border-zinc-300 text-zinc-700 hover:text-zinc-900 hover:border-zinc-900 font-medium"
                                    >
                                        Add Stock Item
                                    </Button>
                                </div>
                            )}
                        </Form.List>
                    </SectionCard>
                </div>

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
