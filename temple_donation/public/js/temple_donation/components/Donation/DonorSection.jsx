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
                    <UserOutlined className="text-zinc-900" />
                    <span className="font-bold tracking-tight text-zinc-800">Donor Information</span>
                </Space>
            }
            size="small"
            className="aavatto-card mb-6"
        >
            <Form layout="vertical">
                <Row gutter={24} align="bottom">
                    <Col xs={24} sm={16} md={18}>
                        <Form.Item label={<Text strong className="text-zinc-500 ml-1">Mobile Number Search</Text>} className="mb-0">
                            <Input
                                placeholder="Enter 10-digit mobile number"
                                prefix={<SearchOutlined className="text-zinc-400" />}
                                value={mobileNumber}
                                onChange={(e) => handleSearch(e.target.value)}
                                maxLength={10}
                                allowClear
                                className="h-12  text-lg font-medium border-zinc-200 bg-zinc-50/30 focus:bg-white hover:border-black focus:border-black transition-all"
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
                                className="h-12  bg-black hover:bg-zinc-800 border-none font-bold shadow-lg shadow-zinc-900/10"
                            >
                                Add Donor
                            </Button>
                        )}
                    </Col>
                </Row>

                {selectedDonor && (
                    <div className="mt-8 animate-fadeIn">
                        <div className="bg-zinc-50/50  p-6 border border-zinc-200/50 flex flex-col md:flex-row gap-6 items-center shadow-inner">
                            <div className="bg-white p-5  shadow-sm border border-zinc-100 relative">
                                <UserOutlined className="text-4xl text-zinc-900" />
                                <CheckCircleFilled className="text-zinc-900 absolute -bottom-1 -right-1 text-2xl bg-white rounded-full shadow-md" />
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3 justify-center md:justify-start">
                                            <Title level={4} className="!m-0 !font-black !text-zinc-900 tracking-tight">{selectedDonor.donor_name}</Title>
                                            <Badge status="processing" color="black" text="Verified" className="text-[10px] font-black uppercase tracking-widest text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full" />
                                        </div>
                                        <div className="flex flex-wrap gap-5 mt-3 justify-center md:justify-start text-zinc-500">
                                            <Space size={6} className="text-xs font-bold text-zinc-500">📱 {selectedDonor.mobile_number}</Space>
                                            {selectedDonor.email && <Space size={6} className="text-xs font-bold text-zinc-500">✉️ {selectedDonor.email}</Space>}
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
                                        className=" font-bold border-zinc-200 text-zinc-500 hover:bg-zinc-50 bg-white"
                                    >
                                        Change
                                    </Button>
                                </div>

                                {selectedDonor.address && (
                                    <div className="mt-5 pt-5 border-t border-zinc-100 text-center md:text-left">
                                        <Text className="text-zinc-500 text-sm italic font-medium">📍 {selectedDonor.address}</Text>
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
