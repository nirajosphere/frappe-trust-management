import React from "react";
import { Card, Typography, Row, Col, Space, Button, Divider, Table, Tag, Spin, Alert } from "antd";
import { ArrowLeftOutlined, PrinterOutlined, EditOutlined } from "@ant-design/icons";
import { useFrappeGetDoc } from "../../hooks/useFrappe";
import PageHeader from "./PageHeader";
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
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Spin size="large" tip={`Loading ${doctype} details...`} />
            </div>
        );
    }

    if (error || !doc) {
        return (
            <div className="p-8">
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
        if (!value) return <Text type="secondary" className="opacity-50 italic">None</Text>;
        
        switch (field.type) {
            case 'image':
                return <img src={value} alt={field.label} className="max-w-[120px] rounded-xl shadow-sm border border-slate-200 p-1" />;
            case 'textarea':
                return <pre className="whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 text-sm font-sans">{value}</pre>;
            default:
                if (typeof value === 'object') return <pre className="text-xs bg-slate-50 p-2 rounded">{JSON.stringify(value, null, 2)}</pre>;
                return <Text className="font-semibold text-slate-800 dark:text-slate-200 text-base">{String(value)}</Text>;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <PageHeader
                title={`View ${config?.title || doctype}`}
                showBack={true}
                onBack={onBack}
                extra={
                    <Space size="middle">
                        <Button
                            icon={<PrinterOutlined />}
                            onClick={handlePrint}
                            className="h-11 px-6 rounded-xl font-medium"
                        >
                            Print Details
                        </Button>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => onEdit && onEdit(doc)}
                            className="h-11 px-6 rounded-xl font-semibold shadow-lg shadow-indigo-500/20"
                        >
                            Edit Information
                        </Button>
                    </Space>
                }
            />
            
            <Card bordered={false} className="aavatto-card !p-0 overflow-hidden">
                <div className="p-8 bg-gradient-to-r from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10 border-b border-orange-100/50">
                    <Title level={4} className="!m-0 text-amber-700">Essential Information</Title>
                </div>
                
                <div className="p-8">
                    <Row gutter={[40, 32]}>
                        {config?.fields.map(field => (
                            <Col xs={24} sm={12} md={8} lg={6} key={field.name}>
                                <div className="space-y-1.5">
                                    <Text className="text-[11px] font-bold uppercase tracking-widest text-stone-400 block">
                                        {field.label}
                                    </Text>
                                    <div className="min-h-[24px]">
                                        {renderFieldValue(field, doc[field.name])}
                                    </div>
                                </div>
                            </Col>
                        ))}
                        
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <div className="space-y-1.5">
                                <Text className="text-[11px] font-bold uppercase tracking-widest text-stone-400 block">
                                    Document ID
                                </Text>
                                <Tag className="m-0 border-none bg-stone-100 text-stone-600 font-mono py-0.5 px-2">
                                    {id}
                                </Tag>
                            </div>
                        </Col>
                    </Row>
                </div>

                {doctype === "Donation" && (
                    <div className="p-8 border-t border-orange-100 bg-amber-50/20">
                        <Divider dashed className="!my-0 opacity-0" />
                        <DonationPrint donation={doc} />
                        
                        <div className="flex items-center justify-between mb-8">
                            <Title level={4} className="!m-0 text-amber-700">Financial Summary</Title>
                            <div className="text-right">
                                <Text className="text-[11px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Total Amount</Text>
                                <Title level={2} className="!m-0 text-orange-600 font-bold">
                                    ₹{Number(doc.total_amount).toLocaleString()}
                                </Title>
                            </div>
                        </div>

                        <Row gutter={[32, 24]} className="mb-8">
                            <Col xs={12} sm={8}>
                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                                    <Text className="text-[11px] font-bold uppercase tracking-widest text-amber-600 block mb-2">Payment Method</Text>
                                    <Tag color="orange" className="m-0 px-3 py-0.5 font-semibold rounded-lg uppercase text-[11px] tracking-wide border-amber-200">
                                        {doc.payment_mode}
                                    </Tag>
                                </div>
                            </Col>
                            <Col xs={12} sm={8}>
                                <div className="p-4 rounded-2xl bg-stone-50 shadow-inner border border-stone-100">
                                    <Text className="text-[11px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Handled By</Text>
                                    <Text className="font-semibold text-stone-700">{doc.cashier || 'System'}</Text>
                                </div>
                            </Col>
                            <Col xs={24} sm={8}>
                                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
                                    <Text className="text-[11px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Transaction Ref</Text>
                                    <Text className="font-mono text-xs text-stone-500">{doc.reference_no || 'N/A'}</Text>
                                </div>
                            </Col>
                        </Row>


                        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            <Table
                                dataSource={doc.donation_items || []}
                                pagination={false}
                                rowKey="name"
                                className="premium-table-light"
                                columns={[
                                    { 
                                        title: 'Item Description', 
                                        dataIndex: 'donation_type', 
                                        key: 'donation_type',
                                        render: (val) => <Text className="font-semibold">{val}</Text>
                                    },
                                    { 
                                        title: 'Amount', 
                                        dataIndex: 'amount', 
                                        key: 'amount', 
                                        align: 'right',
                                        render: (val) => <span className="font-bold text-slate-700 dark:text-slate-300">₹{Number(val).toLocaleString()}</span>
                                    }
                                ]}
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between p-8 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex gap-8">
                        <div>
                            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Created On</Text>
                            <Text className="text-xs text-slate-500">{doc.creation && new Date(doc.creation).toLocaleString()}</Text>
                        </div>
                        <div>
                            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Last Modified</Text>
                            <Text className="text-xs text-slate-500">{doc.modified && new Date(doc.modified).toLocaleString()}</Text>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};


export default CommonView;
