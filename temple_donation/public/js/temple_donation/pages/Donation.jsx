import React from "react";
import { Row, Col, Typography, Space, Button } from "antd";
import { HeartFilled, RedoOutlined } from "@ant-design/icons";

import DonorSection from "../components/Donation/DonorSection";
import TempleSelect from "../components/Donation/TempleSelect";
import DonationTypes from "../components/Donation/DonationTypes";
import Cart from "../components/Donation/Cart";
import PaymentSection from "../components/Donation/PaymentSection";
import { useDonation } from "../context/DonationContext";

const { Title } = Typography;

const Donation = () => {
    const { 
        isSubmitting, 
        handleReset, 
        cartItems 
    } = useDonation();

    return (
        <div className="container mx-auto py-8 px-4 lg:px-0">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <Space align="center" size="middle">
                    <div className="bg-primary/10 p-3 rounded-2xl">
                        <HeartFilled className="text-3xl text-primary" />
                    </div>
                    <div>
                        <Title level={2} className="!m-0 !font-extrabold !tracking-tight">
                            Temple Donation POS
                        </Title>
                        <p className="text-gray-500 m-0">Manage temple donations efficiently</p>
                    </div>
                </Space>
                
                <Button
                    icon={<RedoOutlined />}
                    onClick={handleReset}
                    type="default"
                    className="rounded-lg hover:border-primary hover:text-primary transition-all"
                >
                    Reset Form
                </Button>
            </div>

            <Row gutter={[32, 32]}>
                {/* Left Side: Donor Search, Temple Selection, and Grid */}
                <Col xs={24} lg={15}>
                    <div className="space-y-8">
                        <DonorSection />
                        <TempleSelect />
                        <DonationTypes />
                    </div>
                </Col>

                {/* Right Side: Cart and Payment */}
                <Col xs={24} lg={9}>
                    <div className="space-y-8 sticky top-24">
                        <Cart />
                        <PaymentSection />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Donation;
