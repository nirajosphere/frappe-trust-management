// import React, { useState } from "react";

// import { Card, Input, Button, Typography } from "antd";
// import DonorModal from "./DonorModal";

// const { Text } = Typography;

// const DonorSection = ({ selectedDonor, onDonorSelect }) => {
//     const [mobile, setMobile] = useState("");
//     const [modal, setModal] = useState(false);

//     const search = (val) => {
//         setMobile(val);

//         if (val.length === 10) {
//             frappe.call({
//                 method: "frappe.client.get_list",
//                 args: {
//                     doctype: "Donor",
//                     filters: { mobile_number: val },
//                     fields: ["name", "donor_name", "mobile_number"]
//                 },
//                 callback: (r) => {
//                     if (r.message && r.message.length) {
//                         onDonorSelect(r.message[0]);
//                     } else {
//                         onDonorSelect(null);
//                     }
//                 }
//             });
//         } else {
//             onDonorSelect(null);
//         }
//     };

//     return (
//         <Card title="Donor Information" size="small">
//             <Input
//                 placeholder="Enter mobile number"
//                 value={mobile}
//                 onChange={(e) => search(e.target.value)}
//                 maxLength={10}
//             />

//             {!selectedDonor && mobile.length === 10 && (
//                 <Button onClick={() => setModal(true)} style={{ marginTop: 8 }}>
//                     Add Donor
//                 </Button>
//             )}

//             {selectedDonor && (
//                 <div
//                     style={{
//                         marginTop: 14,
//                         padding: "12px 14px",
//                         backgroundColor: "#f9fafb",
//                         borderRadius: 10,
//                         border: "1px solid #e5e7eb",
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 12,
//                         transition: "all 0.3s ease",
//                         animation: "donorCardFadeIn 0.35s ease",
//                     }}
//                 >
//                     {/* Avatar */}
//                     <div
//                         style={{
//                             width: 40,
//                             height: 40,
//                             borderRadius: 10,
//                             background: "linear-gradient(135deg, #1e293b, #334155)",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                             flexShrink: 0,
//                             color: "#fff",
//                             fontSize: 18,
//                             fontWeight: 700,
//                         }}
//                     >
//                         {(selectedDonor.donor_name || "?").charAt(0).toUpperCase()}
//                     </div>

//                     {/* Info */}
//                     <div style={{ flex: 1, minWidth: 0 }}>
//                         <div
//                             style={{
//                                 fontWeight: 600,
//                                 fontSize: 14,
//                                 color: "#1e293b",
//                                 whiteSpace: "nowrap",
//                                 overflow: "hidden",
//                                 textOverflow: "ellipsis",
//                                 lineHeight: 1.3,
//                             }}
//                         >
//                             {selectedDonor.donor_name || "—"}
//                         </div>
//                         <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
//                             📱 {selectedDonor.mobile_number}
//                         </div>
//                     </div>

//                     {/* Change Button */}
//                     <Button
//                         size="small"
//                         danger
//                         type="link"
//                         onClick={() => onDonorSelect(null)}
//                         style={{ fontWeight: 600, flexShrink: 0 }}
//                     >
//                         Change
//                     </Button>

//                     <style>{`
//                         @keyframes donorCardFadeIn {
//                             from { opacity: 0; transform: translateY(6px); }
//                             to   { opacity: 1; transform: translateY(0); }
//                         }
//                     `}</style>
//                 </div>
//             )}

//             <DonorModal
//                 open={modal}
//                 onCancel={() => setModal(false)}
//                 onSuccess={(newDonor) => {
//                     onDonorSelect(newDonor);
//                     setModal(false);
//                 }}
//                 initialMobileNumber={mobile}
//             />
//         </Card>
//     );
// };

// export default DonorSection;



import React, { useState } from "react";
import { Card, Input, Button } from "antd";
import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import DonorModal from "./DonorModal";

const DonorSection = ({ selectedDonor, onDonorSelect }) => {
    const [mobile, setMobile] = useState("");
    const [modal, setModal] = useState(false);

    const search = (val) => {
        setMobile(val);
        if (val.length === 10) {
            frappe.call({
                method: "frappe.client.get_list",
                args: {
                    doctype: "Donor",
                    filters: { mobile_number: val },
                    fields: ["name", "donor_name", "mobile_number"]
                },
                callback: (r) => {
                    if (r.message && r.message.length) {
                        onDonorSelect(r.message[0]);
                    } else {
                        onDonorSelect(null);
                    }
                }
            });
        } else {
            onDonorSelect(null);
        }
    };

    return (
        <Card 
            title={<span style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px' }}>Donor Information</span>}
            size="small"
            style={{ borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: 'none' }}
            headStyle={{ borderBottom: '1px solid #f3f4f6', padding: '12px 16px' }}
            bodyStyle={{ padding: '16px' }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Input
                    placeholder="Search by 10-digit mobile number"
                    value={mobile}
                    onChange={(e) => search(e.target.value)}
                    maxLength={10}
                    prefix={<SearchOutlined style={{ color: '#9ca3af', marginRight: '4px' }} />}
                    style={{ height: '40px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '14px' }}
                />

                {!selectedDonor && mobile.length === 10 && (
                    <Button 
                        type="primary" 
                        icon={<UserAddOutlined />}
                        onClick={() => setModal(true)} 
                        style={{ height: '40px', background: '#111827', borderColor: '#111827', borderRadius: '6px', fontWeight: 500 }}
                    >
                        Add New Donor
                    </Button>
                )}

                {selectedDonor && (
                    <div style={{ padding: "12px 16px", backgroundColor: "#ffffff", borderRadius: "6px", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "6px", background: "#1f2937", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#ffffff", fontSize: "14px", fontWeight: 700 }}>
                            {(selectedDonor.donor_name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '14px', color: "#111827", lineHeight: 1.2 }}>{selectedDonor.donor_name || "—"}</div>
                            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>📱 {selectedDonor.mobile_number}</div>
                        </div>
                        <Button size="small" danger type="link" onClick={() => { onDonorSelect(null); setMobile(""); }} style={{ fontWeight: 600, fontSize: '13px', color: '#ef4444', paddingRight: 0 }}>
                            Change
                        </Button>
                    </div>
                )}
            </div>

            <DonorModal open={modal} onCancel={() => setModal(false)} onSuccess={(newDonor) => { onDonorSelect(newDonor); setModal(false); setMobile(newDonor.mobile_number); }} initialMobileNumber={mobile} />
        </Card>
    );
};

export default DonorSection;