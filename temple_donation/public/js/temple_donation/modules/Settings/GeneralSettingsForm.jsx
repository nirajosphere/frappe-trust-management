import React, { useState, useEffect } from "react";
import {
    Form, Input, Button, Card, Row, Col, Select, Switch,
    Typography, Divider, message, Upload, ColorPicker, InputNumber
} from "antd";
import {
    SettingOutlined, SaveOutlined, BankOutlined, GlobalOutlined,
    LoadingOutlined, UploadOutlined, PictureOutlined
} from "@ant-design/icons";
import {
    useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDocList
} from "../../hooks/useFrappe";
import { DOCTYPE_GENERAL_SETTINGS } from "../../config/constants";
import AddPageHeader from "../../components/common/AddPageHeader";
import ViewContainer from "../../components/common/ViewContainer";

const { Text, Title, Paragraph } = Typography;

const GeneralSettingsForm = ({ onBack }) => {
    const [form] = Form.useForm();
    const [selectedTemple, setSelectedTemple] = useState(null);
    const [settingsDocName, setSettingsDocName] = useState(null);
    const [loadingSettings, setLoadingSettings] = useState(false);

    // --- API Hooks ---
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data: temples, loading: loadingTemples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        limit: 1000
    });

    // Fetch existing settings when a temple is selected
    useEffect(() => {
        if (!selectedTemple || typeof frappe === "undefined") {
            setSettingsDocName(null);
            form.resetFields();
            return;
        }

        setLoadingSettings(true);
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: DOCTYPE_GENERAL_SETTINGS,
                filters: { temple: selectedTemple },
                fields: ["*"]
            },
            callback: (r) => {
                setLoadingSettings(false);
                if (r.message && r.message.length > 0) {
                    const doc = r.message[0];
                    setSettingsDocName(doc.name);
                    form.setFieldsValue(doc);
                } else {
                    setSettingsDocName(null);
                    form.setFieldsValue({
                        organization_name: "",
                        organization_type: "Temple",
                        address_line_1: "",
                        address_line_2: "",
                        city: "",
                        state: "",
                        pincode: "",
                        contact_phone: "",
                        contact_email: "",
                        website: "",
                        default_currency: "INR",
                        financial_year_start: "April",
                        timezone: "Asia/Kolkata",
                        primary_color: "#18181b",
                        enable_dark_mode: 0,
                        pan_number: "",
                        registration_number: "",
                        section_80g_number: ""
                    });
                }
            },
            error: () => {
                setLoadingSettings(false);
            }
        });
    }, [selectedTemple, form]);

    const handleSave = async (values) => {
        try {
            if (settingsDocName) {
                await updateDoc(DOCTYPE_GENERAL_SETTINGS, settingsDocName, values);
                message.success("General settings updated successfully");
            } else {
                const res = await createDoc(DOCTYPE_GENERAL_SETTINGS, {
                    temple: selectedTemple,
                    ...values
                });
                setSettingsDocName(res.name);
                message.success("General settings saved successfully");
            }
        } catch (err) {
            console.error("Save General Settings Error:", err);
        }
    };

    const formItemStyle = { marginBottom: "16px" };

    const financialYearOptions = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ].map(m => ({ label: m, value: m }));

    const orgTypeOptions = [
        { label: "Temple", value: "Temple" },
        { label: "Trust", value: "Trust" },
        { label: "Charitable Organization", value: "Charitable Organization" },
        { label: "Religious Institution", value: "Religious Institution" },
        { label: "Society", value: "Society" },
        { label: "Foundation", value: "Foundation" }
    ];

    return (
        <ViewContainer>
            <AddPageHeader
                onBack={onBack}
                title="General Settings"
                subtitle="Configure organization profile, branding, and financial defaults."
                showBack={true}
            />

            <Card bordered={false} style={{ marginBottom: "20px", borderRadius: "8px" }} className="shadow-sm">
                <Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                        <Form.Item label="Select Temple / Trust to Configure" required>
                            <Select
                                showSearch
                                placeholder="Choose Temple"
                                loading={loadingTemples}
                                optionFilterProp="children"
                                value={selectedTemple}
                                onChange={(val) => setSelectedTemple(val)}
                                options={temples?.map(t => ({ label: t.temple_name, value: t.name })) || []}
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Card>

            {!selectedTemple ? (
                <Card bordered={false} className="shadow-sm">
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                        <BankOutlined style={{ fontSize: "48px", color: "#d4d4d8", marginBottom: "16px" }} />
                        <Title level={5} type="secondary" style={{ margin: 0 }}>Select a Temple / Trust</Title>
                        <Text type="secondary" style={{ fontSize: "13px" }}>
                            Choose from the dropdown above to manage its general settings.
                        </Text>
                    </div>
                </Card>
            ) : loadingSettings ? (
                <div style={{ padding: "40px 0", textAlign: "center" }}>
                    <LoadingOutlined style={{ fontSize: 24, color: "#18181b" }} spin />
                    <div style={{ marginTop: "12px", color: "#71717a" }}>Loading configurations...</div>
                </div>
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    requiredMark={false}
                    size="middle"
                >
                    <Row gutter={[24, 0]}>
                        {/* LEFT COLUMN */}
                        <Col xs={24} lg={16}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                                {/* Organization Profile */}
                                <Card
                                    title={<span><BankOutlined /> Organization Profile</span>}
                                    bordered={false}
                                    className="shadow-sm"
                                >
                                    <Paragraph type="secondary" style={{ fontSize: "13px" }}>
                                        Basic identity and contact details for this trust or temple.
                                    </Paragraph>
                                    <Row gutter={[16, 0]}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="organization_name" label="Organization Name" style={formItemStyle}>
                                                <Input placeholder="e.g. Shri Malataj Meldi Maa Trust" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="organization_type" label="Organization Type" style={formItemStyle}>
                                                <Select placeholder="Select Type" options={orgTypeOptions} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="contact_phone" label="Contact Phone" style={formItemStyle}>
                                                <Input placeholder="+91 98765 43210" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="contact_email" label="Contact Email" style={formItemStyle}>
                                                <Input placeholder="info@temple.org" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="website" label="Website" style={formItemStyle}>
                                                <Input placeholder="https://temple.org" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>

                                {/* Address */}
                                <Card
                                    title={<span><GlobalOutlined /> Address Details</span>}
                                    bordered={false}
                                    className="shadow-sm"
                                >
                                    <Row gutter={[16, 0]}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="address_line_1" label="Address Line 1" style={formItemStyle}>
                                                <Input placeholder="Street / Building" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="address_line_2" label="Address Line 2" style={formItemStyle}>
                                                <Input placeholder="Area / Landmark" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="city" label="City" style={formItemStyle}>
                                                <Input placeholder="Ahmedabad" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="state" label="State" style={formItemStyle}>
                                                <Input placeholder="Gujarat" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="pincode" label="Pincode" style={formItemStyle}>
                                                <Input placeholder="380001" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>

                                {/* Financial & Regional */}
                                <Card
                                    title={<span><SettingOutlined /> Financial & Regional</span>}
                                    bordered={false}
                                    className="shadow-sm"
                                >
                                    <Paragraph type="secondary" style={{ fontSize: "13px" }}>
                                        Set the default currency, financial year, and timezone for reports and receipts.
                                    </Paragraph>
                                    <Row gutter={[16, 0]}>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="default_currency" label="Default Currency" style={formItemStyle}>
                                                <Select
                                                    options={[
                                                        { label: "₹ INR (Indian Rupee)", value: "INR" },
                                                        { label: "$ USD (US Dollar)", value: "USD" },
                                                        { label: "€ EUR (Euro)", value: "EUR" },
                                                        { label: "£ GBP (British Pound)", value: "GBP" }
                                                    ]}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="financial_year_start" label="Financial Year Starts" style={formItemStyle}>
                                                <Select placeholder="Month" options={financialYearOptions} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="timezone" label="Timezone" style={formItemStyle}>
                                                <Select
                                                    showSearch
                                                    options={[
                                                        { label: "Asia/Kolkata (IST)", value: "Asia/Kolkata" },
                                                        { label: "America/New_York (EST)", value: "America/New_York" },
                                                        { label: "Europe/London (GMT)", value: "Europe/London" },
                                                        { label: "Asia/Dubai (GST)", value: "Asia/Dubai" }
                                                    ]}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>

                            </div>
                        </Col>

                        {/* RIGHT COLUMN */}
                        <Col xs={24} lg={8}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                                {/* Legal / Tax Info */}
                                <Card
                                    title={<span><SettingOutlined /> Legal & Tax Info</span>}
                                    bordered={false}
                                    className="shadow-sm"
                                >
                                    <Paragraph type="secondary" style={{ fontSize: "12px", marginBottom: "16px" }}>
                                        Registration and tax exemption details used on official receipts and certificates.
                                    </Paragraph>
                                    <Form.Item name="pan_number" label="PAN Number" style={formItemStyle}>
                                        <Input placeholder="AAACT1234C" />
                                    </Form.Item>
                                    <Form.Item name="registration_number" label="Registration Number" style={formItemStyle}>
                                        <Input placeholder="E/12345/Ahmedabad" />
                                    </Form.Item>
                                    <Form.Item name="section_80g_number" label="80G Certificate Number" style={formItemStyle}>
                                        <Input placeholder="AAACT1234CF2021901" />
                                    </Form.Item>
                                </Card>

                                {/* Branding */}
                                <Card
                                    title={<span><PictureOutlined /> Branding</span>}
                                    bordered={false}
                                    className="shadow-sm"
                                >
                                    <Paragraph type="secondary" style={{ fontSize: "12px", marginBottom: "16px" }}>
                                        Customize the look and feel for this organization.
                                    </Paragraph>
                                    <Form.Item name="primary_color" label="Primary Brand Color" style={formItemStyle}>
                                        <Input placeholder="#18181b" />
                                    </Form.Item>
                                    <Form.Item name="enable_dark_mode" label="Enable Dark Mode" valuePropName="checked" style={formItemStyle}>
                                        <Switch checkedChildren="On" unCheckedChildren="Off" />
                                    </Form.Item>
                                </Card>

                            </div>
                        </Col>
                    </Row>

                    <div style={{ marginTop: "24px" }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            loading={creating || updating}
                            style={{ height: "38px", borderRadius: "6px" }}
                        >
                            Save Settings
                        </Button>
                    </div>
                </Form>
            )}
        </ViewContainer>
    );
};

export default GeneralSettingsForm;
