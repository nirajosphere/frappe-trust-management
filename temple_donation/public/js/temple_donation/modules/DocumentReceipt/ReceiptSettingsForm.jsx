import React, { useState, useEffect } from "react";
import { 
    Form, Input, Button, Card, Row, Col, Select, Checkbox, 
    Typography, Space, Alert, message, Divider 
} from "antd";
import { 
    SettingOutlined, SaveOutlined, ArrowLeftOutlined, 
    SafetyCertificateOutlined, FileProtectOutlined, LoadingOutlined, PlusOutlined 
} from "@ant-design/icons";
import { 
    useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDocList 
} from "../../hooks/useFrappe";
import AddPageHeader from "../../components/common/AddPageHeader";
import PageLoader from "../../components/common/PageLoader";
import ViewContainer from "../../components/common/ViewContainer";

const { Text, Title, Paragraph } = Typography;

const ReceiptSettingsForm = ({ onBack }) => {
    const [form] = Form.useForm();
    const [selectedTemple, setSelectedTemple] = useState(null);
    const [settingsDocName, setSettingsDocName] = useState(null);
    const [loadingSettings, setLoadingSettings] = useState(false);

    // --- API Hooks ---
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data: temples, loading: loadingTemples } = useFrappeGetDocList("Temple", { fields: ["name", "temple_name"], limit: 1000 });
    const { data: templates, loading: loadingTemplates } = useFrappeGetDocList("Document Template", { fields: ["name", "template_name", "template_type", "temple"], limit: 1000 });

    // Fetch existing settings when a temple is selected
    useEffect(() => {
        if (!selectedTemple || typeof frappe === "undefined") {
            setSettingsDocName(null);
            form.resetFields(["temple"]);
            return;
        }

        setLoadingSettings(true);
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Receipt Settings",
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
                    // Set defaults
                    form.setFieldsValue({
                        receipt_prefix: "REC",
                        donation_prefix: "DON",
                        room_prefix: "ROM",
                        inventory_prefix: "INV",
                        expense_prefix: "EXP",
                        enable_qr_code: 1,
                        enable_digital_signature: 0,
                        default_donation_template: null,
                        default_room_template: null,
                        default_inventory_template: null,
                        default_expense_template: null,
                        terms_and_conditions: ""
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
                // Update
                await updateDoc("Receipt Settings", settingsDocName, values);
                message.success("Receipt settings updated successfully");
            } else {
                // Create
                const res = await createDoc("Receipt Settings", {
                    temple: selectedTemple,
                    ...values
                });
                setSettingsDocName(res.name);
                message.success("Receipt settings saved successfully");
            }
        } catch (err) {
            console.error("Save Settings Error:", err);
        }
    };

    // Filter templates for current temple
    const filteredTemplates = templates?.filter(t => t.temple === selectedTemple) || [];
    
    const getTemplatesOfType = (type) => {
        return filteredTemplates.filter(t => t.template_type === type).map(t => ({
            label: t.template_name,
            value: t.name
        }));
    };

    const formItemStyle = { marginBottom: "16px" };

    return (
        <ViewContainer>
            <AddPageHeader
                onBack={onBack}
                title="Receipt & Print Settings"
                subtitle="Configure print rules, numbering series and default layouts."
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
                <Alert
                    message="Select a Temple / Trust"
                    description="Please select a Temple from the dropdown above to manage its receipt numbering and default document templates."
                    type="info"
                    showIcon
                />
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
                        {/* LEFT COLUMN: numbering and defaults */}
                        <Col xs={24} lg={16}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                
                                {/* Numbering Prefixes */}
                                <Card title={<span><SettingOutlined /> Document Numbering Series</span>} bordered={false} className="shadow-sm">
                                    <Paragraph type="secondary" style={{ fontSize: "13px" }}>
                                        Configure custom short prefixes for generated receipt formats.
                                    </Paragraph>
                                    <Row gutter={[16, 0]}>
                                        <Col xs={24} sm={12} md={8}>
                                            <Form.Item name="donation_prefix" label="Donation Receipt Prefix" style={formItemStyle}>
                                                <Input placeholder="DON" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12} md={8}>
                                            <Form.Item name="room_prefix" label="Room Booking Prefix" style={formItemStyle}>
                                                <Input placeholder="ROM" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12} md={8}>
                                            <Form.Item name="inventory_prefix" label="Inventory Entry Prefix" style={formItemStyle}>
                                                <Input placeholder="INV" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12} md={8}>
                                            <Form.Item name="expense_prefix" label="Expense Voucher Prefix" style={formItemStyle}>
                                                <Input placeholder="EXP" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12} md={8}>
                                            <Form.Item name="receipt_prefix" label="General Receipt Prefix" style={formItemStyle}>
                                                <Input placeholder="REC" />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>

                                {/* Default Layout Mapping */}
                                <Card 
                                    title={<span><SettingOutlined /> Default Layout Templates</span>} 
                                    extra={
                                        <Button 
                                            type="link" 
                                            icon={<PlusOutlined />} 
                                            onClick={() => {
                                                if (typeof frappe !== "undefined") {
                                                    frappe.set_route("temple-donation", "document-templates", "new");
                                                }
                                            }}
                                        >
                                            Create New Template
                                        </Button>
                                    }
                                    bordered={false} 
                                    className="shadow-sm"
                                >
                                    <Paragraph type="secondary" style={{ fontSize: "13px" }}>
                                        Map specific document template layouts as the default print format for each module.
                                    </Paragraph>
                                    <Row gutter={[16, 0]}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="default_donation_template" label="Default Donation Template" style={formItemStyle}>
                                                <Select 
                                                    placeholder="Default Fallback"
                                                    allowClear
                                                    options={getTemplatesOfType("Donation Receipt")} 
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="default_room_template" label="Default Room Template" style={formItemStyle}>
                                                <Select 
                                                    placeholder="Default Fallback"
                                                    allowClear
                                                    options={getTemplatesOfType("Room Receipt")} 
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="default_inventory_template" label="Default Inventory Template" style={formItemStyle}>
                                                <Select 
                                                    placeholder="Default Fallback"
                                                    allowClear
                                                    options={getTemplatesOfType("Inventory Receipt")} 
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="default_expense_template" label="Default Expense Template" style={formItemStyle}>
                                                <Select 
                                                    placeholder="Default Fallback"
                                                    allowClear
                                                    options={getTemplatesOfType("Expense Voucher")} 
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Card>

                                {/* Terms and Conditions */}
                                <Card title={<span><FileProtectOutlined /> Terms, Conditions & Declarations</span>} bordered={false} className="shadow-sm">
                                    <Form.Item name="terms_and_conditions" label="Default Policy Text (displays in footers)" style={{ marginBottom: 0 }}>
                                        <Input.TextArea rows={6} placeholder="e.g. 1. All donations are exempt under section 80G. 2. Please preserve this receipt for tax purposes." />
                                    </Form.Item>
                                </Card>

                            </div>
                        </Col>

                        {/* RIGHT COLUMN: digital security */}
                        <Col xs={24} lg={8}>
                            <Card title={<span><SafetyCertificateOutlined /> Security & Validation</span>} bordered={false} className="shadow-sm">
                                <Form.Item name="enable_qr_code" valuePropName="checked" style={formItemStyle}>
                                    <Checkbox>Enable Verification QR Code</Checkbox>
                                </Form.Item>
                                <Paragraph type="secondary" style={{ fontSize: "12px", marginTop: "-8px", marginBottom: "16px" }}>
                                    When checked, receipts automatically print with an authentic verification link. Anyone can scan it to check authenticity.
                                </Paragraph>
                                
                                <Divider style={{ margin: "16px 0" }} />

                                <Form.Item name="enable_digital_signature" valuePropName="checked" style={formItemStyle}>
                                    <Checkbox>Enable Certified Digital Signature</Checkbox>
                                </Form.Item>
                                <Paragraph type="secondary" style={{ fontSize: "12px", marginTop: "-8px", marginBottom: "16px" }}>
                                    Enforces server-signed checksum embedding on generated PDFs to prevent forgery.
                                </Paragraph>
                            </Card>
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

export default ReceiptSettingsForm;
