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
                    <SafetyCertificateOutlined className="text-primary" />
                    <span className="font-bold">Payment & Confirmation</span>
                </Space>
            } 
            size="small" 
            className="aavatto-card"
        >
            <div className="mb-6">
                <Text strong className="text-gray-600 block mb-4 uppercase text-xs tracking-widest">
                    Mode of Payment
                </Text>
                
                <div className="grid grid-cols-2 gap-3">
                    {paymentModes.map(mode => (
                        <button
                            key={mode.value}
                            onClick={() => onPaymentModeChange(mode.value)}
                            className={`
                                flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200
                                ${paymentMode === mode.value 
                                    ? `border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary/20` 
                                    : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                                }
                            `}
                        >
                            <div className={`text-2xl mb-1 ${paymentMode === mode.value ? 'text-primary' : 'text-gray-400'}`}>
                                {mode.icon}
                            </div>
                            <span className="font-bold text-xs uppercase tracking-wide">{mode.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 mb-6 flex items-start gap-3">
                <CheckCircleOutlined className="mt-1 text-blue-500" />
                <div className="text-[12px] leading-relaxed text-blue-800">
                    By submitting, you confirm that the donor details and donation amounts are correct. A receipt will be generated automatically.
                </div>
            </div>

            <Button
                type="primary"
                size="large"
                block
                icon={<CheckCircleOutlined className="text-lg" />}
                onClick={onSubmit}
                loading={loading}
                disabled={disabled}
                className={`
                    h-16 rounded-2xl text-lg font-black tracking-tight shadow-lg transition-all
                    ${disabled 
                        ? 'bg-gray-200 border-gray-200 text-gray-400' 
                        : 'bg-primary border-none shadow-primary/30 hover:scale-[1.02] active:scale-95'
                    }
                `}
            >
                {loading ? 'PROCESSING...' : 'CONFIRM DONATION'}
            </Button>
            
            {!disabled && (
                <div className="mt-4 text-center">
                    <Tag color="success" className="rounded-full border-none px-3 py-1 font-bold text-[10px] uppercase tracking-widest bg-green-50 text-green-600">
                        System Ready for Transaction
                    </Tag>
                </div>
            )}
        </Card>
    );
};

export default PaymentSection;
