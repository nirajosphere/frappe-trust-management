import React from "react";

/**
 * DonationPrint Component
 * A functional print layout strictly following the Gujarati receipt design.
 * Styles are managed in styles.scss under .donation-receipt-container
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
        <div className="print-only donation-receipt-container">
            {/* Header / Mantra */}
            <div className="receipt-mantra">
                ॥ શ્રી સ્વામિનારાયણો વિજયતેતરામ્ ॥
            </div>

            {/* Receipt No Box */}
            <div className="receipt-no-box">
                Receipt No. {donation.name}
            </div>

            {/* Temple Info */}
            <div className="temple-header">
                <div className="temple-name">{donation.temple}</div>
                <div className="trust-no">
                    ટ્રસ્ટ રજી. નં. {donation.trust_registration_no || 'A/1493120'}
                </div>
                <div className="temple-description">
                    શ્રી સ્વામિનારાયણ સંપ્રદાયના સંસ્થાન અમદાવાદ શ્રી નરનારાયણદેવની ગાદીના પ.પૂ.ધર્મધુરંધર ૧૦૦૮ શ્રી કૌશલેન્દ્રપ્રસાદજી મહારાજશ્રીના તાબાના શ્રી સ્વામિનારાયણ મંદિર, {donation.temple || 'Kalupur'} - ૧ તરફથી આ દાખલો આપવામાં આવે છે કે:
                </div>
            </div>

            {/* Donor Line */}
            <div className="donor-info-bar">
                શ્રી {donation.donor_name}, ગામ {donation.city || '-'}, {donation.state || '-'} તરફથી
            </div>

            {/* Table */}
            <table className="receipt-table">
                <thead>
                    <tr>
                        <th style={{ textAlign: 'center' }}>બાબત</th>
                        <th style={{ textAlign: 'center', width: '200px' }}>રકમ</th>
                    </tr>
                </thead>
                <tbody>
                    {(donation.donation_items || []).map((item, idx) => (
                        <tr key={idx}>
                            <td>
                                {item.donation_type_name || item.donation_type}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                ₹{Number(item.amount).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                    <tr className="total-row">
                        <td>Total Amount (કુલ રકમ)</td>
                        <td style={{ textAlign: 'right' }}>
                            ₹{Number(donation.total_amount).toFixed(2)}
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Note & Footer Text */}
            <div className="receipt-footer">
                {donation.note && (
                    <div className="mb-4">
                        <strong className="text-black">નોંધ:</strong> {donation.note}
                    </div>
                )}

                <div className="footer-summary">
                    અંકે રૂપિયા <strong className="text-black text-lg">₹{Number(donation.total_amount).toFixed(2)}/-</strong> તા. <strong>{formatDate(donation.creation)}</strong> ના રોજ <strong>{donation.payment_mode || 'Cash'}</strong> પેટે મળ્યા છે.
                </div>

                <div className="signature-section">
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">લેનાર હસ્તાક્ષર</div>
                        <div className="font-bold text-black border-b border-zinc-900 pb-1">{donation.cashier || 'Cashier'}</div>
                        <div className="text-[10px] text-zinc-500 mt-1">મો. ૮૨૩૮૦૦૧૬૬૬</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-1">તારીખ</div>
                        <div className="font-bold text-black">{formatDate(donation.creation)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonationPrint;
