import React, { useState, useMemo, useCallback } from "react";
import { Row, Col, Typography, Space, Button, message } from "antd";
import { HeartFilled, RedoOutlined } from "@ant-design/icons";

import DonorSection from "../../components/Donation/DonorSection";
import TempleSelect from "../../components/Donation/TempleSelect";
import DonationTypes from "../../components/Donation/DonationTypes";
import Cart from "../../components/Donation/Cart";
import PaymentSection from "../../components/Donation/PaymentSection";
import AddPageHeader from "../../components/common/AddPageHeader";

const { Title, Text } = Typography;

const Donation = ({ onBack }) => {
    // --- State Management ---
    const [selectedDonor, setSelectedDonor] = useState(null);
    const [selectedTemple, setSelectedTemple] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [paymentMode, setPaymentMode] = useState("Cash");
    const [submitting, setSubmitting] = useState(false);
    const [donorMobile, setDonorMobile] = useState("");

    // Synchronize cart with selected temples
    // If a temple is unselected, remove its items from the cart
    React.useEffect(() => {
        if (!selectedTemple || selectedTemple.length === 0) {
            setCartItems([]);
        } else {
            setCartItems(prev => prev.filter(item => selectedTemple.includes(item.temple)));
        }
    }, [selectedTemple]);

    // Calculate total amount
    const totalAmount = useMemo(() =>
        cartItems.reduce((acc, item) => acc + (item.amount || 0), 0)
        , [cartItems]);

    const handleToggleCart = useCallback((donationType) => {
        if (!selectedTemple || selectedTemple.length === 0) {
            message.warning("Please select at least one trust.");
            return;
        }

        // Check if already in cart
        const existingIndex = cartItems.findIndex(item => item.donation_type === donationType.name);
        
        if (existingIndex > -1) {
            // Remove if exists
            setCartItems(prev => prev.filter((_, i) => i !== existingIndex));
            message.info(`Removed ${donationType.donation_type}`);
        } else {
            // Add if not exists
            const newItem = {
                donation_type: donationType.name,
                donation_type_label: donationType.donation_type,
                amount: donationType.default_amount || 101,
                temple: donationType.temple
            };
            setCartItems(prev => [...prev, newItem]);
            message.success(`Added ${donationType.donation_type}`);
        }
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
        setSelectedTemple([]);
        setCartItems([]);
        setPaymentMode("Cash");
        setDonorMobile("");
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!selectedDonor) {
            message.error("Please select or add a donor");
            return;
        }
        if (!selectedTemple || selectedTemple.length === 0) {
            message.error("Please select at least one trust");
            return;
        }
        if (cartItems.length === 0) {
            message.error("Cart is empty. Please add donation types.");
            return;
        }

        setSubmitting(true);

        // Group items by temple
        const itemsByTemple = cartItems.reduce((acc, item) => {
            const t = item.temple || selectedTemple[0]; // Fallback if item has no temple
            if (!acc[t]) acc[t] = [];
            acc[t].push(item);
            return acc;
        }, {});

        const templeNames = Object.keys(itemsByTemple);
        let successCount = 0;
        let errorMessages = [];

        for (const tName of templeNames) {
            const templeItems = itemsByTemple[tName];
            const templeTotal = templeItems.reduce((sum, i) => sum + (i.amount || 0), 0);

            const donationData = {
                donor: selectedDonor.name,
                donor_name: selectedDonor.donor_name,
                mobile_number: selectedDonor.mobile_number,
                temple: tName,
                cashier: typeof frappe !== "undefined" ? frappe.session.user : "Guest",
                payment_mode: paymentMode,
                total_amount: templeTotal,
                donation_items: templeItems.map(item => ({
                    donation_type: item.donation_type,
                    amount: item.amount
                }))
            };

            await new Promise((resolve) => {
                frappe.call({
                    method: "frappe.client.insert",
                    args: {
                        doc: {
                            doctype: "Donation",
                            ...donationData
                        }
                    },
                    callback: (r) => {
                        if (r.message) {
                            successCount++;
                        }
                        resolve();
                    },
                    error: (err) => {
                        errorMessages.push(`Trust ${tName}: ${err.message || 'Failed'}`);
                        resolve();
                    }
                });
            });
        }

        setSubmitting(false);
        if (successCount === templeNames.length) {
            message.success("All donations processed successfully!");
            setSelectedDonor(null);
            setSelectedTemple([]);
            setCartItems([]);
            setDonorMobile("");
        } else if (successCount > 0) {
            message.warning(`Processed ${successCount} of ${templeNames.length} donations. Errors: ${errorMessages.join(', ')}`);
            // Only clear items that were successfully processed? Tricky.
            // For now just keep everything or let user resolve.
        } else {
            message.error(`Failed to process donations. ${errorMessages.join(', ')}`);
        }
    }, [selectedDonor, selectedTemple, cartItems, paymentMode, totalAmount]);

    // --- Render ---
    return (
        <div className="donation-page py-6">
            <AddPageHeader
                title="Donation Portal"
                subtitle="Operational POS"
                showBack={true}
                onBack={onBack || (() => {
                    if (typeof frappe !== "undefined") {
                        frappe.set_route("temple-donation", "donations");
                    } else {
                        window.history.back();
                    }
                })}
                showReset={true}
                onReset={handleReset}
            />

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={15}>
                    <div className="space-y-6">
                        <DonorSection
                            onDonorSelect={setSelectedDonor}
                            selectedDonor={selectedDonor}
                            mobile={donorMobile}
                            setMobile={setDonorMobile}
                        />

                        <TempleSelect
                            onTempleSelect={setSelectedTemple}
                            selectedTemple={selectedTemple}
                        />

                        <DonationTypes
                            selectedTemple={selectedTemple}
                            onToggleCart={handleToggleCart}
                            cartItems={cartItems}
                        />
                    </div>
                </Col>

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
