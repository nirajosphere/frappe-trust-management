import React, { useEffect } from "react";
import {
    Form, Input, Button, Alert, Select, DatePicker, Row, Col, Typography, Card, Space
} from "antd";
import {
    UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined,
    HomeOutlined, GlobalOutlined, PushpinOutlined, IdcardOutlined, HeartOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
    useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDoc
} from "../../hooks/useFrappe";
import { DOCTYPE_DONOR } from "../../config/constants";
import AddPageHeader from "../../components/common/AddPageHeader";
import ActivityLog from "../../components/common/ActivityLog";
import PageLoader from "../../components/common/PageLoader";
import FormFooter from "../../components/common/FormFooter";

const { Text } = Typography;

const DonorForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    // --- Frappe API Hooks ---
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data, loading, error } = useFrappeGetDoc(DOCTYPE_DONOR, id);

    // --- Effect for Form Setup and Binding ---
    useEffect(() => {
        if (isEdit && data) {
            form.setFieldsValue({
                ...data,
                date_of_birth: data.date_of_birth ? dayjs(data.date_of_birth) : null,
                anniversary_date: data.anniversary_date ? dayjs(data.anniversary_date) : null
            });
        } else {
            form.setFieldsValue({
                country: "India",
                state: "Gujarat",
                marital_status: "Unmarried"
            });
        }
    }, [isEdit, data, form]);

    // --- Form Submission Logic ---
    const handleSave = async (values) => {
        try {
            const payload = {
                ...values,
                date_of_birth: values.date_of_birth?.format("YYYY-MM-DD") || null,
                anniversary_date: values.anniversary_date?.format("YYYY-MM-DD") || null
            };

            if (isEdit) {
                await updateDoc(DOCTYPE_DONOR, id, payload);
            } else {
                await createDoc(DOCTYPE_DONOR, payload);
            }

            if (onBack) onBack();
        } catch (err) {
            console.error("Save Error:", err);
        }
    };

    if (loading) return <PageLoader />;
    if (error) return <Alert message="Error loading donor" type="error" action={<Button onClick={onBack}>Back</Button>} />;

    // Custom Form Item Style to reduce/override the massive bottom margin
    const formItemStyle = { marginBottom: '12px' };

    // Common Premium Card Style Config
    const commonCardProps = {
        size: "small",
        className: "shadow-sm border border-zinc-200/80 overflow-hidden",
        style: { 
            height: 'auto',
            background: '#fafafa', // Soft premium grey background tint
        },
        headStyle: {
            background: '#f4f4f5', // Header distinct dark grey tint
            borderBottom: '1px solid #e4e4e7',
            paddingTop: '8px',
            paddingBottom: '8px'
        },
        bodyStyle: {
            background: '#ffffff', // Content area clean white
            padding: '16px'
        }
    };

    return (
        <div className="donation-page py-6" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 16px' }}>
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Edit Donor" : "Add Donor"}
                subtitle="Donor Management"
                showBack={true}
            />

            {/* Added size="middle" globally for uniform height alignment across inputs */}
            <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false} size="middle">
                
                {/* Balanced Two-Column Stack Grid without any empty vertical row gaps */}
                <Row gutter={[24, 16]}>

                    {/* ================= LEFT COLUMN STACK ================= */}
                    <Col xs={24} lg={12}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            
                            {/* Card 1: Profile Information */}
                            <Card 
                                {...commonCardProps} 
                                title={<Space><UserOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Profile Information</span></Space>}
                            >
                                <Row gutter={[16, 0]}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="donor_name" label="Full Name" style={formItemStyle} rules={[{ required: true, message: "Required" }]}>
                                            <Input prefix={<UserOutlined style={{ color: '#a1a1aa' }} />} placeholder="Donor Full Name" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="mobile_number" label="Contact No" style={formItemStyle} rules={[{ required: true, message: "Required" }, { pattern: /^\d{10}$/, message: "Invalid number" }]}>
                                            <Input maxLength={10} prefix={<PhoneOutlined style={{ color: '#a1a1aa' }} />} placeholder="Mobile Number" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24}>
                                        <Form.Item name="email" label="Email" style={formItemStyle}>
                                            <Input prefix={<MailOutlined style={{ color: '#a1a1aa' }} />} placeholder="email@example.com" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24}>
                                        <Form.Item name="pan_card" label="PAN Card" style={formItemStyle} rules={[{ pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: "Invalid PAN" }]}>
                                            <Input prefix={<IdcardOutlined style={{ color: '#a1a1aa' }} />} placeholder="ABCDE1234F" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>

                            {/* Card 2: Personal Details */}
                            <Card 
                                {...commonCardProps} 
                                title={<Space><HeartOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Personal Details</span></Space>}
                            >
                                <Row gutter={[16, 0]}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="date_of_birth" label="Date of Birth" style={formItemStyle}>
                                            <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" placeholder="DD-MM-YYYY" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="marital_status" label="Marital Status" style={formItemStyle}>
                                            <Select style={{ width: '100%' }} options={[{ label: "Unmarried", value: "Unmarried" }, { label: "Married", value: "Married" }]} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24}>
                                        <Form.Item name="anniversary_date" label="Anniversary Date" style={formItemStyle}>
                                            <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" placeholder="DD-MM-YYYY" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>

                        </div>
                    </Col>

                    {/* ================= RIGHT COLUMN STACK ================= */}
                    <Col xs={24} lg={12}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            
                            {/* Card 3: Address & Native Origin */}
                            <Card 
                                {...commonCardProps} 
                                title={<Space><EnvironmentOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Address & Native Origin</span></Space>}
                            >
                                <Row gutter={[16, 0]}>
                                    <Col xs={24}>
                                        <Form.Item name="address" label="Address Line 1" style={formItemStyle}>
                                            <Input prefix={<HomeOutlined style={{ color: '#a1a1aa' }} />} placeholder="Flat / House No, Building" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24}>
                                        <Form.Item name="address_line_2" label="Address Line 2" style={formItemStyle}>
                                            <Input prefix={<EnvironmentOutlined style={{ color: '#a1a1aa' }} />} placeholder="Street, Locality" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="country" label="Country" style={formItemStyle}>
                                            <Input prefix={<GlobalOutlined style={{ color: '#a1a1aa' }} />} placeholder="Country" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="state" label="State" style={formItemStyle} rules={[{ required: true, message: "Required" }]}>
                                            <Input prefix={<EnvironmentOutlined style={{ color: '#a1a1aa' }} />} placeholder="State" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="city" label="City" style={formItemStyle} rules={[{ required: true, message: "Required" }]}>
                                            <Input prefix={<EnvironmentOutlined style={{ color: '#a1a1aa' }} />} placeholder="City" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="pincode" label="Pincode" style={formItemStyle}>
                                            <Input prefix={<PushpinOutlined style={{ color: '#a1a1aa' }} />} placeholder="Postal Code" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="native_place" label="Native Place" style={formItemStyle}>
                                            <Input prefix={<EnvironmentOutlined style={{ color: '#a1a1aa' }} />} placeholder="Native Place / Town" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>

                        </div>
                    </Col>

                </Row>

                <div style={{ marginTop: '24px' }}>
                    <FormFooter
                        onCancel={onBack}
                        loading={creating || updating}
                        isEdit={isEdit}
                    />
                </div>
            </Form>

            {isEdit && <ActivityLog doctype={DOCTYPE_DONOR} docname={id} />}
        </div>
    );
};

export default DonorForm;