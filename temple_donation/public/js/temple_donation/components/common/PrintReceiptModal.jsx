import React, { useState, useEffect } from "react";
import { Modal, Select, Button, Space, Typography, Alert } from "antd";
import { PrinterOutlined, DownloadOutlined, LoadingOutlined } from "@ant-design/icons";

const { Text } = Typography;

const PrintReceiptModal = ({ visible, onCancel, doctype, docname, temple }) => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [renderedHtml, setRenderedHtml] = useState("");
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [loadingHtml, setLoadingHtml] = useState(false);
    const [error, setError] = useState(null);

    // Map frontend doctype to backend template type
    const getTemplateType = () => {
        if (doctype === "Donation") return "Donation Receipt";
        if (doctype === "Room Booking") return "Room Receipt";
        if (doctype === "Inventory Entry") return "Inventory Receipt";
        return "Custom";
    };

    // 1. Fetch available templates
    useEffect(() => {
        if (!visible || !temple || typeof frappe === "undefined") return;

        setLoadingTemplates(true);
        setError(null);

        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Document Template",
                filters: {
                    temple: temple,
                    template_type: getTemplateType(),
                    status: "Active"
                },
                fields: ["name", "template_name", "default_template"]
            },
            callback: (r) => {
                setLoadingTemplates(false);
                if (r.message) {
                    setTemplates(r.message);
                    // Set default template if present, else first template, else null
                    const defaultTemp = r.message.find(t => t.default_template === 1);
                    if (defaultTemp) {
                        setSelectedTemplate(defaultTemp.name);
                    } else if (r.message.length > 0) {
                        setSelectedTemplate(r.message[0].name);
                    } else {
                        setSelectedTemplate(null);
                    }
                }
            },
            error: (err) => {
                setLoadingTemplates(false);
                setError("Failed to load templates");
            }
        });
    }, [visible, temple, doctype]);

    // 2. Fetch rendered HTML
    useEffect(() => {
        if (!visible || !docname) return;

        setLoadingHtml(true);
        setRenderedHtml("");

        if (typeof frappe === "undefined") {
            setLoadingHtml(false);
            return;
        }

        frappe.call({
            method: "temple_donation.api.document_receipt.get_rendered_receipt",
            args: {
                doc_name: docname,
                doctype: doctype,
                template_name: selectedTemplate || undefined
            },
            callback: (r) => {
                setLoadingHtml(false);
                if (r.message && r.message.html) {
                    setRenderedHtml(r.message.html);
                }
            },
            error: (err) => {
                setLoadingHtml(false);
                setError("Failed to render receipt layout");
            }
        });
    }, [visible, docname, doctype, selectedTemplate]);

    const handlePrint = () => {
        const iframe = document.getElementById("print-preview-iframe");
        if (iframe) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }
    };

    const handleDownloadPDF = () => {
        if (typeof frappe === "undefined") return;
        const url = `/api/method/temple_donation.api.document_receipt.download_receipt_pdf?doc_name=${docname}&doctype=${doctype}&template_name=${selectedTemplate || ""}`;
        window.open(url, "_blank");
    };

    return (
        <Modal
            title="Print Document & Receipt"
            open={visible}
            onCancel={onCancel}
            width={850}
            footer={[
                <Button key="close" onClick={onCancel}>
                    Close
                </Button>,
                <Button 
                    key="download" 
                    icon={<DownloadOutlined />} 
                    onClick={handleDownloadPDF}
                    disabled={loadingHtml || !renderedHtml}
                >
                    Download PDF
                </Button>,
                <Button 
                    key="print" 
                    type="primary" 
                    icon={<PrinterOutlined />} 
                    onClick={handlePrint}
                    disabled={loadingHtml || !renderedHtml}
                >
                    Print
                </Button>
            ]}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f4f4f5", padding: "12px 16px", borderRadius: "6px" }}>
                    <Space>
                        <Text strong>Select Layout Template:</Text>
                        <Select
                            placeholder="Fallback Default Template"
                            value={selectedTemplate}
                            onChange={(val) => setSelectedTemplate(val)}
                            loading={loadingTemplates}
                            style={{ width: "260px" }}
                            allowClear
                            options={templates.map(t => ({
                                label: t.template_name,
                                value: t.name
                            }))}
                        />
                    </Space>
                    {templates.length === 0 && !loadingTemplates && (
                        <Text type="secondary" style={{ fontSize: "12px" }}>No custom templates found. Using system fallback.</Text>
                    )}
                </div>

                {error && (
                    <Alert message={error} type="error" showIcon />
                )}

                <div style={{ background: "#e4e4e7", padding: "20px", borderRadius: "6px", display: "flex", justifyContent: "center", minHeight: "440px", position: "relative" }}>
                    {loadingHtml ? (
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%", height: "400px" }}>
                            <LoadingOutlined style={{ fontSize: 32, color: "#18181b" }} spin />
                            <Text style={{ marginTop: "12px", color: "#71717a" }}>Rendering receipt template...</Text>
                        </div>
                    ) : renderedHtml ? (
                        <div style={{ 
                            background: "#fff", 
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)", 
                            borderRadius: "4px", 
                            width: "100%",
                            maxWidth: "600px", 
                            minHeight: "400px",
                            overflow: "hidden"
                        }}>
                            <iframe 
                                id="print-preview-iframe"
                                title="Receipt Sandbox Print Output"
                                srcDoc={renderedHtml} 
                                style={{ 
                                    width: "100%", 
                                    height: "500px", 
                                    border: "none" 
                                }} 
                            />
                        </div>
                    ) : (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px", width: "100%" }}>
                            <Text type="secondary">Preview is unavailable.</Text>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default PrintReceiptModal;
