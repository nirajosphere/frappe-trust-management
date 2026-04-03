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
                    <Text strong className="text-gray-800">{text}</Text>
                    <Text type="secondary" className="text-[10px] uppercase tracking-tighter">Donation Category</Text>
                </div>
            ),
        },
        {
            title: "Amount (₹)",
            dataIndex: "amount",
            key: "amount",
            width: 180,
            render: (amount, record, index) => (
                <div className="flex flex-col gap-2">
                    <InputNumber
                        min={1}
                        value={amount}
                        formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
                        onChange={(val) => onUpdateAmount(index, val)}
                        className="w-full rounded-lg border-gray-200 hover:border-primary focus:border-primary font-bold text-primary"
                    />
                    <div className="flex flex-wrap gap-1">
                        {quickAmounts.map(q => (
                            <button
                                key={q}
                                onClick={() => onUpdateAmount(index, q)}
                                className="px-2 py-0.5 text-[10px] bg-gray-50 border border-gray-200 rounded hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 font-medium"
                            >
                                {q}
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
                    icon={<DeleteOutlined />}
                    onClick={() => onRemoveItem(index)}
                    className="hover:bg-red-50"
                />
            ),
        },
    ];

    return (
        <Card
            title={
                <Space>
                    <ShoppingCartOutlined className="text-primary" />
                    <span className="font-bold">Selection Cart</span>
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
                    className="custom-cart-table"
                    locale={{ 
                        emptyText: (
                            <div className="py-12">
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Your cart is empty" />
                            </div>
                        )
                    }}
                />
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 mt-auto">
                <Row justify="space-between" align="middle">
                    <Col>
                        <div className="flex flex-col">
                            <Text strong className="text-gray-500 uppercase text-xs tracking-widest">Total Payable</Text>
                            <Text className="text-gray-400 text-[10px] leading-3">Including all selected donation types</Text>
                        </div>
                    </Col>
                    <Col className="text-right">
                        <div className="text-3xl font-black text-primary">
                            <span className="text-sm mr-1">₹</span>
                            {totalAmount.toLocaleString()}
                        </div>
                    </Col>
                </Row>
            </div>
        </Card>
    );
};

export default Cart;
