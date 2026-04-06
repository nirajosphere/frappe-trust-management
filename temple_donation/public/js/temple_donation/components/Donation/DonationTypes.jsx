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
                fields: ["name", "donation_type", "temple",]
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
                    <Text className="text-zinc-400 animate-pulse font-bold tracking-widest uppercase text-[10px]">Fetching categories...</Text>
                </div>
            ) : donationTypes.length > 0 ? (
                <Row gutter={[20, 20]}>
                    {donationTypes.map(type => (
                        <Col key={type.name} xs={12} sm={8} md={8} lg={6}>
                            <Card
                                hoverable
                                onClick={() => onAddToCart(type)}
                                className="group relative overflow-hidden rounded-2xl border-zinc-100 hover:border-zinc-900/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white"
                                bodyStyle={{ padding: '24px 16px', textAlign: 'center' }}
                            >
                                {/* Decorative background gradient (Neutral) */}
                                <div className="absolute inset-0 bg-gradient-to-br from-zinc-50/0 to-zinc-50/0 group-hover:from-zinc-50 group-hover:to-zinc-100/50 transition-all duration-500" />
                                
                                <div className="relative z-10">
                                    <div className="text-3xl text-zinc-900 mb-3 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                                        <HeartFilled />
                                    </div>
                                    <Text className="block text-zinc-700 text-sm font-bold group-hover:text-black transition-colors">
                                        {type.donation_type}
                                    </Text>
                                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 text-[10px] font-black text-zinc-900 uppercase tracking-widest">
                                        + Add to Cart
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <div className="py-20 border-2 border-dashed border-zinc-100 rounded-3xl bg-zinc-50/30 flex items-center justify-center">
                    <Empty description="No categories found" />
                </div>
            )}
        </Card>
    );
};


export default DonationTypes;
