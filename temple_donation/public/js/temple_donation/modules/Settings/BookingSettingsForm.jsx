import React, { useState, useEffect } from "react";
import {
    Form, Input, Button, Card, Row, Col, Select, Switch, TimePicker,
    Typography, Divider, message, InputNumber, Checkbox, Spin
} from "antd";
import {
    SettingOutlined, SaveOutlined, CalendarOutlined,
    LoadingOutlined, ClockCircleOutlined, HomeOutlined,
    SafetyCertificateOutlined
} from "@ant-design/icons";
import {
    useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDocList
} from "../../hooks/useFrappe";
import { DOCTYPE_BOOKING_SETTINGS } from "../../config/constants";
import AddPageHeader from "../../components/common/AddPageHeader";
import ViewContainer from "../../components/common/ViewContainer";

const { Text, Title, Paragraph } = Typography;

const BookingSettingsForm = ({ onBack }) => {
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

    // Auto-select first temple when temples list loads
    useEffect(() => {
        if (temples && temples.length > 0 && !selectedTemple) {
            setSelectedTemple(temples[0].name);
        }
    }, [temples]);

    useEffect(() => {
        if (!selectedTemple || typeof frappe === "undefined") return;

        setLoadingSettings(true);
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: DOCTYPE_BOOKING_SETTINGS,
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
                        default_checkin_time: "12:00",
                        default_checkout_time: "11:00",
                        max_advance_booking_days: 30,
                        min_advance_booking_hours: 2,
                        max_stay_days: 15,
                        allow_same_day_booking: 1,
                        auto_confirm_booking: 0,
                        require_id_proof: 1,
                        require_phone_number: 1,
                        allow_group_booking: 1,
                        max_guests_per_booking: 10,
                        cancellation_allowed: 1,
                        free_cancellation_hours: 24,
                        cancellation_charge_percent: 10,
                        allow_extension: 1,
                        auto_checkout_enabled: 0,
                        overbooking_buffer_percent: 0,
                        maintenance_gap_hours: 2,
                        booking_terms: ""
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
                await updateDoc(DOCTYPE_BOOKING_SETTINGS, settingsDocName, values);
                message.success("Booking settings updated successfully");
            } else {
                const res = await createDoc(DOCTYPE_BOOKING_SETTINGS, {
                    temple: selectedTemple,
                    ...values
                });
                setSettingsDocName(res.name);
                message.success("Booking settings saved successfully");
            }
        } catch (err) {
            console.error("Save Booking Settings Error:", err);
        }
    };

    if (loadingTemples || loadingSettings) {
        return (
            <ViewContainer>
                <AddPageHeader
                    onBack={onBack}
                    title="Booking Settings"
                    subtitle="Configure check-in/out times, booking rules, and cancellation policies."
                    showBack={true}
                />
                <div style={{ padding: "60px 0", textAlign: "center" }}>
                    <Spin size="large" />
                </div>
            </ViewContainer>
        );
    }

    const formItemStyle = { marginBottom: "16px" };

    return (
        <ViewContainer>
            <AddPageHeader
                onBack={onBack}
                title="Booking Settings"
                subtitle="Configure check-in/out times, booking rules, and cancellation policies."
                showBack={true}
            />

            {temples && temples.length > 1 && (
                <Card bordered={false} style={{ marginBottom: "20px", borderRadius: "8px" }} className="shadow-sm">
                    <Row gutter={[16, 0]}>
                        <Col xs={24} md={12}>
                            <Form.Item label="Organization / Trust" style={{ marginBottom: 0 }}>
                                <Select
                                    showSearch
                                    placeholder="Choose Temple"
                                    optionFilterProp="children"
                                    value={selectedTemple}
                                    onChange={(val) => setSelectedTemple(val)}
                                    options={temples.map(t => ({ label: t.temple_name, value: t.name }))}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            )}

            {!selectedTemple ? (
                <Card bordered={false} className="shadow-sm">
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                        <CalendarOutlined style={{ fontSize: "48px", color: "#d4d4d8", marginBottom: "16px" }} />
                        <Title level={5} type="secondary" style={{ margin: 0 }}>No organization found</Title>
                        <Text type="secondary" style={{ fontSize: "13px" }}>
                            Please add a Temple / Trust first from the Trust Management section.
                        </Text>
                    </div>
                </Card>
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

                                {/* Check-In / Check-Out Times */}
                                <Card
                                    title={<span><ClockCircleOutlined /> Check-In & Check-Out</span>}
                                    bordered={false}
                                    className="shadow-sm"
                                >
                                    <Paragraph type="secondary" style={{ fontSize: "13px" }}>
                                        Set the default check-in and check-out timing for room bookings.
                                    </Paragraph>
                                    <Row gutter={[16, 0]}>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="default_checkin_time" label="Default Check-In Time" style={formItemStyle}>
                                                <Input placeholder="12:00" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="default_checkout_time" label="Default Check-Out Time" style={formItemStyle}>
                                                <Input placeholder="11:00" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="maintenance_gap_hours" label="Cleaning Gap (Hours)" style={formItemStyle}>
                                                <InputNumber min={0} max={12} style={{ width: "100%" }} placeholder="2" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>

                                {/* Booking Rules */}
                                <Card
                                    title={<span><CalendarOutlined /> Booking Rules</span>}
                                    bordered={false}
                                    className="shadow-sm"
                                >
                                    <Paragraph type="secondary" style={{ fontSize: "13px" }}>
                                        Control how far in advance guests can book, maximum stay duration, and more.
                                    </Paragraph>
                                    <Row gutter={[16, 0]}>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="max_advance_booking_days" label="Max Advance Booking (Days)" style={formItemStyle}>
                                                <InputNumber min={1} max={365} style={{ width: "100%" }} placeholder="30" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="min_advance_booking_hours" label="Min Advance Booking (Hours)" style={formItemStyle}>
                                                <InputNumber min={0} max={72} style={{ width: "100%" }} placeholder="2" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="max_stay_days" label="Maximum Stay (Days)" style={formItemStyle}>
                                                <InputNumber min={1} max={90} style={{ width: "100%" }} placeholder="15" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="max_guests_per_booking" label="Max Guests Per Booking" style={formItemStyle}>
                                                <InputNumber min={1} max={50} style={{ width: "100%" }} placeholder="10" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="overbooking_buffer_percent" label="Overbooking Buffer (%)" style={formItemStyle}>
                                                <InputNumber min={0} max={30} style={{ width: "100%" }} placeholder="0" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Divider style={{ margin: "8px 0 16px" }} />
                                    <Row gutter={[16, 0]}>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="allow_same_day_booking" valuePropName="checked" style={formItemStyle}>
                                                <Checkbox>Allow Same-Day Booking</Checkbox>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="auto_confirm_booking" valuePropName="checked" style={formItemStyle}>
                                                <Checkbox>Auto-Confirm Bookings</Checkbox>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="allow_group_booking" valuePropName="checked" style={formItemStyle}>
                                                <Checkbox>Allow Group Booking</Checkbox>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="allow_extension" valuePropName="checked" style={formItemStyle}>
                                                <Checkbox>Allow Stay Extension</Checkbox>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="auto_checkout_enabled" valuePropName="checked" style={formItemStyle}>
                                                <Checkbox>Auto Checkout at End</Checkbox>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>

                                {/* Cancellation Policy */}
                                <Card
                                    title={<span><SafetyCertificateOutlined /> Cancellation Policy</span>}
                                    bordered={false}
                                    className="shadow-sm"
                                >
                                    <Paragraph type="secondary" style={{ fontSize: "13px" }}>
                                        Define the rules for cancellation charges and free cancellation window.
                                    </Paragraph>
                                    <Row gutter={[16, 0]}>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="cancellation_allowed" valuePropName="checked" style={formItemStyle}>
                                                <Checkbox>Allow Cancellation</Checkbox>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="free_cancellation_hours" label="Free Cancellation Within (Hours)" style={formItemStyle}>
                                                <InputNumber min={0} max={168} style={{ width: "100%" }} placeholder="24" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item name="cancellation_charge_percent" label="Cancellation Charge (%)" style={formItemStyle}>
                                                <InputNumber min={0} max={100} style={{ width: "100%" }} placeholder="10" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>

                            </div>
                        </Col>

                        {/* RIGHT COLUMN */}
                        <Col xs={24} lg={8}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                                {/* Guest Requirements */}
                                <Card
                                    title={<span><HomeOutlined /> Guest Requirements</span>}
                                    bordered={false}
                                    className="shadow-sm"
                                >
                                    <Paragraph type="secondary" style={{ fontSize: "12px", marginBottom: "16px" }}>
                                        Mandatory information required from guests during booking.
                                    </Paragraph>
                                    <Form.Item name="require_id_proof" valuePropName="checked" style={formItemStyle}>
                                        <Checkbox>Require ID Proof</Checkbox>
                                    </Form.Item>
                                    <Paragraph type="secondary" style={{ fontSize: "12px", marginTop: "-8px", marginBottom: "16px" }}>
                                        Guests must provide Aadhaar, PAN, or Government ID at check-in.
                                    </Paragraph>

                                    <Divider style={{ margin: "8px 0 16px" }} />

                                    <Form.Item name="require_phone_number" valuePropName="checked" style={formItemStyle}>
                                        <Checkbox>Require Phone Number</Checkbox>
                                    </Form.Item>
                                    <Paragraph type="secondary" style={{ fontSize: "12px", marginTop: "-8px", marginBottom: "8px" }}>
                                        Phone number will be mandatory during booking for contact purposes.
                                    </Paragraph>
                                </Card>

                                {/* Booking Terms */}
                                <Card
                                    title={<span><SettingOutlined /> Booking Terms & Conditions</span>}
                                    bordered={false}
                                    className="shadow-sm"
                                >
                                    <Form.Item name="booking_terms" label="Terms Text (shown on booking confirmation)" style={{ marginBottom: 0 }}>
                                        <Input.TextArea
                                            rows={6}
                                            placeholder="e.g. 1. Check-in after 12:00 PM only. 2. No smoking in rooms. 3. Guests must vacate by check-out time."
                                        />
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
                            Save Booking Settings
                        </Button>
                    </div>
                </Form>
            )}
        </ViewContainer>
    );
};

export default BookingSettingsForm;
