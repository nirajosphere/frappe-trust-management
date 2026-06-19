// import React from "react";
// import { Card, Table, InputNumber, Button, Space, Typography, Empty, Row, Col } from "antd";
// import { DeleteOutlined, ShoppingCartOutlined } from "@ant-design/icons";

// const { Text } = Typography;

// const Cart = ({ items, onUpdateAmount, onRemoveItem, totalAmount }) => {
//     const quickAmounts = [101, 201, 501, 1001, 2100, 5100];

//     const columns = [
//         {
//             title: "Donation Type",
//             dataIndex: "donation_type_label",
//             render: (text, record) => (
//                 <div>
//                     <Text strong>{text}</Text>
//                     <div>
//                         <Text type="secondary" style={{ fontSize: 10 }}>{record.temple}</Text>
//                     </div>
//                 </div>
//             ),
//         },
//         {
//             title: "Amount (₹)",
//             dataIndex: "amount",
//             width: 180,
//             render: (amount, record, index) => (
//                 <div>
//                     <InputNumber
//                         min={1}
//                         value={amount}
//                         formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
//                         parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
//                         onChange={(val) => onUpdateAmount(index, val)}
//                         style={{ width: "100%", height: 40 }}
//                     />

//                     <div style={{ marginTop: 6 }}>
//                         {quickAmounts.map(q => (
//                             <Button
//                                 key={q}
//                                 size="small"
//                                 onClick={() => onUpdateAmount(index, q)}
//                                 style={{ marginRight: 4, marginTop: 4 }}
//                             >
//                                 {q}
//                             </Button>
//                         ))}
//                     </div>
//                 </div>
//             ),
//         },
//         {
//             title: "",
//             width: 50,
//             render: (_, __, index) => (
//                 <Button
//                     danger
//                     icon={<DeleteOutlined />}
//                     onClick={() => onRemoveItem(index)}
//                 />
//             ),
//         },
//     ];

//     return (
//         <Card title={<Space><ShoppingCartOutlined /> Selection Cart</Space>} size="small">
//             <Table
//                 columns={columns}
//                 dataSource={items}
//                 pagination={false}
//                 rowKey={(r, i) => i}
//                 locale={{
//                     emptyText: <Empty description="Cart is empty" />
//                 }}
//             />

//             <div style={{ marginTop: 16, borderTop: "1px solid #eee", paddingTop: 12 }}>
//                 <Row justify="space-between">
//                     <Text>Total Amount</Text>
//                     <Text strong>₹ {totalAmount.toLocaleString()}</Text>
//                 </Row>
//             </div>
//         </Card>
//     );
// };

// export default Cart;



import React from "react";
import { Card, Table, InputNumber, Button, Row, Typography, Empty } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

const Cart = ({ items, onUpdateAmount, onRemoveItem, totalAmount }) => {
    const quickAmounts = [101, 201, 501, 1001];

    const columns = [
        {
            title: "Donation Type",
            dataIndex: "donation_type_label",
            render: (text, record) => (
                <div style={{ padding: '4px 0' }}>
                    <Text style={{ fontWeight: 600, color: '#1f2937', fontSize: '13px' }}>{text}</Text>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{record.temple}</div>
                </div>
            ),
        },
        {
            title: "Amount (₹)",
            dataIndex: "amount",
            width: 160,
            render: (amount, record, index) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <InputNumber
                        min={1}
                        value={amount}
                        formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
                        onChange={(val) => onUpdateAmount(index, val)}
                        style={{ width: "100%", height: '36px', borderRadius: '6px' }}
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {quickAmounts.map(q => (
                            <Button key={q} size="small" onClick={() => onUpdateAmount(index, q)} style={{ fontSize: '11px', padding: '0 6px', height: '20px', borderRadius: '4px' }}>
                                +{q}
                            </Button>
                        ))}
                    </div>
                </div>
            ),
        },
        {
            title: "",
            width: 44,
            align: 'center',
            render: (_, __, index) => (
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onRemoveItem(index)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} />
            ),
        },
    ];

    return (
        <Card 
            title={<span style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px' }}>Selection Cart</span>}
            size="small"
            style={{ borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: 'none' }}
            headStyle={{ borderBottom: '1px solid #f3f4f6', padding: '12px 16px' }}
            bodyStyle={{ padding: '0px' }}
        >
            <Table
                columns={columns}
                dataSource={items}
                pagination={false}
                rowKey={(r, i) => i}
                className="custom-pos-table aavatto-premium-table"
                locale={{
                    emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span style={{ color: '#9ca3af', fontSize: '13px' }}>Cart is empty</span>} style={{ padding: '32px 0' }} />
                }}
            />

            {items.length > 0 && (
                <div style={{ padding: "16px", borderTop: "1px solid #f3f4f6", backgroundColor: '#fafafa' }}>
                    <Row justify="space-between" align="middle">
                        <Text style={{ fontWeight: 500, color: '#4b5563' }}>Total Amount</Text>
                        <Text style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>₹ {totalAmount.toLocaleString()}</Text>
                    </Row>
                </div>
            )}
        </Card>
    );
};

export default Cart;