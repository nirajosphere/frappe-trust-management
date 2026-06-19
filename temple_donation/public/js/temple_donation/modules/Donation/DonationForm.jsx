import React, { useEffect } from "react";
import {
    Form, Input, Button, Card, Typography, Row, Col, Alert, DatePicker, Select, Space
} from "antd";
import dayjs from "dayjs";
import {
    SaveOutlined, UserOutlined, EnvironmentOutlined, HeartOutlined,
    GiftOutlined, DollarOutlined
} from "@ant-design/icons";
import {
    useFrappeGetDoc, useFrappeUpdateDoc, useFrappeGetDocList
} from "../../hooks/useFrappe";
import { DOCTYPE_DONATION } from "../../config/constants";
import AddPageHeader from "../../components/common/AddPageHeader";
import ActivityLog from "../../components/common/ActivityLog";
import PageLoader from "../../components/common/PageLoader";
import FormFooter from "../../components/common/FormFooter";
import ViewContainer from "../../components/common/ViewContainer";
import SectionCard from "../../components/common/SectionCard";

const { Text } = Typography;

const DonationForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(DOCTYPE_DONATION, id);
    const { data: donationTypesList } = useFrappeGetDocList("Donation Type", { fields: ["name", "donation_type"], limit: 500 });

    useEffect(() => {
        if (isEdit && initialValues) {
            const vals = { ...initialValues };
            if (vals.dob) vals.dob = dayjs(vals.dob);
            if (vals.date_of_anniversary) vals.date_of_anniversary = dayjs(vals.date_of_anniversary);
            form.setFieldsValue(vals);
        }
    }, [isEdit, initialValues, form]);

    const handleSave = async (values) => {
        try {
            const formattedValues = { ...values };
            if (values.dob && values.dob.format) formattedValues.dob = values.dob.format('YYYY-MM-DD');
            if (values.date_of_anniversary && values.date_of_anniversary.format) formattedValues.date_of_anniversary = values.date_of_anniversary.format('YYYY-MM-DD');
            
            if (formattedValues.donation_items && Array.isArray(formattedValues.donation_items)) {
                formattedValues.donation_items = formattedValues.donation_items.map(item => ({
                    ...item,
                    amount: parseFloat(item.amount) || 0
                }));
            }
            
            await updateDoc(DOCTYPE_DONATION, id, formattedValues);
            if (onBack) onBack();
        } catch (err) {
            console.error(err);
        }
    };

    if (fetching) return <PageLoader />;
    if (fetchError) return <Alert message="Error" description={fetchError.message} type="error" />;

    const formItemStyle = { marginBottom: '12px' };

    // Common Premium Card Style & Props
    // const commonCardProps = {
    //     size: "small",
    //     className: "shadow-sm border border-zinc-200/80 overflow-hidden",
    //     style: { 
    //         height: 'auto',
    //         background: '#fafafa', // Halka soft premium grey background
    //     },
    //     headStyle: {
    //         background: '#f4f4f5', // Header ke liye thoda dark background separation ke liye
    //         borderBottom: '1px solid #e4e4e7',
    //         paddingTop: '8px',
    //         paddingBottom: '8px'
    //     },
    //     bodyStyle: {
    //         background: '#ffffff', // Content area clean white taaki inputs acche se highlight hon
    //         padding: '16px'
    //     }
    // };

    return (
        <ViewContainer className="donation-page">
            <AddPageHeader
                onBack={onBack}
                title="Edit Donation"
                subtitle="Donation Entry"
                showBack={true}
            />

            <Form form={form} layout="vertical" onFinish={handleSave} size="middle">
                
                {/* Master Grid Split */}
                <Row gutter={[24, 16]}>
                    
                    {/* ================= LEFT COLUMN STACK ================= */}
                    <Col xs={24} lg={12}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            
                            {/* Card 1: Donor Information */}
                            <SectionCard 
                                title="Donor Information"
                                icon={<UserOutlined style={{ color: '#18181b' }} />}
                            >
                                <Form.Item name="name" hidden><Input /></Form.Item>
                                <Row gutter={[16, 0]}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="name_on_receipt" label="Name on Receipt" style={formItemStyle}>
                                            <Input placeholder="Enter receipt name" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="donor_name" label="Donor Name" style={formItemStyle}>
                                            <Input placeholder="Enter donor name" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="cashier" label="Donation Receiver Name" style={formItemStyle}>
                                            <Input placeholder="Enter receiver name" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="contact_number" label="Contact Number" style={formItemStyle}>
                                            <Input placeholder="Enter contact number" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24}>
                                        <Form.Item name="email" label="Email" style={formItemStyle}>
                                            <Input type="email" placeholder="Enter email address" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </SectionCard>

                            {/* Card 2: Address */}
                            <SectionCard 
                                title="Address"
                                icon={<EnvironmentOutlined style={{ color: '#18181b' }} />}
                            >
                                <Row gutter={[16, 0]}>
                                    <Col xs={24}>
                                        <Form.Item name="address_line_1" label="Address Line 1" style={formItemStyle}>
                                            <Input placeholder="Enter Address Line 1" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24}>
                                        <Form.Item name="address_line_2" label="Address Line 2" style={formItemStyle}>
                                            <Input placeholder="Enter Address Line 2" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="country" label="Country" style={formItemStyle}>
                                            <Input placeholder="Country" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="state" label="State" style={formItemStyle}>
                                            <Input placeholder="State" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="city" label="City" style={formItemStyle}>
                                            <Input placeholder="City" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="pincode" label="Pincode" style={formItemStyle}>
                                            <Input placeholder="Enter pincode" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="native_place" label="Native Place" style={formItemStyle}>
                                            <Input placeholder="Enter Native Place" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </SectionCard>

                        </div>
                    </Col>

                    {/* ================= RIGHT COLUMN STACK ================= */}
                    <Col xs={24} lg={12}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            
                            {/* Card 3: Personal Details */}
                            <SectionCard 
                                title="Personal Details"
                                icon={<HeartOutlined style={{ color: '#18181b' }} />}
                            >
                                <Row gutter={[16, 0]}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="dob" label="Date of Birth" style={formItemStyle}>
                                            <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" placeholder="DD-MM-YYYY" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="marital_status" label="Marital Status" style={formItemStyle}>
                                            <Select style={{ width: '100%' }} placeholder="Select Status">
                                                <Select.Option value="Unmarried">Unmarried</Select.Option>
                                                <Select.Option value="Married">Married</Select.Option>
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24}>
                                        <Form.Item name="date_of_anniversary" label="Date of Anniversary" style={formItemStyle}>
                                            <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" placeholder="DD-MM-YYYY" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </SectionCard>

                            {/* Card 4: Donation Payments */}
                            <SectionCard 
                                title="Donation Payments"
                                icon={<DollarOutlined style={{ color: '#18181b' }} />}
                            >
                                <Row gutter={[16, 0]}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="payment_mode" label="Payment Type" style={formItemStyle}>
                                            <Input placeholder="e.g. Cash, Online" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="total_amount" label="Total Amount" style={formItemStyle}>
                                            <Input type="number" placeholder="0.00" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </SectionCard>

                            {/* Card 5: Donation Items */}
                            <SectionCard 
                                title="Donation Items"
                                icon={<GiftOutlined style={{ color: '#18181b' }} />}
                            >
                                <Row gutter={[16, 0]}>
                                    <Form.List name="donation_items">
                                        {(fields) => (
                                            <>
                                                {fields.map(({ key, name: fieldName, ...restField }) => {
                                                    const itemVal = form.getFieldValue(["donation_items", fieldName]);
                                                    const dTypeRecord = donationTypesList?.find(t => t.name === itemVal?.donation_type);
                                                    const label = dTypeRecord ? dTypeRecord.donation_type : (itemVal?.donation_type || "Donation Item");
                                                    return (
                                                        <Col xs={24} sm={12} key={key}>
                                                            <Form.Item {...restField} name={[fieldName, 'amount']} label={label} style={formItemStyle}>
                                                                <Input type="number" placeholder="0.00" />
                                                            </Form.Item>
                                                            <Form.Item name={[fieldName, 'name']} hidden><Input /></Form.Item>
                                                            <Form.Item name={[fieldName, 'donation_type']} hidden><Input /></Form.Item>
                                                        </Col>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </Form.List>
                                </Row>
                            </SectionCard>

                        </div>
                    </Col>

                </Row>

                <div style={{ marginTop: '24px' }}>
                    <FormFooter
                        onCancel={onBack}
                        loading={updating}
                        cancelText="Back"
                        saveText="Update Donation"
                    />
                </div>
            </Form>

            {isEdit && <ActivityLog doctype={DOCTYPE_DONATION} docname={id} />}
        </ViewContainer>
    );
};

export default DonationForm;