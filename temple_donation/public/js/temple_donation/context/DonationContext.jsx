import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { message } from 'antd';

const DonationContext = createContext();

export const DonationProvider = ({ children }) => {
    const [selectedDonor, setSelectedDonor] = useState(null);
    const [selectedTemple, setSelectedTemple] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const totalAmount = useMemo(() => 
        cartItems.reduce((sum, item) => sum + (item.amount || 0), 0)
    , [cartItems]);

    const handleAddToCart = useCallback((donationType) => {
        if (!selectedTemple) {
            message.warning("Please select a temple first.");
            return;
        }

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

    const resetPOS = useCallback(() => {
        setSelectedDonor(null);
        setSelectedTemple(null);
        setCartItems([]);
        setPaymentMode('Cash');
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!selectedDonor) {
            message.error("Please select a donor first");
            return;
        }
        if (cartItems.length === 0) {
            message.error("Cart is empty");
            return;
        }

        setIsSubmitting(true);
        
        const donationData = {
            donor: selectedDonor.name,
            donor_name: selectedDonor.donor_name,
            temple: selectedTemple,
            payment_mode: paymentMode,
            total_amount: totalAmount,
            items: cartItems.map(item => ({
                donation_type: item.donation_type,
                amount: item.amount
            }))
        };

        frappe.call({
            method: "temple_donation.api.create_donation", // Replace with actual API endpoint
            args: { data: donationData },
            callback: (r) => {
                setIsSubmitting(false);
                if (!r.exc) {
                    message.success("Donation recorded successfully!");
                    resetPOS();
                }
            }
        });
    }, [selectedDonor, selectedTemple, cartItems, paymentMode, totalAmount, resetPOS]);

    const value = {
        selectedDonor, setSelectedDonor,
        selectedTemple, setSelectedTemple,
        cartItems, setCartItems,
        paymentMode, setPaymentMode,
        isSubmitting,
        totalAmount,
        handleAddToCart,
        handleUpdateAmount,
        handleRemoveItem,
        handleSubmit,
        resetPOS
    };

    return (
        <DonationContext.Provider value={value}>
            {children}
        </DonationContext.Provider>
    );
};

export const useDonation = () => {
    const context = useContext(DonationContext);
    if (!context) {
        throw new Error("useDonation must be used within a DonationProvider");
    }
    return context;
};
