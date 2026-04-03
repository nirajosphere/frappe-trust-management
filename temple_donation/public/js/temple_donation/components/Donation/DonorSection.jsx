import React, { useState, useEffect } from "react";
import { Card, Input, Button, Form, Row, Col, Typography, Space, Badge } from "antd";
import { UserAddOutlined, SearchOutlined, CheckCircleFilled, UserOutlined } from "@ant-design/icons";
import DonorModal from "./DonorModal";

const { Text, Title } = Typography;

const DonorSection = ({ selectedDonor, onDonorSelect }) => {
    const [mobileNumber, setMobileNumber] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (!selectedDonor) {
            setMobileNumber("");
        } else {
            setMobileNumber(selectedDonor.mobile_number);
        }
    }, [selectedDonor]);

    const handleSearch = (value) => {
        setMobileNumber(value);
        if (value.length === 10) {
            setSearching(true);
            frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Donor",
                    filters: { mobile_number: value },
                    fields: ["name", "donor_name", "mobile_number", "address", "email"]
                },
                callback: (r) => {
                    setSearching(false);
                    if (r.message && r.message.length > 0) {
                        onDonorSelect(r.message[0]);
                    } else {
                        onDonorSelect(null);
                    }
                }
            });
        } else {
            onDonorSelect(null);
        }
    };

    const handleNewDonor = (donor) => {
        setIsModalOpen(false);
        setMobileNumber(donor.mobile_number);
        onDonorSelect(donor);
    };

    return (
        <Card 
            title={
                <Space>
                    <UserOutlined className="text-primary" />
                    <span>Donor Information</span>
                </Space>
            } 
            size="small" 
            className="aavatto-card mb-6"
        >
            <Form layout="vertical">
                <Row gutter={24} align="bottom">
                    <Col xs={24} sm={16} md={18}>
                        <Form.Item label={<Text strong className="text-gray-600">Mobile Number Search</Text>} className="mb-0">
                            <Input
                                placeholder="Enter 10-digit mobile number"
                                prefix={<SearchOutlined className="text-gray-400" />}
                                value={mobileNumber}
                                onChange={(e) => handleSearch(e.target.value)}
                                maxLength={10}
                                allowClear
                                className="h-12 rounded-xl text-lg font-medium border-gray-200 hover:border-primary focus:border-primary"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={8} md={6}>
                        {!selectedDonor && mobileNumber.length === 10 && !searching && (
                            <Button
                                type="primary"
                                icon={<UserAddOutlined />}
                                onClick={() => setIsModalOpen(true)}
                                block
                                className="h-12 rounded-xl bg-primary hover:bg-primary-hover border-none font-bold shadow-sm"
                            >
                                Add Donor
                            </Button>
                        )}
                    </Col>
                </Row>

                {selectedDonor && (
                    <div className="mt-6">
                        <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 flex flex-col md:flex-row gap-6 items-center">
                            <div className="bg-white p-4 rounded-full shadow-sm border border-indigo-100 relative">
                                <UserOutlined className="text-4xl text-primary" />
                                <CheckCircleFilled className="text-green-500 absolute bottom-0 right-0 text-xl bg-white rounded-full" />
                            </div>
                            
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 justify-center md:justify-start">
                                            <Title level={4} className="!m-0 !font-bold">{selectedDonor.donor_name}</Title>
                                            <Badge status="processing" text="Verified Donor" className="text-xs font-semibold" />
                                        </div>
                                        <div className="flex flex-wrap gap-4 mt-2 justify-center md:justify-start text-gray-500">
                                            <Space size="small"><Text className="text-gray-500 text-xs">📱 {selectedDonor.mobile_number}</Text></Space>
                                            {selectedDonor.email && <Space size="small"><Text className="text-gray-500 text-xs">✉️ {selectedDonor.email}</Text></Space>}
                                        </div>
                                    </div>
                                    
                                    <Button
                                        type="primary"
                                        danger
                                        ghost
                                        size="middle"
                                        onClick={() => {
                                            onDonorSelect(null);
                                            setMobileNumber("");
                                        }}
                                        className="rounded-lg font-semibold hover:bg-red-50"
                                    >
                                        Change Donor
                                    </Button>
                                </div>
                                
                                {selectedDonor.address && (
                                    <div className="mt-4 pt-4 border-t border-indigo-100 text-center md:text-left">
                                        <Text type="secondary" className="text-sm">📍 {selectedDonor.address}</Text>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Form>

            <DonorModal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSuccess={handleNewDonor}
                initialMobileNumber={mobileNumber}
            />
        </Card>
    );
};

export default DonorSection;
