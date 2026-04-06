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
        { label: "Cash", value: "Cash", icon: <WalletOutlined />, color: "orange" },
        { label: "UPI/Online", value: "UPI", icon: <QrcodeOutlined />, color: "blue" },
        { label: "Card", value: "Card", icon: <CreditCardOutlined />, color: "purple" },
        { label: "Cheque", value: "Cheque", icon: <ProfileOutlined />, color: "cyan" },
    ];

    return (
        <Card
            title={
                <Space>
                    <SafetyCertificateOutlined className="text-zinc-900" />
                    <span className="font-bold tracking-tight text-zinc-800 text-lg">Payment Confirmation</span>
                </Space>
            }
            size="small"
            className="aavatto-card"
        >
            <div className="mb-8 mt-2">
                <Text className="text-zinc-400 block mb-6 uppercase text-[10px] font-black tracking-[0.2em] ml-1">
                    Select Payment Gateway
                </Text>

                <div className="grid grid-cols-2 gap-4">
                    {paymentModes.map(mode => (
                        <button
                            key={mode.value}
                            onClick={() => onPaymentModeChange(mode.value)}
                            className={`
                                flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300 group
                                ${paymentMode === mode.value
                                    ? `border-black bg-zinc-50 text-black shadow-xl shadow-zinc-900/10 ring-1 ring-black/20 scale-105 z-10 font-black`
                                    : 'border-zinc-100 bg-white text-zinc-400 hover:border-zinc-200 hover:bg-zinc-50/50 font-bold'
                                }
                            `}
                        >
                            <div className={`text-3xl mb-3 transition-transform duration-300 group-hover:scale-110 ${paymentMode === mode.value ? 'text-black' : 'text-zinc-300'}`}>
                                {mode.icon}
                            </div>
                            <span className="text-[11px] uppercase tracking-widest">{mode.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-zinc-50/80 p-5 rounded-3xl border border-zinc-200/50 mb-8 flex items-start gap-4 shadow-inner">
                <div className="bg-white p-2  shadow-sm">
                    <CheckCircleOutlined className="text-zinc-900 text-xl" />
                </div>
                <div className="text-[12px] leading-relaxed text-zinc-800/70 font-medium italic">
                    By clicking Confirm, you verify that donor identity and selected donation items are accurate. This will generate an official temple receipt.
                </div>
            </div>

            <Button
                type="primary"
                size="large"
                block
                icon={<CheckCircleOutlined className="text-xl" />}
                onClick={onSubmit}
                loading={loading}
                disabled={disabled}
                className={`
                    h-18 rounded-[24px] text-lg font-black tracking-tight shadow-2xl transition-all duration-300 border-none
                    ${disabled
                        ? 'bg-zinc-200 text-zinc-400 scale-95 opacity-50'
                        : 'bg-black shadow-zinc-900/40 hover:scale-[1.02] hover:bg-zinc-800 active:scale-95 text-white'
                    }
                `}
            >
                {loading ? 'PROCESSING...' : 'CONFIRM donation'}
            </Button>

            {!disabled && (
                <div className="mt-6 text-center animate-bounce-slow">
                    <Tag className="rounded-full border-none px-4 py-1 font-bold text-[10px] uppercase tracking-widest bg-zinc-50 text-zinc-600 shadow-sm border border-zinc-100">
                        Secure Transaction Ready
                    </Tag>
                </div>
            )}
        </Card>
    );
};


export default PaymentSection;
