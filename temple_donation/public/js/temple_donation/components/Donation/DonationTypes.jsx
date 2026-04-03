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
                fields: ["name", "dontation_type", "temple",]
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
            <Card className="aavatto-card min-h-[300px] flex items-center justify-center border-dashed border-2 border-gray-200 bg-gray-50/30">
                <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <span className="text-gray-400 font-medium italic">
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
                    <AppstoreOutlined className="text-primary" />
                    <span>Donation Types</span>
                </Space>
            } 
            size="small" 
            className="aavatto-card"
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Spin size="large" />
                    <Text className="text-gray-400 animate-pulse">Fetching donation categories...</Text>
                </div>
            ) : donationTypes.length > 0 ? (
                <Row gutter={[16, 16]}>
                    {donationTypes.map(type => (
                        <Col key={type.name} xs={12} sm={8} md={8} lg={6}>
                            <Card
                                hoverable
                                onClick={() => onAddToCart(type)}
                                className="group relative overflow-hidden rounded-2xl border-gray-100 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white"
                                bodyStyle={{ padding: '24px 16px', textAlign: 'center' }}
                            >
                                {/* Decorative background circle */}
                                <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                                
                                <div className="relative z-10">
                                    <div className="text-3xl text-primary mb-3 transform group-hover:scale-110 transition-transform duration-300">
                                        <HeartFilled />
                                    </div>
                                    <Text strong className="block text-gray-800 text-sm group-hover:text-primary transition-colors">
                                        {type.dontation_type}
                                    </Text>
                                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-primary uppercase tracking-widest">
                                        Click to Add
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <div className="py-12 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                    <Empty description="No donation types found for this temple" />
                </div>
            )}
        </Card>
    );
};

export default DonationTypes;
