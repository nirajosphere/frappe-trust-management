import React, { useState, useEffect } from "react";
import { Card, Row, Col, Typography, Empty, Spin, Space } from "antd";
import { HeartFilled, AppstoreOutlined } from "@ant-design/icons";

const { Text } = Typography;

const DonationTypes = ({ selectedTemple, onAddToCart }) => {
    const [donationTypes, setDonationTypes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedTemple) {
            fetchDonationTypes();
        } else {
            setDonationTypes([]);
        }
    }, [selectedTemple]);

    const fetchDonationTypes = () => {
        setLoading(true);
        frappe.call({
            method: "frappe.client.get_list",
                args: {
                    doctype: "Donation Type",
                    filters: { temple: selectedTemple },
                    fields: ["name", "donation_type", "temple", "default_amount"]
                },
                callback: (r) => {
                    setLoading(false);
                    if (r.message) {
                        setDonationTypes(r.message);
                    } else {
                        setDonationTypes([]);
                    }
                }
            });
    };

    if (!selectedTemple) {
        return (
            <Card className="aavatto-card min-h-[300px] flex items-center justify-center border-dashed border-2 border-zinc-200 bg-zinc-50/20">
                <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <span className="text-zinc-400 font-medium italic">
                            Select a temple to view available donation types
                        </span>
                    } 
                />
            </Card>
        );
    }

    return (
        <Card 
            title={
                <Space>
                    <AppstoreOutlined className="text-zinc-900" />
                    <span className="font-bold tracking-tight text-zinc-800">Donation Types</span>
                </Space>
            } 
            size="small" 
            className="aavatto-card"
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Spin size="large" />
                    <Text className="text-zinc-400 font-bold tracking-widest uppercase text-[10px]">Fetching categories...</Text>
                </div>
            ) : donationTypes.length > 0 ? (
                <Row gutter={[16, 16]}>
                    {donationTypes.map(type => (
                        <Col key={type.name} xs={12} sm={8} md={8} lg={6}>
                            <Card
                                hoverable
                                onClick={() => onAddToCart(type)}
                                className="group relative overflow-hidden rounded-xl border-zinc-200 hover:border-zinc-900 transition-all duration-300 bg-white"
                                bodyStyle={{ padding: '20px 12px', textAlign: 'center' }}
                            >
                                <div className="relative z-10">
                                    <div className="text-2xl text-zinc-900 mb-2">
                                        <HeartFilled />
                                    </div>
                                    <Text className="block text-zinc-700 text-sm font-bold truncate">
                                        {type.donation_type}
                                    </Text>
                                    {type.default_amount > 0 && (
                                        <div className="mt-1">
                                            <Text className="text-xs text-zinc-400 font-bold">₹{type.default_amount}</Text>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <div className="py-20 border-2 border-dashed border-zinc-100 rounded-xl bg-zinc-50/30 flex items-center justify-center">
                    <Empty description="No categories found" />
                </div>
            )}
        </Card>
    );
};

export default DonationTypes;
