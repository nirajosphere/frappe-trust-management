import React, { useState, useEffect } from "react";
import { 
    Form, Input, Button, Alert, Select, Row, Col, Card, 
    Checkbox, Space, Tabs, List, Tooltip, Typography, Divider, Badge 
} from "antd";
import { 
    SaveOutlined, ArrowLeftOutlined, CopyOutlined, InfoCircleOutlined,
    EditOutlined, EyeOutlined, LayoutOutlined
} from "@ant-design/icons";
import { 
    useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDoc, useFrappeGetDocList 
} from "../../hooks/useFrappe";
import { DOCTYPE_DOCUMENT_TEMPLATE } from "../../config/constants";
import AddPageHeader from "../../components/common/AddPageHeader";
import PageLoader from "../../components/common/PageLoader";
import FormFooter from "../../components/common/FormFooter";
import ViewContainer from "../../components/common/ViewContainer";

const { Text, Title, Paragraph } = Typography;

const sampleData = {
    temple_name: "Sri Venkateswara Swamy Temple",
    trust_name: "Tirumala Tirupati Devasthanams",
    address: "Tirumala Hill",
    city: "Tirupati",
    state: "Andhra Pradesh",
    country: "India",
    phone: "+91 98765 43210",
    email: "contact@templetrust.org",
    website: "www.templetrust.org",
    receipt_number: "DON-2026-0048",
    receipt_date: "02 Jul 2026",
    created_by: "admin@temple.org",
    cashier: "Shailesh Kumar",
    donor_name: "Rajesh Kumar Sharma",
    mobile: "9876543210",
    donation_type: "Special Abhishekam Prasadam",
    amount: "1008.00",
    payment_mode: "UPI / PhonePe",
    notes: "Special prayers for health and prosperity",
    guest_name: "Rajesh Kumar Sharma",
    room_number: "A-102",
    room_type: "AC Double Suite",
    building: "Nandanam Guest House",
    check_in: "02-07-2026 10:00 AM",
    check_out: "04-07-2026 12:00 PM",
    days: "2 Days",
    entry_number: "STK-IN-2026-0012",
    entry_type: "Stock In",
    item_name: "Pure Cow Ghee",
    quantity: "25",
    unit: "Kilograms",
    rate: "650.00",
    total: "16250.00",
    reference: "PO-GHEE-921",
    qr_code: `<div style="border: 2px dashed #a1a1aa; width: 100px; height: 100px; padding: 5px; margin: 10px auto; background:#f4f4f5; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:bold; color:#71717a;">SAMPLE QR</div>`,
    logo_tag: `<div style="border: 1px dashed #a1a1aa; width: 70px; height: 70px; background:#e4e4e7; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:bold; color:#71717a; border-radius:4px;">LOGO</div>`
};

