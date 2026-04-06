import React from "react";

/**
 * DonationPrint Component
 * A functional print layout strictly following the Gujarati receipt design.
 */
const DonationPrint = ({ donation }) => {
    if (!donation) return null;

    // Helper to format date
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    };

    return (
        <div 
            className="print-only" 
            style={{ 
                padding: '40px', 
                fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                color: '#000',
                lineHeight: '1.6',
                width: '100%',
                maxWidth: '800px',
                margin: '0 auto',
                backgroundColor: '#fff'
            }}
        >
            {/* Header / Mantra */}
            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '22px', marginBottom: '15px' }}>
                ॥ શ્રી સ્વામિનારાયણો વિજયતેતરામ્ ॥
            </div>

            {/* Receipt No Box */}
            <div style={{ 
                border: '1px solid #000', 
                borderRadius: '25px', 
                padding: '8px 30px', 
                display: 'inline-block', 
                margin: '0 auto 20px',
                position: 'relative',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '18px',
                fontWeight: 'bold'
            }}>
                Receipt No. {donation.name}
            </div>

            {/* Temple Info */}
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{donation.temple}</div>
                <div style={{ fontSize: '16px', marginTop: '4px' }}>
                    ટ્રસ્ટ રજી. નં. {donation.trust_registration_no || 'A/1493120'}
                </div>
                <div style={{ fontSize: '14px', maxWidth: '600px', margin: '8px auto', textAlign: 'center' }}>
                    શ્રી સ્વામિનારાયણ સંપ્રદાયના સંસ્થાન અમદાવાદ શ્રી નરનારાયણદેવની ગાદીના પ.પૂ.ધર્મધુરંધર ૧૦૦૮ શ્રી કૌશલેન્દ્રપ્રસાદજી મહારાજશ્રીના તાબાના શ્રી સ્વામિનારાયણ મંદિર, {donation.temple || 'Kalupur'} - ૧ તરફથી આ દાખલો આપવામાં આવે છે કે:
                </div>
            </div>

            {/* Donor Line */}
            <div style={{ fontSize: '18px', marginBottom: '20px', padding: '0 20px' }}>
                <strong>શ્રી {donation.donor_name}, ગામ {donation.city || '-'}, {donation.state || '-'} તરફથી</strong>
            </div>

            {/* Table */}
            <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                marginBottom: '20px',
                border: '2px solid #000'
            }}>
                <thead>
                    <tr style={{ backgroundColor: '#f9f9f9' }}>
                        <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontSize: '18px' }}>બાબત</th>
                        <th style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', fontSize: '18px', width: '200px' }}>રકમ</th>
                    </tr>
                </thead>
                <tbody>
                    {(donation.donation_items || []).map((item, idx) => (
                        <tr key={idx}>
                            <td style={{ border: '1px solid #000', padding: '10px', fontSize: '16px' }}>
                                {item.donation_type_name || item.donation_type}
                            </td>
                            <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right', fontSize: '16px', fontWeight: 'bold' }}>
                                ₹{Number(item.amount).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                    {/* Filling empty rows to match height if needed, or just total */}
                    <tr style={{ fontWeight: 'bold', backgroundColor: '#eee' }}>
                        <td style={{ border: '1px solid #000', padding: '10px', fontSize: '18px' }}>Total</td>
                        <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right', fontSize: '18px' }}>
                            ₹{Number(donation.total_amount).toFixed(2)}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Note & Footer Text */}
            <div style={{ padding: '0 20px' }}>
                {donation.note && (
                    <div style={{ marginBottom: '15px' }}>
                        <strong>નોંધ:</strong> {donation.note}
                    </div>
                )}

                <div style={{ fontSize: '16px', marginBottom: '15px' }}>
                    અંકે રૂપિયા <strong>₹{Number(donation.total_amount).toFixed(2)}/-</strong> તા. <strong>{formatDate(donation.creation)}</strong> ના રોજ <strong>{donation.payment_mode || 'Cash'}</strong> પેટે મળ્યા છે.
                </div>

                <div style={{ marginTop: '30px' }}>
                    <div>નાણા લેનાર - <strong>{donation.cashier || 'Cashier'}</strong></div>
                    <div>મો. ૮૨૩૮૦૦૧૬૬૬</div>
                </div>
            </div>
            
            {/* CSS to ensure print layout is clean */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media screen {
                    .print-only { display: none !important; }
                }
                @media print {
                    body * { visibility: hidden; }
                    .print-only, .print-only * { visibility: visible; }
                    .print-only { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100% !important; 
                        padding: 0 !important;
                        display: block !important;
                    }
                    .no-print { display: none !important; }
                }
            ` }} />
        </div>
    );
};

export default DonationPrint;
