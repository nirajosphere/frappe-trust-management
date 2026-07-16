import React, { useState, useEffect } from "react";
import {
    Form, Input, Button, Alert, Select, Row, Col, Card,
    Checkbox, Space, Tabs, List, Tooltip, Typography, Divider, Badge, message, Modal
} from "antd";
import {
    SaveOutlined, ArrowLeftOutlined, CopyOutlined, InfoCircleOutlined,
    EditOutlined, EyeOutlined, LayoutOutlined, UndoOutlined
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
import { sampleData, variablesList, presets } from "./templateConfig";
import AiTemplateModal from "./AiTemplateModal";
import DynamicVariableAssistant from "./DynamicVariableAssistant";
import LiveSandboxPreview from "./LiveSandboxPreview";

const templateTypeToPreset = {
    "Donation Receipt": "donation",
    "Room Receipt": "room",
    "Inventory Receipt": "inventory",
    "Expense Voucher": "expense",
    "Purchase Receipt": "purchase",
    "Visitor Pass": "visitor",
    "Donation Certificate": "certificate"
};

const presetToTemplateType = {
    donation: "Donation Receipt",
    room: "Room Receipt",
    inventory: "Inventory Receipt",
    expense: "Expense Voucher",
    purchase: "Purchase Receipt",
    visitor: "Visitor Pass",
    certificate: "Donation Certificate"
};

const getCategoriesForTemplateType = (type) => {
    switch (type) {
        case "Donation Receipt":
            return ["Temple", "Common", "Donation", "Donation / Room"];
        case "Donation Certificate":
            return ["Temple", "Common", "Certificate"];
        case "Room Receipt":
            return ["Temple", "Common", "Room", "Donation / Room"];
        case "Inventory Receipt":
        case "Purchase Receipt":
            return ["Temple", "Common", "Inventory"];
        case "Expense Voucher":
            return ["Temple", "Common", "Expense"];
        case "Visitor Pass":
            return ["Temple", "Common", "Visitor Pass"];
        default:
            return null; // All
    }
};

const DocumentTemplateForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    // --- API Hooks ---
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data: temples, loading: loadingTemples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name", "city", "state", "temple_address", "country", "pincode"],
        limit: 1000
    });
    const { data, loading, error } = useFrappeGetDoc(DOCTYPE_DOCUMENT_TEMPLATE, id);

    // Live HTML state for rendering inside the sandbox iframe
    const [selectedTemple, setSelectedTemple] = useState(undefined);
    const [headerHtml, setHeaderHtml] = useState("");
    const [bodyHtml, setBodyHtml] = useState("");
    const [footerHtml, setFooterHtml] = useState("");
    const [primaryColor, setPrimaryColor] = useState("#18181b");
    const [secondaryColor, setSecondaryColor] = useState("#71717a");
    const [fontFamily, setFontFamily] = useState("Inter");
    const [margins, setMargins] = useState("15px");
    const [paperSize, setPaperSize] = useState("A4");
    const [orientation, setOrientation] = useState("Portrait");
    const [previewModalVisible, setPreviewModalVisible] = useState(false);
    const [aiPromptModalVisible, setAiPromptModalVisible] = useState(false);
    const [aiResponseText, setAiResponseText] = useState("");
    const [templateType, setTemplateType] = useState(undefined);

    useEffect(() => {
        if (isEdit && data) {
            form.setFieldsValue(data);
            setSelectedTemple(data.temple || undefined);
            setHeaderHtml(data.header_html || "");
            setBodyHtml(data.body_html || "");
            setFooterHtml(data.footer_html || "");
            setPrimaryColor(data.primary_color || "#18181b");
            setSecondaryColor(data.secondary_color || "#71717a");
            setFontFamily(data.font_family || "Inter");
            setMargins(data.margins || "15px");
            setPaperSize(data.paper_size || "A4");
            setOrientation(data.print_orientation || "Portrait");
            setTemplateType(data.template_type || undefined);
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

    useEffect(() => {
        if (!isEdit && temples && temples.length === 1) {
            const singleTemple = temples[0].name;
            form.setFieldsValue({ temple: singleTemple });
            setSelectedTemple(singleTemple);
        }
    }, [temples, isEdit, form]);

    const handleFormValuesChange = (changed, all) => {
        if (changed.temple !== undefined) setSelectedTemple(changed.temple);
        if (changed.header_html !== undefined) setHeaderHtml(changed.header_html);
        if (changed.body_html !== undefined) setBodyHtml(changed.body_html);
        if (changed.footer_html !== undefined) setFooterHtml(changed.footer_html);
        if (changed.primary_color !== undefined) setPrimaryColor(changed.primary_color);
        if (changed.secondary_color !== undefined) setSecondaryColor(changed.secondary_color);
        if (changed.font_family !== undefined) setFontFamily(changed.font_family);
        if (changed.margins !== undefined) setMargins(changed.margins);
        if (changed.paper_size !== undefined) setPaperSize(changed.paper_size);
        if (changed.print_orientation !== undefined) setOrientation(changed.print_orientation);
        if (changed.template_type !== undefined) {
            setTemplateType(changed.template_type || undefined);
            const presetKey = templateTypeToPreset[changed.template_type];
            const preset = presets[presetKey];
            if (preset) {
                form.setFieldsValue({
                    header_html: preset.header,
                    body_html: preset.body,
                    footer_html: preset.footer
                });
                setHeaderHtml(preset.header);
                setBodyHtml(preset.body);
                setFooterHtml(preset.footer);
                message.success(`Loaded standard preset for ${changed.template_type}`);
            } else if (changed.template_type === "Custom") {
                form.setFieldsValue({
                    header_html: "",
                    body_html: "",
                    footer_html: ""
                });
                setHeaderHtml("");
                setBodyHtml("");
                setFooterHtml("");
                message.info("Custom Template Type selected. HTML editor cleared.");
            }
        }
    };

    const handleResetToPreset = () => {
        const templateType = form.getFieldValue("template_type");
        if (!templateType || templateType === "Custom") {
            message.warning("Please select a standard Template Type first to reset to its preset");
            return;
        }
        const presetKey = templateTypeToPreset[templateType];
        const preset = presets[presetKey];
        if (preset) {
            Modal.confirm({
                title: "Reset Template to Preset?",
                content: `Are you sure you want to overwrite your current HTML edits with the standard ${templateType} preset?`,
                okText: "Reset",
                cancelText: "Cancel",
                onOk: () => {
                    form.setFieldsValue({
                        header_html: preset.header,
                        body_html: preset.body,
                        footer_html: preset.footer
                    });
                    setHeaderHtml(preset.header);
                    setBodyHtml(preset.body);
                    setFooterHtml(preset.footer);
                    message.success(`Loaded standard preset for ${templateType}`);
                }
            });
        }
    };

    const generateAiPrompt = () => {
        const type = form.getFieldValue("template_type") || "Custom";
        const prim = form.getFieldValue("primary_color") || primaryColor;
        const sec = form.getFieldValue("secondary_color") || secondaryColor;
        const font = form.getFieldValue("font_family") || fontFamily;
        const paper = form.getFieldValue("paper_size") || paperSize;
        const orient = form.getFieldValue("print_orientation") || orientation;
        const marg = form.getFieldValue("margins") || margins;
        
        const relevantCats = getCategoriesForTemplateType(type);
        const filteredVars = relevantCats 
            ? variablesList.filter(v => relevantCats.includes(v.cat))
            : variablesList;
            
        const varsString = filteredVars
            .map(v => `- \`{{${v.name.replace(/[{}]/g, "")}}}\`: ${v.desc}`)
            .join("\n");
        
        return `Act as an expert web designer and frontend developer. Write a custom print template (HTML + CSS) for a "${type}" in a Temple Management system.

We need three HTML sections:
1. Header HTML (containing the temple header, logo, name, trust info)
2. Body HTML (containing the transaction details, formatted tables/labels)
3. Footer HTML (containing the footer note, blessing quote, signature line)

Design System Constraints:
- Use vanilla HTML and inline CSS styles ONLY (e.g. style="color: ${prim}; font-family: '${font}', sans-serif; padding: 6px;").
- Do NOT use external stylesheets, <style> tags, or Tailwind CSS classes.
- Theme Colors:
  - Primary Color: ${prim} (use this for headers, main labels, accents)
  - Secondary Color: ${sec} (use this for helper text, borders, sub-headings)
- Typography: Use the font family '${font}' for all text. Set it inline on elements (e.g. style="font-family: '${font}', sans-serif;").
- Print Dimensions & Layout: The template MUST be optimized for:
  - Paper Size: ${paper} (Note: If it is Thermal 80mm or 58mm, design a single narrow vertical receipt layout with small padding and font sizes. Do not use wide side-by-side columns).
  - Print Orientation: ${orient}
  - Margins: ${marg}

Here are the available variables you can use:
${varsString}

Format your output EXACTLY as follows with Markdown code blocks:

[START_HEADER]
\`\`\`html
[Insert Header HTML code here]
\`\`\`
[END_HEADER]

[START_BODY]
\`\`\`html
[Insert Body HTML code here]
\`\`\`
[END_BODY]

[START_FOOTER]
\`\`\`html
[Insert Footer HTML code here]
\`\`\`
[END_FOOTER]
`;
    };

    const cleanCode = (codeStr) => {
        if (!codeStr) return "";
        return codeStr
            .replace(/^\s*```(?:html)?/i, "")
            .replace(/```\s*$/, "")
            .trim();
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

    const copyToClipboard = (text, successMessage) => {
        const msg = successMessage || `Copied placeholder: ${text}`;
        if (!navigator.clipboard) {
            // Fallback for non-secure context (HTTP)
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                const successful = document.execCommand("copy");
                if (successful) {
                    message.success(msg);
                } else {
                    message.error("Failed to copy text.");
                }
            } catch (err) {
                message.error("Failed to copy text: " + err);
            }
            document.body.removeChild(textArea);
            return;
        }

        navigator.clipboard.writeText(text).then(
            () => {
                message.success(msg);
            },
            (err) => {
                // If permission denied, use fallback
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.top = "0";
                textArea.style.left = "0";
                textArea.style.opacity = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand("copy");
                    message.success(msg);
                } catch (copyErr) {
                    message.error("Failed to copy text.");
                }
                document.body.removeChild(textArea);
            }
        );
    };

    // Calculate simulated preview sandbox HTML
    const getPreviewHtml = () => {
        if (!selectedTemple || !templateType) {
            return `
                <html>
                <head>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                            margin: 0;
                            padding: 20px;
                            background-color: #f4f4f5;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            box-sizing: border-box;
                        }
                        .message-box {
                            background: #ffffff;
                            box-shadow: 0 4px 10px rgba(0,0,0,0.08);
                            border-radius: 8px;
                            padding: 30px;
                            text-align: center;
                            border: 1px solid #e4e4e7;
                            max-width: 400px;
                            width: 100%;
                        }
                        .message-title {
                            font-size: 18px;
                            font-weight: 600;
                            color: #18181b;
                            margin-bottom: 8px;
                        }
                        .message-text {
                            font-size: 14px;
                            color: #71717a;
                        }
                    </style>
                </head>
                <body>
                    <div class="message-box">
                        <div class="message-title">Template Preview</div>
                        <div class="message-text">Please select Trust and Template Type</div>
                    </div>
                </body>
                </html>
            `;
        }

        let h = headerHtml;
        let b = bodyHtml;
        let f = footerHtml;

        // Apply primary & secondary colors to placeholder variables in CSS/HTML
        h = h.replace(/{{primary_color}}/g, primaryColor).replace(/{{secondary_color}}/g, secondaryColor);
        b = b.replace(/{{primary_color}}/g, primaryColor).replace(/{{secondary_color}}/g, secondaryColor);
        f = f.replace(/{{primary_color}}/g, primaryColor).replace(/{{secondary_color}}/g, secondaryColor);

        const selectedTempleObj = temples?.find(t => t.name === selectedTemple);

        const currentSampleData = {
            ...sampleData,
            ...(selectedTempleObj ? {
                temple_name: selectedTempleObj.temple_name || sampleData.temple_name,
                trust_name: selectedTempleObj.temple_name || sampleData.trust_name,
                address: selectedTempleObj.temple_address || sampleData.address,
                city: selectedTempleObj.city || sampleData.city,
                state: selectedTempleObj.state || sampleData.state,
                country: selectedTempleObj.country || sampleData.country
            } : {})
        };

        // Replace custom sample data
        Object.keys(currentSampleData).forEach(key => {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
            h = h.replace(regex, currentSampleData[key]);
            b = b.replace(regex, currentSampleData[key]);
            f = f.replace(regex, currentSampleData[key]);
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

                            <Card
                                title={<span><EditOutlined /> HTML Template Editor</span>}
                                extra={
                                    <Space>
                                        {templateType && templateType !== "Custom" && (
                                            <Button
                                                icon={<UndoOutlined />}
                                                onClick={handleResetToPreset}
                                                size="small"
                                            >
                                                Reset to Default
                                            </Button>
                                        )}
                                        <Button
                                            type="primary"
                                            ghost
                                            icon={<LayoutOutlined />}
                                            onClick={() => setAiPromptModalVisible(true)}
                                            size="small"
                                        >
                                            Generate with AI
                                        </Button>
                                    </Space>
                                }
                                bordered={false}
                                className="shadow-sm"
                            >
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

                            <LiveSandboxPreview
                                getPreviewHtml={getPreviewHtml}
                                onFullscreen={() => setPreviewModalVisible(true)}
                            />

                            <DynamicVariableAssistant
                                variablesList={variablesList}
                                copyToClipboard={copyToClipboard}
                            />

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

            <Modal
                title="Document Print Preview"
                open={previewModalVisible}
                onCancel={() => setPreviewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setPreviewModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={850}
                bodyStyle={{ padding: 0 }}
                destroyOnClose
            >
                <div style={{ background: "#f4f4f5", padding: "20px", display: "flex", justifyContent: "center" }}>
                    <iframe
                        title="Fullscreen Preview Sandbox"
                        srcDoc={getPreviewHtml()}
                        style={{
                            width: "100%",
                            height: "600px",
                            border: "1px solid #d4d4d8",
                            borderRadius: "6px",
                            background: "#ffffff"
                        }}
                    />
                </div>
            </Modal>

            <AiTemplateModal
                open={aiPromptModalVisible}
                onCancel={() => setAiPromptModalVisible(false)}
                generateAiPrompt={generateAiPrompt}
                copyToClipboard={copyToClipboard}
                onImport={({ header, body, footer }) => {
                    const cleanedHeader = cleanCode(header);
                    const cleanedBody = cleanCode(body);
                    const cleanedFooter = cleanCode(footer);

                    const newValues = {};
                    if (cleanedHeader) {
                        newValues.header_html = cleanedHeader;
                        setHeaderHtml(cleanedHeader);
                    }
                    if (cleanedBody) {
                        newValues.body_html = cleanedBody;
                        setBodyHtml(cleanedBody);
                    }
                    if (cleanedFooter) {
                        newValues.footer_html = cleanedFooter;
                        setFooterHtml(cleanedFooter);
                    }

                    form.setFieldsValue(newValues);
                    message.success("Successfully imported the HTML template sections!");
                    setAiPromptModalVisible(false);
                }}
            />
        </ViewContainer>
    );
};

export default DocumentTemplateForm;