const variablesList = [
	{ name: "{{temple_name}}", desc: "Name of the Temple", cat: "Temple" },
	{ name: "{{trust_name}}", desc: "Name of the Trust", cat: "Temple" },
	{ name: "{{address}}", desc: "Temple Address", cat: "Temple" },
	{ name: "{{city}}", desc: "Temple City", cat: "Temple" },
	{ name: "{{state}}", desc: "Temple State", cat: "Temple" },
	{ name: "{{phone}}", desc: "Contact Number", cat: "Temple" },
	{ name: "{{email}}", desc: "Email Address", cat: "Temple" },
	{ name: "{{website}}", desc: "Website URL", cat: "Temple" },
	{ name: "{{receipt_number}}", desc: "Unique Receipt ID", cat: "Common" },
	{ name: "{{receipt_date}}", desc: "Posting/Creation Date", cat: "Common" },
	{ name: "{{cashier}}", desc: "Cashier Name", cat: "Common" },
	{ name: "{{qr_code}}", desc: "QR Code verification image tag", cat: "Common" },
	{ name: "{{donor_name}}", desc: "Donor Name", cat: "Donation" },
	{ name: "{{mobile}}", desc: "Donor Contact No", cat: "Donation" },
	{ name: "{{donation_type}}", desc: "Donation category/items", cat: "Donation" },
	{ name: "{{amount}}", desc: "Receipt Amount (numeric)", cat: "Donation / Room" },
	{ name: "{{payment_mode}}", desc: "Mode of Payment", cat: "Donation / Room" },
	{ name: "{{guest_name}}", desc: "Room Guest Name", cat: "Room" },
	{ name: "{{room_number}}", desc: "Assigned Room Number", cat: "Room" },
	{ name: "{{room_type}}", desc: "Room Category", cat: "Room" },
	{ name: "{{building}}", desc: "Guest House Building", cat: "Room" },
	{ name: "{{check_in}}", desc: "Check-in Date & Time", cat: "Room" },
	{ name: "{{check_out}}", desc: "Check-out Date & Time", cat: "Room" },
	{ name: "{{days}}", desc: "Total Number of Days", cat: "Room" },
	{ name: "{{entry_number}}", desc: "Stock Entry Doc ID", cat: "Inventory" },
	{ name: "{{entry_type}}", desc: "Stock In/Out/Adjustment", cat: "Inventory" },
	{ name: "{{item_name}}", desc: "First item name", cat: "Inventory" },
	{ name: "{{quantity}}", desc: "Total quantity of entry", cat: "Inventory" },
	{ name: "{{unit}}", desc: "Unit of measurement", cat: "Inventory" },
	{ name: "{{rate}}", desc: "Valuation/Rate per unit", cat: "Inventory" },
	{ name: "{{total}}", desc: "Inventory Entry Value", cat: "Inventory" },
	{ name: "{{reference}}", desc: "Purchase order/invoice reference", cat: "Inventory" }
];

const DocumentTemplateForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();
    
    // --- API Hooks ---
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data: temples, loading: loadingTemples } = useFrappeGetDocList("Temple", { fields: ["name", "temple_name"], limit: 1000 });
    const { data, loading, error } = useFrappeGetDoc(DOCTYPE_DOCUMENT_TEMPLATE, id);

    // Live HTML state for rendering inside the sandbox iframe
    const [headerHtml, setHeaderHtml] = useState("");
    const [bodyHtml, setBodyHtml] = useState("");
    const [footerHtml, setFooterHtml] = useState("");
    const [primaryColor, setPrimaryColor] = useState("#18181b");
    const [secondaryColor, setSecondaryColor] = useState("#71717a");
    const [fontFamily, setFontFamily] = useState("Inter");
    const [margins, setMargins] = useState("15px");
    const [paperSize, setPaperSize] = useState("A4");
    const [orientation, setOrientation] = useState("Portrait");

    useEffect(() => {
        if (isEdit && data) {
            form.setFieldsValue(data);
            setHeaderHtml(data.header_html || "");
            setBodyHtml(data.body_html || "");
            setFooterHtml(data.footer_html || "");
            setPrimaryColor(data.primary_color || "#18181b");
            setSecondaryColor(data.secondary_color || "#71717a");
            setFontFamily(data.font_family || "Inter");
            setMargins(data.margins || "15px");
            setPaperSize(data.paper_size || "A4");
            setOrientation(data.print_orientation || "Portrait");
        } else {
            const defaultHeader = `
<div style="display: flex; align-items: center; border-bottom: 2px solid {{primary_color}}; padding-bottom: 12px; margin-bottom: 15px;">
    {% if logo_tag %}
    <div style="flex-shrink: 0; margin-right: 18px;">
        {{logo_tag}}
    </div>
    {% endif %}
    <div style="flex-grow: 1;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: {{primary_color}}; line-height: 1.2;">{{temple_name}}</h1>
        {% if trust_name and trust_name != temple_name %}
        <p style="margin: 2px 0 0 0; font-size: 13px; font-weight: 600; color: {{secondary_color}}; text-transform: uppercase; letter-spacing: 0.5px;">{{trust_name}}</p>
        {% endif %}
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #4b5563; line-height: 1.4;">{{address}}, {{city}}, {{state}}</p>
        <p style="margin: 2px 0 0 0; font-size: 11px; color: #6b7280;">Phone: {{phone}} | Email: {{email}}</p>
    </div>
</div>
`;
            const defaultBody = `
<div style="margin-top: 15px;">
    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid {{primary_color}}; padding-bottom: 8px;">
        <span style="font-weight: bold; font-size: 16px;">DONATION RECEIPT</span>
        <span style="font-weight: bold;">No: {{receipt_number}}</span>
    </div>
    
    <div style="margin-top: 15px; font-size: 14px; line-height: 1.6;">
        <p>Received with thanks from <strong>{{donor_name}}</strong> (Mob: {{mobile}})</p>
        <p>A sum of <strong>Rs. {{amount}}</strong> (Rupees One Thousand and Eight Only) by <strong>{{payment_mode}}</strong></p>
        <p>Towards: <strong>{{donation_type}}</strong></p>
        {% if notes %}
        <p style="font-style: italic; color: {{secondary_color}};">Note: {{notes}}</p>
        {% endif %}
    </div>

    <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
            {{qr_code}}
        </div>
        <div style="text-align: center; width: 150px; border-top: 1px solid #c0c0c0; padding-top: 5px; font-size: 13px;">
            Authorized Signatory
        </div>
    </div>
</div>
`;
            const defaultFooter = `
<div style="text-align: center; font-size: 11px; color: {{secondary_color}}; padding-top: 5px;">
    <p style="margin: 0;">Thank you for your generous contribution. May the divine blessings be with you always.</p>
</div>
`;
            form.setFieldsValue({
                paper_size: "A4",
                print_orientation: "Portrait",
                font_family: "Inter",
                margins: "15px",
                primary_color: "#18181b",
                secondary_color: "#71717a",
                status: "Active",
                header_html: defaultHeader,
                body_html: defaultBody,
                footer_html: defaultFooter
            });
            setHeaderHtml(defaultHeader);
            setBodyHtml(defaultBody);
            setFooterHtml(defaultFooter);
        }
    }, [isEdit, data, form]);

    const handleFormValuesChange = (changed, all) => {
        if (changed.header_html !== undefined) setHeaderHtml(changed.header_html);
        if (changed.body_html !== undefined) setBodyHtml(changed.body_html);
        if (changed.footer_html !== undefined) setFooterHtml(changed.footer_html);
        if (changed.primary_color !== undefined) setPrimaryColor(changed.primary_color);
        if (changed.secondary_color !== undefined) setSecondaryColor(changed.secondary_color);
        if (changed.font_family !== undefined) setFontFamily(changed.font_family);
        if (changed.margins !== undefined) setMargins(changed.margins);
        if (changed.paper_size !== undefined) setPaperSize(changed.paper_size);
        if (changed.print_orientation !== undefined) setOrientation(changed.print_orientation);
    };

    const handleSave = async (values) => {
        try {
            if (isEdit) {
                await updateDoc(DOCTYPE_DOCUMENT_TEMPLATE, id, values);
            } else {
                await createDoc(DOCTYPE_DOCUMENT_TEMPLATE, values);
            }
            if (onBack) onBack();
        } catch (err) {
            console.error("Save error:", err);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        message.success(`Copied placeholder: ${text}`);
    };

    // Calculate simulated preview sandbox HTML
    const getPreviewHtml = () => {
        let h = headerHtml;
        let b = bodyHtml;
        let f = footerHtml;

        // Apply primary & secondary colors to placeholder variables in CSS/HTML
        h = h.replace(/{{primary_color}}/g, primaryColor).replace(/{{secondary_color}}/g, secondaryColor);
        b = b.replace(/{{primary_color}}/g, primaryColor).replace(/{{secondary_color}}/g, secondaryColor);
        f = f.replace(/{{primary_color}}/g, primaryColor).replace(/{{secondary_color}}/g, secondaryColor);

        // Replace custom sample data
        Object.keys(sampleData).forEach(key => {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
            h = h.replace(regex, sampleData[key]);
            b = b.replace(regex, sampleData[key]);
            f = f.replace(regex, sampleData[key]);
        });

        // Strip any raw Jinja code tags for safe frontend-only preview rendering
        const cleanHtml = (htmlStr) => {
            return htmlStr
                .replace(/{%.*?%}/g, "")
                .replace(/{{\s*.*?\s*}}/g, "");
        };

        const widthStyles = {
            "A4": "100%",
            "A5": "70%",
            "Thermal 80mm": "320px",
            "Thermal 58mm": "240px"
        };

        const simulatedWidth = widthStyles[paperSize] || "100%";

        return `
            <html>
            <head>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=${fontFamily}:wght@300;400;600;700&display=swap');
                    body {
                        font-family: '${fontFamily}', sans-serif;
                        margin: 0;
                        padding: ${margins};
                        background-color: #f4f4f5;
                        display: flex;
                        justify-content: center;
                        align-items: flex-start;
                        min-height: 100vh;
                        box-sizing: border-box;
                    }
                    .preview-card {
                        background: #ffffff;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.08);
                        border-radius: 4px;
                        width: ${simulatedWidth};
                        min-height: ${orientation === "Landscape" ? "400px" : "600px"};
                        padding: 20px;
                        box-sizing: border-box;
                        border: 1px solid #e4e4e7;
                    }
                    .receipt-header {
                        margin-bottom: 20px;
                        border-bottom: 2px solid ${primaryColor};
                        padding-bottom: 10px;
                    }
                    .receipt-body {
                        margin-bottom: 20px;
                        min-height: 150px;
                    }
                    .receipt-footer {
                        margin-top: 20px;
                        border-top: 1px solid #e5e7eb;
                        padding-top: 10px;
                        font-size: 12px;
                        color: ${secondaryColor};
                        text-align: center;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 15px;
                    }
                    th {
                        background-color: ${primaryColor};
                        color: #ffffff;
                        text-align: left;
                        padding: 8px;
                        font-size: 14px;
                    }
                    td {
                        padding: 8px;
                        border-bottom: 1px solid #e5e7eb;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="preview-card">
                    <div class="receipt-header">${cleanHtml(h)}</div>
                    <div class="receipt-body">${cleanHtml(b)}</div>
                    <div class="receipt-footer">${cleanHtml(f)}</div>
                </div>
            </body>
            </html>
        `;
    };

    if (loading) return <PageLoader />;
    if (error) return <Alert message="Error loading template" type="error" action={<Button onClick={onBack}>Back</Button>} />;

    const formItemStyle = { marginBottom: "12px" };

    return (
        <ViewContainer>
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Edit Template" : "New Template"}
                subtitle="Template Builder"
                showBack={true}
            />

            <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleSave} 
                onValuesChange={handleFormValuesChange}
                requiredMark={false} 
                size="middle"
            >
                <Row gutter={[24, 0]}>
                    {/* ================= LEFT COLUMN: SETTINGS & HTML EDITOR ================= */}
                    <Col xs={24} xl={14}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            
                            {/* Card 1: Basic Config */}
                            <Card title={<span><LayoutOutlined /> Basic Settings</span>} bordered={false} className="shadow-sm">
                                <Row gutter={[16, 0]}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="template_name" label="Template Name" style={formItemStyle} rules={[{ required: true, message: "Required" }]}>
                                            <Input placeholder="e.g. Donation Standard A4" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="temple" label="Temple / Trust" style={formItemStyle} rules={[{ required: true, message: "Required" }]}>
                                            <Select 
                                                showSearch 
                                                placeholder="Select Temple"
                                                loading={loadingTemples}
                                                options={temples?.map(t => ({ label: t.temple_name, value: t.name })) || []}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="template_type" label="Template Type" style={formItemStyle} rules={[{ required: true, message: "Required" }]}>
                                            <Select options={[
                                                { label: "Donation Receipt", value: "Donation Receipt" },
                                                { label: "Room Receipt", value: "Room Receipt" },
                                                { label: "Inventory Receipt", value: "Inventory Receipt" },
                                                { label: "Expense Voucher", value: "Expense Voucher" },
                                                { label: "Purchase Receipt", value: "Purchase Receipt" },
                                                { label: "Visitor Pass", value: "Visitor Pass" },
                                                { label: "Donation Certificate", value: "Donation Certificate" },
                                                { label: "Custom", value: "Custom" }
                                            ]} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="status" label="Status" style={formItemStyle}>
                                            <Select options={[
                                                { label: "Active", value: "Active" },
                                                { label: "Inactive", value: "Inactive" }
                                            ]} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Form.Item name="default_template" valuePropName="checked" style={{ marginBottom: 0 }}>
                                    <Checkbox>Set as Default template for this type</Checkbox>
                                </Form.Item>
                            </Card>

                            {/* Card 2: Layout Options */}
                            <Card title={<span><LayoutOutlined /> Styling & Dimensions</span>} bordered={false} className="shadow-sm">
                                <Row gutter={[16, 0]}>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="paper_size" label="Paper Size" style={formItemStyle}>
                                            <Select options={[
                                                { label: "A4 Page", value: "A4" },
                                                { label: "A5 Page", value: "A5" },
                                                { label: "Thermal 80mm", value: "Thermal 80mm" },
                                                { label: "Thermal 58mm", value: "Thermal 58mm" }
                                            ]} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="print_orientation" label="Orientation" style={formItemStyle}>
                                            <Select options={[
                                                { label: "Portrait", value: "Portrait" },
                                                { label: "Landscape", value: "Landscape" }
                                            ]} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="font_family" label="Font Family" style={formItemStyle}>
                                            <Select options={[
                                                { label: "Inter (Premium Clean)", value: "Inter" },
                                                { label: "Roboto (Tech Crisp)", value: "Roboto" },
                                                { label: "Outfit (Modern Slab)", value: "Outfit" },
                                                { label: "Open Sans (Standard)", value: "Open Sans" },
                                                { label: "Monospace (Legacy)", value: "Monospace" }
                                            ]} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="margins" label="Margins (CSS format)" style={formItemStyle}>
                                            <Input placeholder="e.g. 15px or 10px 15px" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={12} sm={8}>
                                        <Form.Item name="primary_color" label="Primary Color (hex)" style={formItemStyle}>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <Input placeholder="#18181b" style={{ flex: 1 }} />
                                                <input type="color" value={primaryColor} onChange={(e) => {
                                                    setPrimaryColor(e.target.value);
                                                    form.setFieldsValue({ primary_color: e.target.value });
                                                }} style={{ width: "38px", height: "38px", border: "1px solid #e4e4e7", borderRadius: "6px", cursor: "pointer", padding: "2px" }} />
                                            </div>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={12} sm={8}>
                                        <Form.Item name="secondary_color" label="Secondary Color (hex)" style={formItemStyle}>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <Input placeholder="#71717a" style={{ flex: 1 }} />
                                                <input type="color" value={secondaryColor} onChange={(e) => {
                                                    setSecondaryColor(e.target.value);
                                                    form.setFieldsValue({ secondary_color: e.target.value });
                                                }} style={{ width: "38px", height: "38px", border: "1px solid #e4e4e7", borderRadius: "6px", cursor: "pointer", padding: "2px" }} />
                                            </div>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>

                            {/* Card 3: HTML Editor Tabs */}
                            <Card title={<span><EditOutlined /> HTML Template Editor</span>} bordered={false} className="shadow-sm">
                                <Tabs defaultActiveKey="body" items={[
                                    {
                                        key: "header",
                                        label: "Header HTML",
                                        forceRender: true,
                                        children: (
                                            <Form.Item name="header_html" style={{ marginBottom: 0 }}>
                                                <Input.TextArea 
                                                    rows={10} 
                                                    placeholder="HTML/CSS header section..." 
                                                    style={{ fontFamily: "monospace", fontSize: "13px", lineHeight: "1.5", background: "#1e1e1e", color: "#d4d4d4" }}
                                                />
                                            </Form.Item>
                                        )
                                    },
                                    {
                                        key: "body",
                                        label: "Body HTML",
                                        forceRender: true,
                                        children: (
                                            <Form.Item name="body_html" style={{ marginBottom: 0 }}>
                                                <Input.TextArea 
                                                    rows={14} 
                                                    placeholder="HTML body section with placeholders..." 
                                                    style={{ fontFamily: "monospace", fontSize: "13px", lineHeight: "1.5", background: "#1e1e1e", color: "#d4d4d4" }}
                                                />
                                            </Form.Item>
                                        )
                                    },
                                    {
                                        key: "footer",
                                        label: "Footer HTML",
                                        forceRender: true,
                                        children: (
                                            <Form.Item name="footer_html" style={{ marginBottom: 0 }}>
                                                <Input.TextArea 
                                                    rows={8} 
                                                    placeholder="HTML footer section..." 
                                                    style={{ fontFamily: "monospace", fontSize: "13px", lineHeight: "1.5", background: "#1e1e1e", color: "#d4d4d4" }}
                                                />
                                            </Form.Item>
                                        )
                                    }
                                ]} />
                            </Card>

                        </div>
                    </Col>

                    {/* ================= RIGHT COLUMN: LIVE PREVIEW & VARIABLE GUIDE ================= */}
                    <Col xs={24} xl={10}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "sticky", top: "84px" }}>
                            
                            {/* Sandbox Sandbox Preview */}
                            <Card 
                                title={<span><EyeOutlined /> Live Sandbox Preview</span>} 
                                bordered={false} 
                                className="shadow-sm"
                                bodyStyle={{ padding: "12px", background: "#e4e4e7", borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px" }}
                            >
                                <div style={{ border: "1px solid #d4d4d8", borderRadius: "6px", background: "#f4f4f5", overflow: "hidden" }}>
                                    <iframe 
                                        title="Live Output Sandbox"
                                        srcDoc={getPreviewHtml()} 
                                        style={{ 
                                            width: "100%", 
                                            height: "460px", 
                                            border: "none" 
                                        }} 
                                    />
                                </div>
                                <div style={{ marginTop: "8px", textAlign: "center" }}>
                                    <Text type="secondary" style={{ fontSize: "12px" }}>
                                        <InfoCircleOutlined /> Live preview replaces standard template tags with mock data dynamically.
                                    </Text>
                                </div>
                            </Card>

                            {/* Click to Copy Variables Tray */}
                            <Card 
                                title={<span><CopyOutlined /> Dynamic Variable Assistant</span>} 
                                bordered={false} 
                                className="shadow-sm"
                                bodyStyle={{ padding: "0 16px 16px" }}
                            >
                                <div style={{ height: "230px", overflowY: "auto", marginTop: "8px" }}>
                                    <List
                                        size="small"
                                        dataSource={variablesList}
                                        renderItem={item => (
                                            <List.Item 
                                                actions={[
                                                    <Tooltip title="Copy placeholder">
                                                        <Button 
                                                            type="text" 
                                                            size="small" 
                                                            icon={<CopyOutlined />} 
                                                            onClick={() => copyToClipboard(item.name)} 
                                                        />
                                                    </Tooltip>
                                                ]}
                                                style={{ padding: "6px 0" }}
                                            >
                                                <List.Item.Meta
                                                    title={
                                                        <Space>
                                                            <Text code style={{ cursor: "pointer", fontSize: "12px" }} onClick={() => copyToClipboard(item.name)}>
                                                                {item.name}
                                                            </Text>
                                                            <Badge count={item.cat} style={{ backgroundColor: "#71717a", fontSize: "10px" }} />
                                                        </Space>
                                                    }
                                                    description={<span style={{ fontSize: "11px" }}>{item.desc}</span>}
                                                />
                                            </List.Item>
                                        )}
                                    />
                                </div>
                            </Card>

                        </div>
                    </Col>
                </Row>

                <div style={{ marginTop: "24px" }}>
                    <FormFooter
                        onCancel={onBack}
                        loading={creating || updating}
                        isEdit={isEdit}
                    />
                </div>
            </Form>
        </ViewContainer>
    );
};

export default DocumentTemplateForm;
