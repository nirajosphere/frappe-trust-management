

// import React, { useState, useEffect } from "react";
// import { Card, Row, Col, Spin, Empty, Typography, Space, Checkbox } from "antd";
// import { HeartFilled, CheckCircleFilled } from "@ant-design/icons";

// const { Text } = Typography;

// const DonationTypes = ({ selectedTemple, onToggleCart, cartItems = [] }) => {
//     const [donationTypes, setDonationTypes] = useState([]);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (selectedTemple && selectedTemple.length > 0) {
//             fetchData();
//         } else {
//             setDonationTypes([]);
//         }
//     }, [selectedTemple]);

//     const fetchData = () => {
//         setLoading(true);

//         frappe.call({
//             method: "frappe.client.get_list",
//             args: {
//                 doctype: "Donation Type",
//                 filters: {
//                     temple: ["in", selectedTemple]
//                 },
//                 fields: [
//                     "name",
//                     "donation_type",
//                     "default_amount",
//                     "donation_image",
//                     "temple",
//                     "temple.temple_name"
//                 ]
//             },
//             callback: (r) => {
//                 setLoading(false);
//                 setDonationTypes(r.message || []);
//             }
//         });
//     };

//     if (!selectedTemple || selectedTemple.length === 0) {
//         return (
//             <Card size="small">
//                 <Empty description="Select at least one temple" />
//             </Card>
//         );
//     }

//     return (
//         <Card
//             title={
//                 <Space size={8}>
//                     <HeartFilled className="text-zinc-900" />
//                     <span className="font-bold tracking-tight text-zinc-800">Donation Types</span>
//                 </Space>
//             }
//             size="small"
//             className="shadow-sm border-zinc-200"
//         >
//             {loading ? (
//                 <div className="flex justify-center py-10">
//                     <Spin />
//                 </div>
//             ) : donationTypes.length > 0 ? (
//                 <Row gutter={[12, 12]}>
//                     {donationTypes.map((type) => {
//                         const isSelected = cartItems.some(item => item.donation_type === type.name);

//                         return (
//                             <Col xs={12} sm={8} md={6} key={type.name} className="flex">
//                                 <Card
//                                     onClick={() => onToggleCart(type)}
//                                     className={`relative border transition-all duration-300 cursor-pointer w-full h-full overflow-hidden ${
//                                         isSelected 
//                                         ? "border-zinc-900 ring-1 ring-zinc-900 bg-zinc-50/50" 
//                                         : "border-zinc-200 hover:border-zinc-400"
//                                     }`}
//                                     bodyStyle={{ padding: 12, height: '100%', display: 'flex', flexDirection: 'column' }}
//                                 >
//                                     {/* SELECTION INDICATOR */}
//                                     {isSelected && (
//                                         <div className="absolute top-2 right-2 z-10 animate-in fade-in zoom-in duration-300">
//                                             <CheckCircleFilled className="text-zinc-900 text-lg bg-white rounded-full" />
//                                         </div>
//                                     )}

//                                     {/* IMAGE */}
//                                     <div className={`relative h-[220px] w-full mb-3 rounded-xl overflow-hidden border flex items-center justify-center p-3 transition-colors ${
//                                         isSelected ? "bg-white border-zinc-900/10" : "bg-white border-zinc-200"
//                                     }`}>
//                                         <img
//                                             src={
//                                                 type.donation_image ||
//                                                 "/assets/temple_donation/js/temple_donation/assets/donation_placeholder.png"
//                                             }
//                                             alt={type.donation_type}
//                                             className="w-full h-full object-contain"
//                                         />
//                                     </div>

//                                     {/* DONATION NAME */}
//                                     <Text strong className={`block text-center transition-colors ${isSelected ? "text-zinc-900" : "text-zinc-800"}`}>
//                                         {type.donation_type}
//                                     </Text>

//                                     <Text
//                                         type="secondary"
//                                         className="block text-center text-[11px]"
//                                     >
//                                         {type["temple.temple_name"] || type.temple}
//                                     </Text>

