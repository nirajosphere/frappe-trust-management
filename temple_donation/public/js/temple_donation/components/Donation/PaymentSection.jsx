// import React from "react";
// import { Card, Button } from "antd";

// const PaymentSection = ({ paymentMode, onPaymentModeChange, onSubmit, loading, disabled }) => {
//     const modes = ["Cash", "UPI", "Card", "Cheque"];

//     return (
//         <Card title="Payment Selection" size="small">
//             <div style={{ marginBottom: 12 }}>
//                 {modes.map(m => (
//                     <Button
//                         key={m}
//                         type={paymentMode === m ? "primary" : "default"}
//                         onClick={() => onPaymentModeChange(m)}
//                         style={{ marginRight: 8 }}
//                     >
//                         {m}
//                     </Button>
//                 ))}
//             </div>

//             <Button
//                 type="primary"
//                 block
//                 loading={loading}
//                 disabled={disabled}
//                 onClick={onSubmit}
//             >
//                 Confirm Donation
//             </Button>
//         </Card>
//     );
// };

// export default PaymentSection;

import React from "react";
import { Card, Button, Row, Col } from "antd";

const PaymentSection = ({ paymentMode, onPaymentModeChange, onSubmit, loading, disabled }) => {
    const modes = [
        { name: "Cash", icon: "💵" },
        { name: "UPI", icon: "📱" },
        { name: "Card", icon: "💳" },
        { name: "Cheque", icon: "📝" }
    ];

    return (
        <Card 
            title={<span style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px' }}>Payment Selection</span>}
            size="small"
            style={{ borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: 'none' }}
            headStyle={{ borderBottom: '1px solid #f3f4f6', padding: '12px 16px', background: '#f9fafb' }}
            bodyStyle={{ padding: '16px' }}
        >
            <Row gutter={[8, 8]} style={{ marginBottom: '20px' }}>
                {modes.map(m => {
                    const isActive = paymentMode === m.name;
                    return (
                        <Col span={12} key={m.name}>
                            <div
                                onClick={() => onPaymentModeChange(m.name)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    border: isActive ? '1px solid #111827' : '1px solid #e5e7eb',
                                    background: isActive ? '#f8fafc' : '#ffffff',
                                    transition: 'all 0.2s ease',
                                    height: '100%',
                                }}
                            >
                                <span style={{ fontSize: '20px' }}>{m.icon}</span>
                                <span style={{ 
                                    fontWeight: isActive ? 600 : 500, 
                                    color: isActive ? '#111827' : '#4b5563',
                                    fontSize: '13px'
                                }}>
                                    {m.name}
                                </span>
                            </div>
                        </Col>
                    );
                })}
            </Row>

            <Button
                type="primary"
                block
                loading={loading}
                disabled={disabled}
                onClick={onSubmit}
                style={{
                    height: '42px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    background: disabled ? '#f3f4f6' : '#111827',
                    borderColor: disabled ? '#e5e7eb' : '#111827',
                    color: disabled ? '#9ca3af' : '#ffffff',
                    boxShadow: 'none'
                }}
            >
                Confirm Donation
            </Button>
        </Card>
    );
};

export default PaymentSection;