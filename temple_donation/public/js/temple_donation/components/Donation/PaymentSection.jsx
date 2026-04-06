import React from "react";
import { Card, Button, Space, Typography, Tag } from "antd";
import {
    CheckCircleOutlined,
    WalletOutlined,
    CreditCardOutlined,
    QrcodeOutlined,
    ProfileOutlined,
    SafetyCertificateOutlined
} from "@ant-design/icons";

const { Text } = Typography;

const PaymentSection = ({
    paymentMode,
    onPaymentModeChange,
    onSubmit,
    loading,
    disabled
}) => {
    const paymentModes = [
        { label: "Cash", value: "Cash", icon: <WalletOutlined /> },
        { label: "UPI", value: "UPI", icon: <QrcodeOutlined /> },
        { label: "Card", value: "Card", icon: <CreditCardOutlined /> },
        { label: "Cheque", value: "Cheque", icon: <ProfileOutlined /> },
    ];

    return (
        <Card
            title={
                <Space>
                    <SafetyCertificateOutlined className="text-zinc-900" />
                    <span className="font-bold tracking-tight text-zinc-800">Payment Selection</span>
                </Space>
            }
            size="small"
            className="aavatto-card"
        >
            <div className="mb-6 mt-2 px-1">
                <Text className="text-zinc-400 block mb-4 uppercase text-[10px] font-bold tracking-widest">
                    Select Mode
                </Text>

                <div className="grid grid-cols-2 gap-3">
                    {paymentModes.map(mode => (
                        <button
                            key={mode.value}
                            onClick={() => !loading && onPaymentModeChange(mode.value)}
                            className={`
                                flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
                                ${paymentMode === mode.value
                                    ? `border-black bg-zinc-50 text-black font-bold`
                                    : 'border-zinc-100 bg-white text-zinc-400 hover:border-zinc-200'
                                }
                                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            <div className={`text-2xl mb-2 ${paymentMode === mode.value ? 'text-black' : 'text-zinc-300'}`}>
                                {mode.icon}
                            </div>
                            <span className="text-[11px] uppercase tracking-wider">{mode.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 mb-6 flex items-start gap-3">
                <CheckCircleOutlined className="text-zinc-900 text-lg mt-0.5" />
                <div className="text-[11px] leading-snug text-zinc-600 font-medium italic">
                    Verify donor identity and donation items before confirmation.
                </div>
            </div>

            <Button
                type="primary"
                size="large"
                block
                loading={loading}
                disabled={disabled}
                onClick={onSubmit}
                className={`
                    h-14 rounded-xl text-base font-bold transition-all
                    ${disabled ? 'bg-zinc-100 text-zinc-300' : 'bg-black hover:bg-zinc-800 text-white shadow-lg'}
                `}
            >
                {loading ? 'Processing...' : 'Confirm Donation'}
            </Button>
        </Card>
    );
};

export default PaymentSection;