//                                     {/* AMOUNT */}
//                                     {type.default_amount > 0 && (
//                                         <Text
//                                             type="secondary"
//                                             className="block text-center mt-auto pt-2"
//                                         >
//                                             ₹ {type.default_amount}
//                                         </Text>
//                                     )}
//                                 </Card>
//                             </Col>
//                         );
//                     })}
//                 </Row>
//             ) : (
//                 <Empty description="No donation types found" />
//             )}
//         </Card>
//     );
// };

// export default DonationTypes;


import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spin, Empty, Typography, Space } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";

const { Text } = Typography;

const DonationTypes = ({ selectedTemple, onToggleCart, cartItems = [] }) => {
    const [donationTypes, setDonationTypes] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedTemple && selectedTemple.length > 0) {
            fetchData();
        } else {
            setDonationTypes([]);
        }
    }, [selectedTemple]);

    const fetchData = () => {
        setLoading(true);
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Donation Type",
                fields: ["name", "donation_type", "default_amount", "donation_image", "temple"],
                limit: 1000
            },
            callback: (r) => {
                setLoading(false);
                const allTypes = r.message || [];
                const filtered = allTypes.filter(type => {
                    if (!type.temple) return false;
                    let templeIds = [];
                    try {
                        if (type.temple.startsWith("[")) {
                            templeIds = JSON.parse(type.temple);
                        } else {
                            templeIds = type.temple.split(",").map(s => s.trim());
                        }
                    } catch (e) {
                        templeIds = [type.temple];
                    }
                    return templeIds.some(t => selectedTemple.includes(t));
                });
                setDonationTypes(filtered);
            }
        });
    };

    if (!selectedTemple || selectedTemple.length === 0) {
        return (
            <Card style={{ borderRadius: '8px', border: '1px solid #f3f4f6' }} bodyStyle={{ padding: '24px', textAlign: 'center' }}>
                <Empty description={<span className="text-zinc-400 font-medium">Select at least one trust</span>} />
            </Card>
        );
    }

    return (
        <Card
            title={<span style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px' }}>Donation Types</span>}
            size="small"
            style={{ borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: 'none' }}
            headStyle={{ borderBottom: '1px solid #f3f4f6', padding: '12px 16px' }}
            bodyStyle={{ padding: '16px' }}
        >
            {loading ? (
                <div className="flex justify-center py-10"><Spin /></div>
            ) : donationTypes.length > 0 ? (
                <Row gutter={[12, 12]}>
                    {donationTypes.map((type) => {
                        const isSelected = cartItems.some(item => item.donation_type === type.name);
                        return (
                            <Col xs={12} sm={8} md={6} key={type.name} className="flex">
                                <Card
                                    onClick={() => onToggleCart(type)}
                                    style={{ borderRadius: '6px', overflow: 'hidden' }}
                                    className={`relative border transition-all duration-200 cursor-pointer w-full h-full ${
                                        isSelected ? "border-zinc-900 bg-zinc-50/40" : "border-zinc-200 hover:border-zinc-400"
                                    }`}
                                    bodyStyle={{ padding: 12, display: 'flex', flexDirection: 'column', height: '100%' }}
                                >
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 z-10 animate-fade-in">
                                            <CheckCircleFilled className="text-zinc-900 text-lg bg-white rounded-full" />
                                        </div>
                                    )}
                                    <div className={`relative h-[140px] w-full mb-3 rounded-md overflow-hidden border flex items-center justify-center p-2 bg-white ${isSelected ? "border-zinc-900/10" : "border-zinc-100"}`}>
                                        <img src={type.donation_image || "/assets/temple_donation/js/temple_donation/assets/donation_placeholder.png"} alt={type.donation_type} className="w-full h-full object-contain" />
                                    </div>
                                    <Text strong className="block text-center text-zinc-800 text-sm">{type.donation_type}</Text>
                                    <Text type="secondary" className="block text-center text-[11px] text-zinc-400 mt-0.5">{type["temple.temple_name"] || type.temple}</Text>
                                    {type.default_amount > 0 && (
                                        <Text className="block text-center font-semibold text-zinc-900 mt-auto pt-2 text-xs">₹ {type.default_amount}</Text>
                                    )}
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            ) : (
                <Empty description="No donation types found" />
            )}
        </Card>
    );
};

export default DonationTypes;