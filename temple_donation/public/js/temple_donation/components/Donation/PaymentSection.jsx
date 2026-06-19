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
import { Card, Button } from "antd";

const PaymentSection = ({ paymentMode, onPaymentModeChange, onSubmit, loading, disabled }) => {
    const modes = ["Cash", "UPI", "Card", "Cheque"];

    return (
        <Card 
            title={<span style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px' }}>Payment Selection</span>}
            size="small"
            style={{ borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: 'none' }}
            headStyle={{ borderBottom: '1px solid #f3f4f6', padding: '12px 16px' }}
            bodyStyle={{ padding: '16px' }}
        >
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {modes.map(m => {
                    const isActive = paymentMode === m;
                    return (
                        <Button
                            key={m}
                            onClick={() => onPaymentModeChange(m)}
                            style={{
                                height: '36px',
                                padding: '0 16px',
                                borderRadius: '6px',
                                fontWeight: 500,
                                transition: 'all 0.2s ease',
                                background: isActive ? '#111827' : '#ffffff',
                                color: isActive ? '#ffffff' : '#374151',
                                borderColor: isActive ? '#111827' : '#e5e7eb',
                                boxShadow: 'none'
                            }}
                        >
                            {m}
                        </Button>
                    );
                })}
            </div>

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