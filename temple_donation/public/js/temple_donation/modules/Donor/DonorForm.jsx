import React, { useEffect } from "react";
import {
    Form, Input, Button, Alert, Select, DatePicker, Avatar, Row, Col, Typography, Card, Space
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

// --- Clean & Minimalist Section Title with Tailwind ---
const SectionTitle = ({ icon, children }) => (
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-200 pb-2.5 mb-5 mt-1">
        {icon} {children}
    </div>
);

const DonorForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    // --- Frappe API Hooks ---
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data, loading, error } = useFrappeGetDoc(DOCTYPE_DONOR, id);

    // --- Form Watchers for Live Preview Panel ---
    const donorName = Form.useWatch("donor_name", form) || "";
    const initials = donorName
        ? donorName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
        : "D";

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

    return (
        <div className="donation-page py-6">
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Edit Donor" : "Add Donor"}
                subtitle="Donor Management"
                showBack={true}
            />

            <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false}>
                <Row gutter={[24, 24]}>

                    {/* ─── LEFT: Donor Info Panel ─── */}
                    <Col xs={24} lg={7}>
                        <div className="space-y-6 sticky top-6">
                            <Card size="small" title={<Space><UserOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Donor Profile</span></Space>}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '8px 0' }}>
                                    <Avatar size={88} style={{ fontSize: 28, fontWeight: 900, border: '2px solid #f4f4f5', backgroundColor: '#18181b', color: '#fff' }}>
                                        {initials}
                                    </Avatar>
                                    <div style={{ textAlign: 'center', width: '100%' }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#18181b' }}>{donorName || "Donor Name"}</div>
                                        <div style={{ marginTop: 6 }}>
                                            <span style={{ backgroundColor: '#f4f4f5', border: '1px solid #e4e4e7', color: '#3f3f46', borderRadius: 6, padding: '2px 10px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {isEdit ? "Registered" : "New Donor"}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ width: '100%', borderTop: '1px solid #f4f4f5', paddingTop: 10, textAlign: 'center' }}>
                                        <span style={{ fontSize: 10, color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Donor Record</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </Col>

                    {/* ─── RIGHT: Form Cards ─── */}
                    <Col xs={24} lg={17}>
                        <div className="space-y-6">

                            {/* Card 1: Profile Information */}
                            <Card size="small" title={<Space><UserOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Profile Information</span></Space>}>
                                <Row gutter={[16, 12]}>
                                    <Col xs={24} sm={12} md={8}>
                                        <Form.Item name="donor_name" label="Full Name" rules={[{ required: true, message: "Required" }]}>
                                            <Input prefix={<UserOutlined style={{ color: '#a1a1aa' }} />} placeholder="Donor Full Name" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <Form.Item name="mobile_number" label="Contact No" rules={[{ required: true, message: "Required" }, { pattern: /^\d{10}$/, message: "Invalid number" }]}>
                                            <Input maxLength={10} prefix={<PhoneOutlined style={{ color: '#a1a1aa' }} />} placeholder="Mobile Number" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <Form.Item name="email" label="Email">
                                            <Input prefix={<MailOutlined style={{ color: '#a1a1aa' }} />} placeholder="email@example.com" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <Form.Item name="pan_card" label="PAN Card" rules={[{ pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: "Invalid PAN" }]}>
                                            <Input prefix={<IdcardOutlined style={{ color: '#a1a1aa' }} />} placeholder="ABCDE1234F" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>

                            {/* Card 2: Personal Details */}
                            <Card size="small" title={<Space><HeartOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Personal Details</span></Space>}>
                                <Row gutter={[16, 12]}>
                                    <Col xs={24} sm={12} md={8}>
                                        <Form.Item name="date_of_birth" label="Date of Birth">
                                            <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" placeholder="DD-MM-YYYY" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <Form.Item name="marital_status" label="Marital Status">
                                            <Select style={{ width: '100%' }} options={[{ label: "Unmarried", value: "Unmarried" }, { label: "Married", value: "Married" }]} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <Form.Item name="anniversary_date" label="Anniversary Date">
                                            <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" placeholder="DD-MM-YYYY" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>

                            {/* Card 3: Address & Native Origin */}
                            <Card size="small" title={<Space><EnvironmentOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Address & Native Origin</span></Space>}>
                                <Row gutter={[16, 12]}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="address" label="Address Line 1">
                                            <Input prefix={<HomeOutlined style={{ color: '#a1a1aa' }} />} placeholder="Flat / House No, Building" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="address_line_2" label="Address Line 2">
                                            <Input prefix={<EnvironmentOutlined style={{ color: '#a1a1aa' }} />} placeholder="Street, Locality" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="country" label="Country">
                                            <Input prefix={<GlobalOutlined style={{ color: '#a1a1aa' }} />} placeholder="Country" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="state" label="State" rules={[{ required: true, message: "Required" }]}>
                                            <Input prefix={<EnvironmentOutlined style={{ color: '#a1a1aa' }} />} placeholder="State" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="city" label="City" rules={[{ required: true, message: "Required" }]}>
                                            <Input prefix={<EnvironmentOutlined style={{ color: '#a1a1aa' }} />} placeholder="City" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="pincode" label="Pincode">
                                            <Input prefix={<PushpinOutlined style={{ color: '#a1a1aa' }} />} placeholder="Postal Code" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="native_place" label="Native Place">
                                            <Input prefix={<EnvironmentOutlined style={{ color: '#a1a1aa' }} />} placeholder="Native Place / Town" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>

                        </div>
                    </Col>

                </Row>

                <FormFooter
                    onCancel={onBack}
                    loading={creating || updating}
                    isEdit={isEdit}
                />
            </Form>

            {isEdit && <ActivityLog doctype={DOCTYPE_DONOR} docname={id} />}
        </div>
    );
};

export default DonorForm;