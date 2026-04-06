import React from "react";
import { Card, Typography, Row, Col, Space, Button, Divider, Table, Tag, Spin, Alert } from "antd";
import { ArrowLeftOutlined, PrinterOutlined, EditOutlined } from "@ant-design/icons";
import { useFrappeGetDoc } from "../../hooks/useFrappe";
import DonationPrint from "../Donation/DonationPrint";
import { formConfigs } from "../../config/formConfig";

const { Title, Text } = Typography;

/**
 * CommonView Component
 * Renders a read-only detailed view of a document.
 */
const CommonView = ({ doctype, id, onBack, onEdit }) => {
    const { data: doc, loading, error } = useFrappeGetDoc(doctype, id);
    const config = formConfigs[doctype];

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <Spin size="large" tip={`Loading ${doctype} details...`} />
            </div>
        );
    }

    if (error || !doc) {
        return (
            <div style={{ padding: "24px" }}>
                <Alert
                    message="Error Loading Details"
                    description={error?.message || "Document not found."}
                    type="error"
                    showIcon
                    action={<Button onClick={onBack} icon={<ArrowLeftOutlined />}>Go Back</Button>}
                />
            </div>
        );
    }

    const renderFieldValue = (field, value) => {
        if (!value) return <Text type="secondary">-</Text>;
        
        switch (field.type) {
            case 'image':
                return <img src={value} alt={field.label} style={{ maxWidth: '100px', borderRadius: '8px' }} />;
            case 'textarea':
                return <pre style={{ whiteSpace: 'pre-wrap', background: 'transparent', border: 'none', padding: 0, margin: 0, fontSize: 'inherit', fontFamily: 'inherit' }}>{value}</pre>;
            default:
                if (typeof value === 'object') return JSON.stringify(value);
                return <Text strong>{String(value)}</Text>;
        }
    };

    return (
        <div style={{ padding: "24px 0", maxWidth: "1200px", margin: "0 auto" }}>
            <Card bordered={false} className="shadow-sm" style={{ borderRadius: '16px' }}>
                <Row align="middle" justify="space-between" style={{ marginBottom: "32px" }}>
                    <Col>
                        <Space size="middle">
                            <Button
                                type="default"
                                shape="circle"
                                icon={<ArrowLeftOutlined />}
                                onClick={onBack}
                            />
                            <div>
                                <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
                                    View {config?.title || doctype}'s Details
                                </Title>
                            </div>
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <Button 
                                icon={<PrinterOutlined />} 
                                onClick={handlePrint}
                                size="large"
                            >
                                Print
                            </Button>
                            <Button 
                                type="primary" 
                                icon={<EditOutlined />} 
                                onClick={() => onEdit && onEdit(doc)}
                                size="large"
                            >
                                Edit Details
                            </Button>
                        </Space>
                    </Col>
                </Row>

                <Row gutter={[32, 24]}>
                    {config?.fields.map(field => (
                        <Col xs={24} sm={12} md={8} lg={6} key={field.name}>
                            <div style={{ marginBottom: '8px' }}>
                                <Text type="secondary" block style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {field.label}
                                </Text>
                                {renderFieldValue(field, doc[field.name])}
                            </div>
                        </Col>
                    ))}
                    
                    {/* Meta Fields */}
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Text type="secondary" block style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Created At
                        </Text>
                        <Text strong>{doc.creation && new Date(doc.creation).toLocaleDateString()}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Text type="secondary" block style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Updated At
                        </Text>
                        <Text strong>{doc.modified && new Date(doc.modified).toLocaleDateString()}</Text>
                    </Col>
                </Row>

                {/* Special Logic for Donations: Display Items/Payment & Print Template */}
                {doctype === "Donation" && (
                    <>
                        <Divider />
                        {/* Hidden Print Receipt Template */}
                        <DonationPrint donation={doc} />
                        
                        <Title level={4} style={{ marginBottom: '24px', color: '#4f46e5' }}>Donation's Payment Details</Title>
                        <Row gutter={[32, 24]}>
                            <Col span={6}>
                                <Text type="secondary" block>Payment Type</Text>
                                <Tag color="blue">{doc.payment_mode}</Tag>
                            </Col>
                            <Col span={6}>
                                <Text type="secondary" block>Total Donation Amount</Text>
                                <Text strong style={{ fontSize: '20px', color: '#10b981' }}>₹{Number(doc.total_amount).toLocaleString()}</Text>
                            </Col>
                            <Col span={6}>
                                <Text type="secondary" block>Cashier</Text>
                                <Text strong>{doc.cashier || '-'}</Text>
                            </Col>
                        </Row>

                        <Divider />
                        <Title level={4} style={{ marginBottom: '24px', color: '#4f46e5' }}>Donation Items</Title>
                        <Table
                            dataSource={doc.donation_items || []}
                            pagination={false}
                            rowKey="name"
                            columns={[
                                { title: 'Code', dataIndex: 'donation_type', key: 'donation_type' },
                                { title: 'Name', dataIndex: 'donation_type_name', key: 'donation_type_name', render: (_, r) => r.donation_type },
                                { 
                                    title: 'Donation Amount', 
                                    dataIndex: 'amount', 
                                    key: 'amount', 
                                    align: 'right',
                                    render: (val) => `₹${Number(val).toLocaleString()}` 
                                }
                            ]}
                            style={{ background: '#f8fafc', borderRadius: '12px' }}
                        />
                    </>
                )}
            </Card>
        </div>
    );
};

export default CommonView;
