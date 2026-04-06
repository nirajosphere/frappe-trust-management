import React from "react";
import { Card, Table, InputNumber, Button, Space, Typography, Empty, Row, Col } from "antd";
import { DeleteOutlined, ShoppingCartOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const Cart = ({ items, onUpdateAmount, onRemoveItem, totalAmount }) => {
    const quickAmounts = [101, 201, 501, 1001, 2100, 5100];

    const columns = [
        {
            title: "Donation Item",
            dataIndex: "dontation_type",
            key: "dontation_type",
            render: (text) => (
                <div className="flex flex-col">
                    <Text className="!font-black text-zinc-800 tracking-tight">{text}</Text>
                    <Text className="text-zinc-400 text-[10px] uppercase font-black tracking-widest leading-3 mt-1">Donation Category</Text>
                </div>
            ),
        },
        {
            title: "Amount (₹)",
            dataIndex: "amount",
            key: "amount",
            width: 180,
            render: (amount, record, index) => (
                <div className="flex flex-col gap-3 py-2">
                    <InputNumber
                        min={1}
                        value={amount}
                        formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
                        onChange={(val) => onUpdateAmount(index, val)}
                        className="w-full  border-zinc-200 bg-zinc-50/30 hover:border-black focus:border-black font-black text-zinc-900 h-10 flex items-center"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {quickAmounts.map(q => (
                            <button
                                key={q}
                                onClick={() => onUpdateAmount(index, q)}
                                className="px-2.5 py-1 text-[10px] bg-white border border-zinc-200 text-zinc-500 rounded-lg hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all duration-300 font-black shadow-sm"
                            >
                                +{q}
                            </button>
                        ))}
                    </div>
                </div>
            ),
        },
        {
            title: "",
            key: "action",
            width: 40,
            render: (_, __, index) => (
                <Button
                    type="text"
                    danger
                    shape="circle"
                    icon={<DeleteOutlined className="text-lg" />}
                    onClick={() => onRemoveItem(index)}
                    className="hover:bg-red-50 flex items-center justify-center"
                />
            ),
        },
    ];

    return (
        <Card
            title={
                <Space>
                    <ShoppingCartOutlined className="text-zinc-900" />
                    <span className="font-bold tracking-tight text-zinc-800">Selection Cart</span>
                </Space>
            }
            size="small"
            className="aavatto-card !p-0 overflow-hidden flex flex-col mb-6"
            styles={{ body: { padding: 0 } }}
        >
            <div className="max-h-[400px] overflow-y-auto">
                <Table
                    columns={columns}
                    dataSource={items}
                    pagination={false}
                    rowKey={(record, index) => `${record.donation_type}-${index}`}
                    className="aavatto-premium-table custom-cart-table"
                    locale={{
                        emptyText: (
                            <div className="py-16 bg-zinc-50/50">
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <Text className="text-zinc-300 font-bold italic">Cart is currently empty</Text>
                                    }
                                />
                            </div>
                        )
                    }}
                />
            </div>

            <div className="p-8 bg-zinc-50/50 border-t border-zinc-200 mt-auto shadow-inner relative overflow-hidden">
                <Row justify="space-between" align="middle" className="relative z-10">
                    <Col>
                        <div className="flex flex-col">
                            <Text className="text-zinc-500 uppercase text-[10px] font-black tracking-[0.2em] mb-1">Total Payable Amount</Text>
                            <Text className="text-zinc-400 text-[10px] font-medium leading-3 italic">Including all contributions</Text>
                        </div>
                    </Col>
                    <Col className="text-right">
                        <div className="text-4xl font-black text-black tracking-tighter flex items-end justify-end">
                            <span className="text-lg mb-1.5 mr-1 font-bold">₹</span>
                            {totalAmount.toLocaleString()}
                        </div>
                    </Col>
                </Row>
            </div>
        </Card>
    );
};


export default Cart;
