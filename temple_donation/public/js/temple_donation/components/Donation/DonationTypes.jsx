// import React, { useState, useEffect } from "react";
// import { Card, Row, Col, Typography, Empty, Spin, Space } from "antd";
// import { HeartFilled, AppstoreOutlined } from "@ant-design/icons";

// const { Text } = Typography;

// const DonationTypes = ({ selectedTemple, onAddToCart }) => {
//     const [donationTypes, setDonationTypes] = useState([]);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (selectedTemple) {
//             fetchDonationTypes();
//         } else {
//             setDonationTypes([]);
//         }
//     }, [selectedTemple]);

//     const fetchDonationTypes = () => {
//         setLoading(true);
//         frappe.call({
//             method: "frappe.client.get_list",
//                 args: {
//                     doctype: "Donation Type",
//                     filters: { temple: selectedTemple },
//                     fields: ["name", "donation_type", "temple", "default_amount"]
//                 },
//                 callback: (r) => {
//                     setLoading(false);
//                     if (r.message) {
//                         setDonationTypes(r.message);
//                     } else {
//                         setDonationTypes([]);
//                     }
//                 }
//             });
//     };

//     if (!selectedTemple) {
//         return (
//             <Card className="aavatto-card min-h-[300px] flex items-center justify-center border-dashed border-2 border-zinc-200 bg-zinc-50/20">
//                 <Empty 
//                     image={Empty.PRESENTED_IMAGE_SIMPLE}
//                     description={
//                         <span className="text-zinc-400 font-medium italic">
//                             Select a temple to view available donation types
//                         </span>
//                     } 
//                 />
//             </Card>
//         );
//     }

//     return (
//         <Card 
//             title={
//                 <Space>
//                     <AppstoreOutlined className="text-zinc-900" />
//                     <span className="font-bold tracking-tight text-zinc-800">Donation Types</span>
//                 </Space>
//             } 
//             size="small" 
//             className="aavatto-card"
//         >
//             {loading ? (
//                 <div className="flex flex-col items-center justify-center py-20 gap-4">
//                     <Spin size="large" />
//                     <Text className="text-zinc-400 font-bold tracking-widest uppercase text-[10px]">Fetching categories...</Text>
//                 </div>
//             ) : donationTypes.length > 0 ? (
//                 <Row gutter={[16, 16]}>
//                     {donationTypes.map(type => (
//                         <Col key={type.name} xs={12} sm={8} md={8} lg={6}>
//                             <Card
//                                 onClick={() => onAddToCart(type)}
//                                 className="aavatto-card-minimal rounded-lg border-zinc-200 hover:border-zinc-900 bg-white cursor-pointer"
//                                 bodyStyle={{ padding: '20px 12px', textAlign: 'center' }}
//                             >
//                                     <div className="text-2xl text-zinc-900 mb-2">
//                                         <HeartFilled />
//                                     </div>
//                                     <Text className="block text-zinc-700 text-sm font-bold truncate">
//                                         {type.donation_type}
//                                     </Text>
//                                     {type.default_amount > 0 && (
//                                         <div className="mt-1">
//                                             <Text className="text-xs text-zinc-400 font-bold">₹{type.default_amount}</Text>
//                                         </div>
//                                     )}
//                                 </Card>
//                         </Col>
//                     ))}
//                 </Row>
//             ) : (
//                 <div className="py-20 border-2 border-dashed border-zinc-100 rounded-xl bg-zinc-50/30 flex items-center justify-center">
//                     <Empty description="No categories found" />
//                 </div>
//             )}
//         </Card>
//     );
// };

// export default DonationTypes;

import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spin, Empty, Typography, Space, Image } from "antd";
import { HeartFilled } from "@ant-design/icons";

const { Text } = Typography;

const DonationTypes = ({ selectedTemple, onAddToCart }) => {
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
                filters: {
                    temple: ["in", selectedTemple]
                },
                fields: [
                    "name",
                    "donation_type",
                    "default_amount",
                    "donation_image",
                    "temple",
                    "temple.temple_name" // 👈 important
                ]
            },
            callback: (r) => {
                setLoading(false);
                setDonationTypes(r.message || []);
            }
        });
    };

    if (!selectedTemple || selectedTemple.length === 0) {
        return (
            <Card size="small">
                <Empty description="Select at least one temple" />
            </Card>
        );
    }

    return (
        <Card
            title={
                <Space size={8}>
                    <HeartFilled className="text-zinc-900" />
                    <span className="font-bold tracking-tight text-zinc-800">Donation Types</span>
                </Space>
            }
            size="small"
            className="shadow-sm border-zinc-200"
        >
            {loading ? (
                <div className="flex justify-center py-10">
                    <Spin />
                </div>
            ) : donationTypes.length > 0 ? (
                <Row gutter={[12, 12]}>
                    {donationTypes.map((type) => (
                        <Col xs={12} sm={8} md={6} key={type.name}>
                            <Card
                                onClick={() => onAddToCart(type)}
                                className="border border-zinc-200 hover:border-zinc-400 transition-colors cursor-pointer"
                                bodyStyle={{ padding: 12 }}
                            >
                                {/* IMAGE */}
                                <div className="!h-10 w-full mb-2 bg-zinc-100 flex items-center justify-center rounded overflow-hidden">
                                    <Image
                                        src={type.donation_image}
                                        alt={type.donation_type}
                                        className="h-full w-full"
                                        style={{ objectFit: 'cover', height: "200px", width: "200px" }}
                                        fallback="/assets/temple_donation/js/temple_donation/assets/donation_placeholder.png"
                                        preview={false}
                                    />
                                </div>

                                {/* DONATION NAME */}
                                <Text strong className="block text-center">
                                    {type.donation_type}
                                </Text>

                                {/* TEMPLE NAME */}
                                <Text
                                    type="secondary"
                                    className="block text-center text-[11px]"
                                >
                                    {type.temple_name}
                                    {/* {type["temple.temple_name"] || type.temple} */}
                                </Text>

                                {/* AMOUNT */}
                                {type.default_amount > 0 && (
                                    <Text
                                        type="secondary"
                                        className="block text-center mt-1"
                                    >
                                        ₹ {type.default_amount}
                                    </Text>
                                )}
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty description="No donation types found" />
            )}
        </Card>
    );
};

export default DonationTypes;