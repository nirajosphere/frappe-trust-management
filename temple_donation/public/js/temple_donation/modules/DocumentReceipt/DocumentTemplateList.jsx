import React, { useState, useEffect } from "react";
import { Table, Card, Input, Button, Select, Space, Tag, Modal, Typography, message, Popconfirm, Tooltip } from "antd";
import { 
    PlusOutlined, EditOutlined, DeleteOutlined, CopyOutlined, 
    CheckCircleOutlined, EyeOutlined, FileTextOutlined 
} from "@ant-design/icons";
import { useFrappeGetDocList, useFrappeDeleteDoc, useFrappeCreateDoc } from "../../hooks/useFrappe";
import { DOCTYPE_DOCUMENT_TEMPLATE } from "../../config/constants";
import PageHeader from "../../components/common/PageHeader";
import ViewContainer from "../../components/common/ViewContainer";
import { useUser } from "../../context/UserContext";

const { Text, Title } = Typography;

const DocumentTemplateList = () => {
    const { roles } = useUser();
    const canManage = roles.some(r => ["Super Admin", "Temple Admin", "System Manager", "Administrator"].includes(r));
    
    const [searchText, setSearchText] = useState("");
    const [selectedTemple, setSelectedTemple] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        setPage(1);
    }, [searchText, selectedTemple, templatesList?.length]);
    const [previewHtml, setPreviewHtml] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");

    // Fetch Temples
    const { data: temples, loading: loadingTemples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        limit: 1000
    });

    // Fetch Templates
    const { data: templatesList, loading: loadingTemplates, mutate } = useFrappeGetDocList(DOCTYPE_DOCUMENT_TEMPLATE, {
        fields: ["*"],
        limit: 1000
    });

    const { deleteDoc } = useFrappeDeleteDoc();
    const { createDoc } = useFrappeCreateDoc();

    const navigate = (sub, id) => {
        if (typeof frappe !== "undefined") {
            const route = ["temple-donation", "document-templates"];
            if (sub) route.push(sub);
            if (id) route.push(id);
            frappe.set_route(...route);
        }
    };

    // Duplicate Template logic
    const handleDuplicate = async (record) => {
        try {
            const { name, creation, modified, modified_by, owner, docstatus, ...copyFields } = record;
            const newPayload = {
                ...copyFields,
                template_name: `${record.template_name} (Copy)`,
                default_template: 0
            };
            await createDoc(DOCTYPE_DOCUMENT_TEMPLATE, newPayload);
            mutate();
        } catch (err) {
            console.error("Duplicate Error:", err);
        }
    };

    // Set Default logic
    const handleSetDefault = async (record) => {
        if (typeof frappe === "undefined") return;
        try {
            frappe.call({
                method: "frappe.client.set_value",
                args: {
                    doctype: DOCTYPE_DOCUMENT_TEMPLATE,
                    name: record.name,
                    fieldname: { default_template: 1 }
                },
                callback: () => {
                    message.success("Set as default template successfully");
                    mutate();
                }
            });
        } catch (err) {
            console.error("Set Default Error:", err);
        }
    };

    // Preview logic
    const handlePreview = (record) => {
        setPreviewTitle(record.template_name);
        
        // Use local mock compiler to render live template instantly
        const sampleData = {
            temple_name: "Sri Venkateswara Swamy Temple",
            trust_name: "Tirumala Tirupati Devasthanams",
            address: "Tirumala Hill",
            city: "Tirupati",
            state: "Andhra Pradesh",
            country: "India",
            phone: "+91 9999999999",
            email: "info@temple.org",
            website: "www.temple.org",
            receipt_number: "REC-2026-0001",
            receipt_date: "02-07-2026",
            created_by: "cashier@temple.org",
            cashier: "Shailesh Kumar",
            donor_name: "Rajesh Sharma",
            mobile: "9876543210",
            donation_type: "Abhishekam Pooja",
            amount: "1008.00",
            payment_mode: "UPI",
            notes: "Special prayers for family health",
            guest_name: "Rajesh Sharma",
            room_number: "Room 104",
            room_type: "AC Deluxe",
            building: "Nandanam Guest House",
            check_in: "02-07-2026 10:00 AM",
            check_out: "04-07-2026 12:00 PM",
            days: 2,
            entry_number: "INV-2026-0089",
            entry_type: "Stock In",
            item_name: "Pooja Oil",
            quantity: 10,
            unit: "Liters",
            rate: "150.00",
            total: "1500.00",
            reference: "PO-0982",
            qr_code: `<div style="border: 2px dashed #a1a1aa; width: 100px; height: 100px; padding: 5px; margin: 10px auto; background:#f4f4f5; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:bold; color:#71717a;">SAMPLE QR</div>`,
            logo_tag: `<div style="border: 1px dashed #a1a1aa; width: 70px; height: 70px; background:#e4e4e7; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:bold; color:#71717a; border-radius:4px;">LOGO</div>`
        };

        let html = `
            <div class="receipt-container">
                <div class="receipt-header">${record.header_html || ""}</div>
                <div class="receipt-body">${record.body_html || ""}</div>
                <div class="receipt-footer">${record.footer_html || ""}</div>
            </div>
        `;

        Object.keys(sampleData).forEach(key => {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
            html = html.replace(regex, sampleData[key]);
        });
        html = html.replace(/{{\s*.*?\s*}}/g, "");

        const styledHtml = `
            <html>
            <head>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=${record.font_family}:wght@300;400;600;700&display=swap');
                    body {
                        font-family: '${record.font_family}', sans-serif;
                        margin: 0;
                        padding: ${record.margins || '15px'};
                        color: #1f2937;
                        background-color: #ffffff;
                    }
                    .receipt-header {
                        margin-bottom: 20px;
                        border-bottom: 2px solid ${record.primary_color || '#18181b'};
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
                        color: ${record.secondary_color || '#71717a'};
                        text-align: center;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 15px;
                    }
                    th {
                        background-color: ${record.primary_color || '#18181b'};
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
                ${html}
            </body>
            </html>
        `;

        setPreviewHtml(styledHtml);
        setPreviewVisible(true);
    };

    const handleDelete = async (record) => {
        try {
            await deleteDoc(DOCTYPE_DOCUMENT_TEMPLATE, record.name);
            mutate();
        } catch (err) {
            console.error("Delete Error:", err);
        }
    };

    const filteredTemplates = templatesList?.filter(item => {
        const matchesSearch = !searchText || item.template_name?.toLowerCase().includes(searchText.toLowerCase()) || item.template_type?.toLowerCase().includes(searchText.toLowerCase());
        const matchesTemple = !selectedTemple || item.temple === selectedTemple;
        return matchesSearch && matchesTemple;
    });

    const columns = [
        {
            title: "Template Name",
            dataIndex: "template_name",
            key: "template_name",
            render: (text) => <Text strong>{text}</Text>,
            sorter: (a, b) => (a.template_name || "").localeCompare(b.template_name || "")
        },
        {
            title: "Temple / Trust",
            dataIndex: "temple",
            key: "temple",
            render: (name) => {
                const match = temples?.find(t => t.name === name);
                return <Text>{match?.temple_name || name}</Text>;
            }
        },
        {
            title: "Type",
            dataIndex: "template_type",
            key: "template_type",
            render: (type) => <Tag color="purple">{type}</Tag>
        },
        {
            title: "Paper Size",
            dataIndex: "paper_size",
            key: "paper_size",
            render: (size) => <Tag color="blue">{size}</Tag>
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const color = status === "Active" ? "green" : "red";
                return <Tag color={color}>{status || "Active"}</Tag>;
            }
        },
        {
            title: "Default",
            dataIndex: "default_template",
            key: "default_template",
            render: (isDefault, record) => {
                if (isDefault) return <Tag color="gold" icon={<CheckCircleOutlined />}>Default</Tag>;
                if (canManage) {
                    return (
                        <Button type="link" size="small" onClick={() => handleSetDefault(record)}>
                            Set Default
                        </Button>
                    );
                }
                return <Text type="secondary">-</Text>;
            }
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Preview Template">
                        <Button
                            type="text"
                            icon={<EyeOutlined style={{ color: "#0891b2" }} />}
                            onClick={() => handlePreview(record)}
                        />
                    </Tooltip>
                    {canManage && (
                        <>
                            <Tooltip title="Duplicate">
                                <Button
                                    type="text"
                                    icon={<CopyOutlined style={{ color: "#4f46e5" }} />}
                                    onClick={() => handleDuplicate(record)}
                                />
                            </Tooltip>
                            <Tooltip title="Edit">
                                <Button
                                    type="text"
                                    icon={<EditOutlined style={{ color: "#d97706" }} />}
                                    onClick={() => navigate("edit", record.name)}
                                />
                            </Tooltip>
                            <Popconfirm
                                title="Are you sure to delete this template?"
                                onConfirm={() => handleDelete(record)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                />
                            </Popconfirm>
                        </>
                    )}
                </Space>
            )
        }
    ];

    return (
        <ViewContainer>
            <PageHeader 
                title="Document Templates"
                description="Create and manage custom layouts, styles, and headers/footers for all print documents and receipts."
                extra={canManage && (
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => navigate("new")}
                        style={{ height: "38px", borderRadius: "6px" }}
                    >
                        Create Template
                    </Button>
                )}
            />

            <Card bordered={false} style={{ marginBottom: "24px", borderRadius: "8px" }} className="shadow-sm">
                <Space wrap size="middle">
                    <Input.Search
                        placeholder="Search templates..."
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: "240px" }}
                    />
                    <Select 
                        showSearch 
                        placeholder="Filter by Trust"
                        style={{ width: "220px" }}
                        optionFilterProp="children"
                        allowClear
                        loading={loadingTemples}
                        value={selectedTemple}
                        onChange={(val) => setSelectedTemple(val)}
                        options={temples?.map(t => ({ label: t.temple_name, value: t.name })) || []}
                    />
                </Space>
            </Card>

            <Table
                dataSource={filteredTemplates}
                columns={columns}
                rowKey="name"
                loading={loadingTemplates}
                pagination={{
                    current: page,
                    pageSize: pageSize,
                    showSizeChanger: true,
                    onChange: (p, s) => {
                        setPage(p);
                        setPageSize(s);
                    }
                }}
                bordered
                className="aavatto-premium-table"
                style={{ background: "#fff", borderRadius: "8px" }}
            />

            <Modal
                title={`Template Preview: ${previewTitle}`}
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setPreviewVisible(false)}>
                        Close
                    </Button>
                ]}
                width={800}
                styles={{ body: { padding: 0 } }}
            >
                <div style={{ background: "#f4f4f5", padding: "20px", display: "flex", justifyContent: "center" }}>
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
                            title="Receipt Template Live Preview"
                            srcDoc={previewHtml} 
                            style={{ 
                                width: "100%", 
                                height: "500px", 
                                border: "none" 
                            }} 
                        />
                    </div>
                </div>
            </Modal>
        </ViewContainer>
    );
};

export default DocumentTemplateList;
