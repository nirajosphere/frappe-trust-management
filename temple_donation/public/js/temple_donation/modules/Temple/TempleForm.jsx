import React, { useEffect, useState } from "react";
import {
    Form, Input, Button, Alert, Switch, List, Avatar, Row, Col, Typography, Card, Space
} from "antd";
import {
    HomeOutlined, EnvironmentOutlined, GlobalOutlined, PushpinOutlined,
    InfoCircleOutlined, FileTextOutlined, BankOutlined, AppstoreOutlined
} from "@ant-design/icons";
import {
    useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDoc, useFrappeGetDocList
} from "../../hooks/useFrappe";
import { DOCTYPE_TEMPLE, DOCTYPE_DONATION_TYPE } from "../../config/constants";
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

const TempleForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();
    const [selectedDonationTypes, setSelectedDonationTypes] = useState([]);

    // --- Frappe API Hooks ---
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data, loading, error } = useFrappeGetDoc(DOCTYPE_TEMPLE, id);
    const { data: donationTypes } = useFrappeGetDocList(DOCTYPE_DONATION_TYPE, {
        fields: ["name", "donation_type", "donation_image"]
    });

    // --- Form Watchers for Live Preview Panel ---
    const templeName = Form.useWatch("temple_name", form) || "";
    const templeId   = Form.useWatch("temple_id",   form) || "";
    const initials   = templeName
        ? templeName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
        : "T";

    // --- Effect for Form Setup and Binding ---
    useEffect(() => {
        if (isEdit && data) {
            form.setFieldsValue(data);
            if (data.donation_types && Array.isArray(data.donation_types) && data.donation_types.length > 0) {
                setSelectedDonationTypes(data.donation_types.map(d => d.donation_type));
            } else if (data.dontatio_type) {
                setSelectedDonationTypes([data.dontatio_type]);
            }
        } else {
            form.setFieldsValue({ country: "India", state: "Gujarat" });
        }
    }, [isEdit, data, form]);

    // --- Form Submission Logic ---
    const handleSave = async (values) => {
        try {
            const payload = {
                ...values,
                donation_types: selectedDonationTypes.map(name => ({
                    doctype: "Temple Donation Type",
                    donation_type: name
                }))
            };
            if (isEdit) await updateDoc(DOCTYPE_TEMPLE, id, payload);
            else        await createDoc(DOCTYPE_TEMPLE, payload);
            if (onBack) onBack();
        } catch (err) {
            console.error("Save Error:", err);
        }
    };

    const toggleDonationType = (name) => {
        setSelectedDonationTypes(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    const allSelected = donationTypes && donationTypes.length > 0 && selectedDonationTypes.length === donationTypes.length;

    const handleSelectAllChange = (checked) => {
        setSelectedDonationTypes(checked ? donationTypes.map(d => d.name) : []);
    };

    if (isEdit && loading) return <PageLoader />;
    if (isEdit && error)   return <Alert message="Error loading data" type="error" />;

    return (
        <div className="donation-page py-6">
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Edit Temple" : "Add Temple"}
                subtitle="Temple Management"
                showBack={true}
            />

            <Form layout="vertical" form={form} onFinish={handleSave} requiredMark={false}>
                <Row gutter={[24, 24]}>

                    {/* ─── LEFT: Temple Info Panel ─── */}
                    <Col xs={24} lg={7}>
                        <div className="space-y-6 sticky top-6">
                            <Card size="small" title={<Space><BankOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Temple Profile</span></Space>}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '8px 0' }}>
                                    <Avatar size={88} style={{ fontSize: 28, fontWeight: 900, border: '2px solid #f4f4f5', backgroundColor: '#18181b', color: '#fff' }}>
                                        {initials}
                                    </Avatar>
                                    <div style={{ textAlign: 'center', width: '100%' }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#18181b' }}>{templeName || "Temple Name"}</div>
                                        {templeId && <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 4 }}>ID: {templeId}</div>}
                                    </div>
                                    <div style={{ width: '100%', borderTop: '1px solid #f4f4f5', paddingTop: 10, textAlign: 'center' }}>
                                        <span style={{ fontSize: 10, color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {selectedDonationTypes.length > 0 ? `${selectedDonationTypes.length} Active Type${selectedDonationTypes.length > 1 ? "s" : ""}` : "No Active Types"}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </Col>

                    {/* ─── RIGHT: Form Cards ─── */}
                    <Col xs={24} lg={17}>
                        <div className="space-y-6">

                            {/* Temple Details */}
                            <Card size="small" title={<Space><BankOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Temple Details</span></Space>}>
                                <Row gutter={[16, 12]}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="temple_name" label="Temple Name" rules={[{ required: true, message: "Required" }]}>
                                            <Input prefix={<BankOutlined style={{ color: '#a1a1aa' }} />} placeholder="Full Temple Name" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="temple_id" label="Temple ID" rules={[{ required: true, message: "Required" }]}>
                                            <Input prefix={<InfoCircleOutlined style={{ color: '#a1a1aa' }} />} placeholder="Unique Temple ID" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="trust_registration_no" label="Trust Registration No." rules={[{ required: true, message: "Required" }]}>
                                            <Input prefix={<FileTextOutlined style={{ color: '#a1a1aa' }} />} placeholder="Trust Reg. Number" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="note" label="Note">
                                            <Input prefix={<FileTextOutlined style={{ color: '#a1a1aa' }} />} placeholder="Optional note" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>

                            {/* Address */}
                            <Card size="small" title={<Space><EnvironmentOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Address</span></Space>}>
                                <Row gutter={[16, 12]}>
                                    <Col xs={24}>
                                        <Form.Item name="temple_address" label="Temple Address" rules={[{ required: true, message: "Required" }]}>
                                            <Input prefix={<HomeOutlined style={{ color: '#a1a1aa' }} />} placeholder="Full Street Address" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="country" label="Country" rules={[{ required: true }]}>
                                            <Input prefix={<GlobalOutlined style={{ color: '#a1a1aa' }} />} placeholder="India" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="state" label="State" rules={[{ required: true }]}>
                                            <Input prefix={<EnvironmentOutlined style={{ color: '#a1a1aa' }} />} placeholder="State" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="city" label="City" rules={[{ required: true }]}>
                                            <Input prefix={<EnvironmentOutlined style={{ color: '#a1a1aa' }} />} placeholder="City" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="pincode" label="Pincode" rules={[{ required: true }]}>
                                            <Input prefix={<PushpinOutlined style={{ color: '#a1a1aa' }} />} placeholder="Postal Code" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>

                            {/* Donation Types */}
                            <Card size="small" title={<Space><AppstoreOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Donation Types</span></Space>}
                                extra={donationTypes && donationTypes.length > 0 && (
                                    <Space size={8}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>Select All</span>
                                        <Switch checked={allSelected} onChange={handleSelectAllChange} className={allSelected ? "bg-zinc-800" : "bg-zinc-200"} />
                                    </Space>
                                )}
                            >
                                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                                    <List
                                        dataSource={donationTypes}
                                        renderItem={item => {
                                            const active = selectedDonationTypes.includes(item.name);
                                            return (
                                                <List.Item
                                                    className="px-2 py-3 hover:bg-zinc-50 transition-colors"
                                                    actions={[
                                                        <Switch checked={active} onChange={() => toggleDonationType(item.name)} className={active ? "bg-zinc-800" : "bg-zinc-200"} />
                                                    ]}
                                                >
                                                    <List.Item.Meta
                                                        avatar={<Avatar src={item.donation_image} shape="square" size="large" style={{ backgroundColor: '#f4f4f5', border: '1px solid #e4e4e7', color: '#18181b', fontWeight: 900 }}>{item.donation_type?.charAt(0)}</Avatar>}
                                                        title={<Text strong style={{ color: '#3f3f46' }}>{item.donation_type}</Text>}
                                                    />
                                                </List.Item>
                                            );
                                        }}
                                    />
                                </div>
                            </Card>

                        </div>
                    </Col>

                </Row>

                <FormFooter
                    onCancel={onBack}
                    loading={creating || updating}
                    isEdit={isEdit}
                    saveText={isEdit ? "Update Temple" : "Add Temple"}
                />
            </Form>

            {isEdit && <ActivityLog doctype={DOCTYPE_TEMPLE} docname={id} />}
        </div>
    );
};

export default TempleForm;