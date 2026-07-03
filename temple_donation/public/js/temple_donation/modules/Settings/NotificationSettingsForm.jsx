import React, { useState, useEffect } from "react";
import {
    Form, Input, Button, Card, Row, Col, Select, Switch, Checkbox,
    Typography, Divider, message, InputNumber
} from "antd";
import {
    SettingOutlined, SaveOutlined, BellOutlined,
    LoadingOutlined, MailOutlined, MessageOutlined, MobileOutlined
} from "@ant-design/icons";
import {
    useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDocList
} from "../../hooks/useFrappe";
import { DOCTYPE_NOTIFICATION_SETTINGS } from "../../config/constants";
import AddPageHeader from "../../components/common/AddPageHeader";
import ViewContainer from "../../components/common/ViewContainer";

const { Text, Title, Paragraph } = Typography;

const NotificationSettingsForm = ({ onBack }) => {
    const [form] = Form.useForm();
    const [selectedTemple, setSelectedTemple] = useState(null);
    const [settingsDocName, setSettingsDocName] = useState(null);
    const [loadingSettings, setLoadingSettings] = useState(false);

    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data: temples, loading: loadingTemples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        limit: 1000
    });

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
                doctype: DOCTYPE_NOTIFICATION_SETTINGS,
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
                        // Email Notifications
                        enable_email_notifications: 1,
                        email_on_new_donation: 1,
                        email_on_booking_confirmation: 1,
                        email_on_booking_cancellation: 1,
                        email_on_checkout: 0,
                        email_daily_summary: 0,
                        admin_email_recipients: "",

                        // SMS Notifications
                        enable_sms_notifications: 0,
                        sms_on_donation: 0,
                        sms_on_booking: 0,
                        sms_provider: "",
                        sms_api_key: "",
                        sms_sender_id: "",

                        // WhatsApp Notifications
                        enable_whatsapp: 0,
                        whatsapp_on_donation_receipt: 0,
                        whatsapp_on_booking_confirmation: 0,
                        whatsapp_api_key: "",

                        // Inventory Alerts
                        enable_low_stock_alerts: 1,
                        low_stock_threshold: 10,
                        alert_recipients: "",

                        // System Alerts
                        enable_system_alerts: 1,
                        alert_on_failed_import: 1,
                        alert_on_payment_failure: 1
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
                await updateDoc(DOCTYPE_NOTIFICATION_SETTINGS, settingsDocName, values);
                message.success("Notification settings updated successfully");
            } else {
                const res = await createDoc(DOCTYPE_NOTIFICATION_SETTINGS, {
                    temple: selectedTemple,
                    ...values
                });
                setSettingsDocName(res.name);
                message.success("Notification settings saved successfully");
            }
        } catch (err) {
            console.error("Save Notification Settings Error:", err);
        }
    };

    const formItemStyle = { marginBottom: "16px" };

    return (
        <ViewContainer>
            <AddPageHeader
                onBack={onBack}
                title="Notification Settings"
                subtitle="Configure email, SMS, WhatsApp alerts and inventory notifications."
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
                        <BellOutlined style={{ fontSize: "48px", color: "#d4d4d8", marginBottom: "16px" }} />
                        <Title level={5} type="secondary" style={{ margin: 0 }}>Select a Temple / Trust</Title>
                        <Text type="secondary" style={{ fontSize: "13px" }}>
                            Choose from the dropdown above to manage its notification preferences.
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

                                {/* Email Notifications */}
                                <Card
                                    title={<span><MailOutlined /> Email Notifications</span>}
                                    bordered={false}
                                    className="shadow-sm"
                                    extra={
                                        <Form.Item name="enable_email_notifications" valuePropName="checked" style={{ margin: 0 }}>
                                            <Switch size="small" checkedChildren="On" unCheckedChildren="Off" />
                                        </Form.Item>
                                    }
                                >
                                    <Paragraph type="secondary" style={{ fontSize: "13px" }}>
                                        Send email alerts for key events like donations, bookings, and daily summaries.
                                    </Paragraph>
                                    <Row gutter={[16, 0]}>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="email_on_new_donation" valuePropName="checked" style={formItemStyle}>
                                                <Checkbox>New Donation Received</Checkbox>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="email_on_booking_confirmation" valuePropName="checked" style={formItemStyle}>
                                                <Checkbox>Booking Confirmed</Checkbox>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="email_on_booking_cancellation" valuePropName="checked" style={formItemStyle}>
                                                <Checkbox>Booking Cancelled</Checkbox>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="email_on_checkout" valuePropName="checked" style={formItemStyle}>
                                                <Checkbox>Guest Checkout</Checkbox>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="email_daily_summary" valuePropName="checked" style={formItemStyle}>
                                                <Checkbox>Daily Summary Report</Checkbox>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Divider style={{ margin: "8px 0 16px" }} />
                                    <Form.Item name="admin_email_recipients" label="Admin Email Recipients (comma-separated)" style={formItemStyle}>
                                        <Input.TextArea rows={2} placeholder="admin@temple.org, manager@temple.org" />
                                    </Form.Item>
                                </Card>

                                {/* SMS Notifications */}
                                <Card
                                    title={<span><MobileOutlined /> SMS Notifications</span>}
                                    bordered={false}
                                    className="shadow-sm"
                                    extra={
                                        <Form.Item name="enable_sms_notifications" valuePropName="checked" style={{ margin: 0 }}>
                                            <Switch size="small" checkedChildren="On" unCheckedChildren="Off" />
                                        </Form.Item>
                                    }
                                >
                                    <Paragraph type="secondary" style={{ fontSize: "13px" }}>
                                        Send SMS alerts to donors and guests for confirmations and receipts.
                                    </Paragraph>
                                    <Row gutter={[16, 0]}>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="sms_on_donation" valuePropName="checked" style={formItemStyle}>
                                                <Checkbox>Donation Receipt SMS</Checkbox>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="sms_on_booking" valuePropName="checked" style={formItemStyle}>
                                                <Checkbox>Booking Confirmation SMS</Checkbox>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Divider style={{ margin: "8px 0 16px" }} />
                                    <Row gutter={[16, 0]}>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="sms_provider" label="SMS Provider" style={formItemStyle}>
                                                <Select
                                                    placeholder="Select"
                                                    allowClear
                                                    options={[
                                                        { label: "MSG91", value: "MSG91" },
                                                        { label: "Twilio", value: "Twilio" },
                                                        { label: "TextLocal", value: "TextLocal" },
                                                        { label: "Fast2SMS", value: "Fast2SMS" },
                                                        { label: "Custom API", value: "Custom" }
                                                    ]}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="sms_api_key" label="API Key" style={formItemStyle}>
                                                <Input.Password placeholder="••••••••" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="sms_sender_id" label="Sender ID" style={formItemStyle}>
                                                <Input placeholder="TEMPLE" maxLength={6} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>

                                {/* WhatsApp Notifications */}
                                <Card
                                    title={<span><MessageOutlined /> WhatsApp Notifications</span>}
                                    bordered={false}
                                    className="shadow-sm"
                                    extra={
                                        <Form.Item name="enable_whatsapp" valuePropName="checked" style={{ margin: 0 }}>
                                            <Switch size="small" checkedChildren="On" unCheckedChildren="Off" />
                                        </Form.Item>
                                    }
                                >
                                    <Paragraph type="secondary" style={{ fontSize: "13px" }}>
                                        Send WhatsApp messages for donation receipts and booking confirmations.
                                    </Paragraph>
                                    <Row gutter={[16, 0]}>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="whatsapp_on_donation_receipt" valuePropName="checked" style={formItemStyle}>
                                                <Checkbox>Donation Receipt</Checkbox>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="whatsapp_on_booking_confirmation" valuePropName="checked" style={formItemStyle}>
                                                <Checkbox>Booking Confirmation</Checkbox>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Divider style={{ margin: "8px 0 16px" }} />
                                    <Form.Item name="whatsapp_api_key" label="WhatsApp Business API Key" style={formItemStyle}>
                                        <Input.Password placeholder="••••••••" />
                                    </Form.Item>
                                </Card>

                            </div>
                        </Col>

                        {/* RIGHT COLUMN */}
                        <Col xs={24} lg={8}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                                {/* Inventory Alerts */}
                                <Card
                                    title={<span><BellOutlined /> Inventory Alerts</span>}
                                    bordered={false}
                                    className="shadow-sm"
                                    extra={
                                        <Form.Item name="enable_low_stock_alerts" valuePropName="checked" style={{ margin: 0 }}>
                                            <Switch size="small" checkedChildren="On" unCheckedChildren="Off" />
                                        </Form.Item>
                                    }
                                >
                                    <Paragraph type="secondary" style={{ fontSize: "12px", marginBottom: "16px" }}>
                                        Get notified when items fall below the minimum stock threshold.
                                    </Paragraph>
                                    <Form.Item name="low_stock_threshold" label="Low Stock Alert Threshold" style={formItemStyle}>
                                        <InputNumber min={1} max={1000} style={{ width: "100%" }} placeholder="10" />
                                    </Form.Item>
                                    <Form.Item name="alert_recipients" label="Alert Recipients (emails)" style={formItemStyle}>
                                        <Input.TextArea rows={2} placeholder="inventory@temple.org" />
                                    </Form.Item>
                                </Card>

                                {/* System Alerts */}
                                <Card
                                    title={<span><SettingOutlined /> System Alerts</span>}
                                    bordered={false}
                                    className="shadow-sm"
                                    extra={
                                        <Form.Item name="enable_system_alerts" valuePropName="checked" style={{ margin: 0 }}>
                                            <Switch size="small" checkedChildren="On" unCheckedChildren="Off" />
                                        </Form.Item>
                                    }
                                >
                                    <Paragraph type="secondary" style={{ fontSize: "12px", marginBottom: "16px" }}>
                                        Get notified about system-level events and failures.
                                    </Paragraph>
                                    <Form.Item name="alert_on_failed_import" valuePropName="checked" style={formItemStyle}>
                                        <Checkbox>Alert on Failed CSV Import</Checkbox>
                                    </Form.Item>
                                    <Form.Item name="alert_on_payment_failure" valuePropName="checked" style={{ marginBottom: 0 }}>
                                        <Checkbox>Alert on Payment Failure</Checkbox>
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
                            Save Notification Settings
                        </Button>
                    </div>
                </Form>
            )}
        </ViewContainer>
    );
};

export default NotificationSettingsForm;
