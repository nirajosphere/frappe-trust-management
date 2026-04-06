import React, { useState, useMemo, useCallback } from "react";
import { Row, Col, Typography, Space, Button, message } from "antd";
import { HeartFilled, RedoOutlined } from "@ant-design/icons";

import DonorSection from "../components/Donation/DonorSection";
import TempleSelect from "../components/Donation/TempleSelect";
import DonationTypes from "../components/Donation/DonationTypes";
import Cart from "../components/Donation/Cart";
import PaymentSection from "../components/Donation/PaymentSection";

const { Title, Text } = Typography;

const Donation = () => {
    // --- State Management ---
    const [selectedDonor, setSelectedDonor] = useState(null);
    const [selectedTemple, setSelectedTemple] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [paymentMode, setPaymentMode] = useState("Cash");
    const [submitting, setSubmitting] = useState(false);

    // Calculate total amount
    const totalAmount = useMemo(() => 
        cartItems.reduce((acc, item) => acc + (item.amount || 0), 0)
    , [cartItems]);

    const handleAddToCart = useCallback((donationType) => {
        if (!selectedTemple) {
            message.warning("Please select a temple first.");
            return;
        }

        // Check if already in cart
        const exists = cartItems.find(item => item.donation_type === donationType.name);
        if (exists) {
            message.info(`${donationType.dontation_type} is already in the cart`);
            return;
        }

        const newItem = {
            donation_type: donationType.name,
            dontation_type: donationType.dontation_type,
            amount: 101 // Default amount
        };
        setCartItems(prev => [...prev, newItem]);
        message.success(`Added ${donationType.dontation_type}`);
    }, [cartItems, selectedTemple]);

    const handleUpdateAmount = useCallback((index, amount) => {
        const newItems = [...cartItems];
        newItems[index].amount = parseFloat(amount) || 0;
        setCartItems(newItems);
    }, [cartItems]);

    const handleRemoveItem = useCallback((index) => {
        setCartItems(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleReset = useCallback(() => {
        setSelectedDonor(null);
        setSelectedTemple(null);
        setCartItems([]);
        setPaymentMode("Cash");
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!selectedDonor) {
            message.error("Please select or add a donor");
            return;
        }
        if (!selectedTemple) {
            message.error("Please select a temple");
            return;
        }
        if (cartItems.length === 0) {
            message.error("Cart is empty. Please add donation types.");
            return;
        }

        setSubmitting(true);
        
        const donationData = {
            donor: selectedDonor.name,
            donor_name: selectedDonor.donor_name,
            mobile_number: selectedDonor.mobile_number,
            temple: selectedTemple,
            cashier: typeof frappe !== "undefined" ? frappe.session.user : "Guest",
            payment_mode: paymentMode,
            total_amount: totalAmount,
            donation_items: cartItems.map(item => ({
                donation_type: item.donation_type,
                amount: item.amount
            }))
        };

        frappe.call({
            method: "frappe.client.insert",
            args: {
                doc: {
                    doctype: "Donation",
                    ...donationData
                }
            },
            callback: (r) => {
                setSubmitting(false);
                if (r.message) {
                    message.success("Donation submitted successfully!");
                    handleReset();
                    // Go back to the donation list
                    if (typeof frappe !== "undefined") {
                        frappe.set_route("temple-donation", "donations");
                    }
                }
            },
            error: (err) => {
                setSubmitting(false);
                message.error(err.message || "Failed to submit donation");
            }
        });
    }, [selectedDonor, selectedTemple, cartItems, paymentMode, totalAmount, handleReset]);

    // --- Render ---
    return (
        <div className="donation-page py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4 animate-fadeIn">
                <Space size="large">
                    <div className="h-14 w-14 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-xl shadow-zinc-900/10 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                        <HeartFilled className="text-2xl text-white" />
                    </div>
                    <div>
                         <Text className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 block mb-1">
                            Operational POS
                        </Text>
                        <Title level={1} className="!m-0 font-black tracking-tight text-zinc-900 !text-3xl">
                            Temple Donation
                        </Title>
                    </div>
                </Space>
                <Button 
                    icon={<RedoOutlined />} 
                    onClick={handleReset}
                    className="h-10 px-6 rounded-xl font-bold bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-900 shadow-sm transition-all"
                >
                    Clear Transaction
                </Button>
            </div>


            <Row gutter={[24, 24]}>
                {/* Left Side: Donor Search, Temple Selection, and Grid */}
                <Col xs={24} lg={15}>
                    <div className="space-y-6">
                        <DonorSection 
                            onDonorSelect={setSelectedDonor} 
                            selectedDonor={selectedDonor} 
                        />
                        
                        <TempleSelect 
                            onTempleSelect={setSelectedTemple} 
                            selectedTemple={selectedTemple} 
                        />
                        
                        <DonationTypes 
                            selectedTemple={selectedTemple} 
                            onAddToCart={handleAddToCart} 
                        />
                    </div>
                </Col>

                {/* Right Side: Cart and Payment */}
                <Col xs={24} lg={9}>
                    <div className="space-y-6 sticky top-6">
                        <Cart 
                            items={cartItems} 
                            onUpdateAmount={handleUpdateAmount} 
                            onRemoveItem={handleRemoveItem}
                            totalAmount={totalAmount}
                        />
                        
                        <PaymentSection 
                            paymentMode={paymentMode} 
                            onPaymentModeChange={setPaymentMode}
                            onSubmit={handleSubmit}
                            loading={submitting}
                            disabled={cartItems.length === 0}
                        />
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Donation;
