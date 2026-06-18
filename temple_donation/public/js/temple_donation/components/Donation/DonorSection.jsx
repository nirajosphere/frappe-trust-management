// import React, { useState, useEffect } from "react";
// import { Card, Input, Button, Form, Row, Col, Typography, Space, Badge } from "antd";
// import { UserAddOutlined, SearchOutlined, CheckCircleFilled, UserOutlined } from "@ant-design/icons";
// import DonorModal from "./DonorModal";

// const { Text, Title } = Typography;

// const DonorSection = ({ selectedDonor, onDonorSelect }) => {
//     const [mobileNumber, setMobileNumber] = useState("");
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [searching, setSearching] = useState(false);

//     useEffect(() => {
//         if (!selectedDonor) {
//             setMobileNumber("");
//         } else {
//             setMobileNumber(selectedDonor.mobile_number);
//         }
//     }, [selectedDonor]);

//     const handleSearch = (value) => {
//         setMobileNumber(value);
//         if (value.length === 10) {
//             setSearching(true);
//             frappe.call({
//                 method: "frappe.client.get_list",
//                 args: {
//                     doctype: "Donor",
//                     filters: { mobile_number: value },
//                     fields: ["name", "donor_name", "mobile_number", "address", "email", "city"]
//                 },
//                 callback: (r) => {
//                     setSearching(false);
//                     if (r.message && r.message.length > 0) {
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

//     const handleNewDonor = (donor) => {
//         setIsModalOpen(false);
//         setMobileNumber(donor.mobile_number);
//         onDonorSelect(donor);
//     };

//     return (
//         <Card
//             title={
//                 <Space>
//                     <UserOutlined className="text-zinc-900" />
//                     <span className="font-bold tracking-tight text-zinc-800">Donor Information</span>
//                 </Space>
//             }
//             size="small"
//             className="aavatto-card"
//         >
//             <Form layout="vertical">
//                 <Row gutter={16} align="bottom">
//                     <Col xs={24} sm={16} md={18}>
//                         <Form.Item label={<Text strong className="text-zinc-500">Mobile Number Search</Text>} className="mb-0">
//                             <Input
//                                 placeholder="Enter 10-digit mobile number"
//                                 prefix={<SearchOutlined className="text-zinc-400" />}
//                                 value={mobileNumber}
//                                 onChange={(e) => handleSearch(e.target.value)}
//                                 maxLength={10}
//                                 allowClear
//                                 className="h-10 text-base font-medium border-zinc-200 bg-zinc-50 focus:bg-white transition-all rounded"
//                             />
//                         </Form.Item>
//                     </Col>
//                     <Col xs={24} sm={8} md={6}>
//                         {!selectedDonor && mobileNumber.length === 10 && !searching && (
//                             <Button
//                                 type="primary"
//                                 icon={<UserAddOutlined />}
//                                 onClick={() => setIsModalOpen(true)}
//                                 block
//                                 className="h-10 bg-black hover:bg-zinc-800 border-none font-bold shadow-md"
//                             >
//                                 Add Donor
//                             </Button>
//                         )}
//                     </Col>
//                 </Row>

//                 {selectedDonor && (
//                     <div className="mt-6 border-t border-zinc-100 pt-6">
//                         <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 flex items-center gap-4">
//                             <div className="bg-white p-3 rounded-lg border border-zinc-100">
//                                 <UserOutlined className="text-2xl text-zinc-900" />
//                             </div>
//                             <div className="flex-1">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <Title level={4} className="!m-0 !font-bold !text-zinc-900">{selectedDonor.donor_name}</Title>
//                                         <Text className="text-zinc-500 text-xs">📱 {selectedDonor.mobile_number} {selectedDonor.city && `| 🏙️ ${selectedDonor.city}`}</Text>
//                                     </div>
//                                     <Button
//                                         type="link"
//                                         danger
//                                         onClick={() => {
//                                             onDonorSelect(null);
//                                             setMobileNumber("");
//                                         }}
//                                         className="font-bold"
//                                     >
//                                         Change
//                                     </Button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </Form>

//             <DonorModal
//                 open={isModalOpen}
//                 onCancel={() => setIsModalOpen(false)}
//                 onSuccess={handleNewDonor}
//                 initialMobileNumber={mobileNumber}
//             />
//         </Card>
//     );
// };

// export default DonorSection;

import React, { useState } from "react";
import { Card, Input, Button, Typography } from "antd";
import DonorModal from "./DonorModal";

const { Text } = Typography;

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
        <Card title="Donor Information" size="small">
            <Input
                placeholder="Enter mobile number"
                value={mobile}
                onChange={(e) => search(e.target.value)}
                maxLength={10}
            />

            {!selectedDonor && mobile.length === 10 && (
                <Button onClick={() => setModal(true)} style={{ marginTop: 8 }}>
                    Add Donor
                </Button>
            )}

            {selectedDonor && (
                <div
                    style={{
                        marginTop: 14,
                        padding: "12px 14px",
                        backgroundColor: "#f9fafb",
                        borderRadius: 10,
                        border: "1px solid #e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        transition: "all 0.3s ease",
                        animation: "donorCardFadeIn 0.35s ease",
                    }}
                >
                    {/* Avatar */}
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: "linear-gradient(135deg, #1e293b, #334155)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            color: "#fff",
                            fontSize: 18,
                            fontWeight: 700,
                        }}
                    >
                        {(selectedDonor.donor_name || "?").charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                            style={{
                                fontWeight: 600,
                                fontSize: 14,
                                color: "#1e293b",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                lineHeight: 1.3,
                            }}
                        >
                            {selectedDonor.donor_name || "—"}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                            📱 {selectedDonor.mobile_number}
                        </div>
                    </div>

                    {/* Change Button */}
                    <Button
                        size="small"
                        danger
                        type="link"
                        onClick={() => onDonorSelect(null)}
                        style={{ fontWeight: 600, flexShrink: 0 }}
                    >
                        Change
                    </Button>

                    <style>{`
                        @keyframes donorCardFadeIn {
                            from { opacity: 0; transform: translateY(6px); }
                            to   { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                </div>
            )}

            <DonorModal
                open={modal}
                onCancel={() => setModal(false)}
                onSuccess={(newDonor) => {
                    onDonorSelect(newDonor);
                    setModal(false);
                }}
                initialMobileNumber={mobile}
            />
        </Card>
    );
};

export default DonorSection;