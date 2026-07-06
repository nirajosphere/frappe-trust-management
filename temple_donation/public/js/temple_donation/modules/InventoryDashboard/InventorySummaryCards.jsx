import React from "react";
import { Row, Col, Card, Typography } from "antd";
import { AppstoreOutlined, RiseOutlined, AlertOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const InventorySummaryCards = ({ summary, periodSuffix }) => {
    return (
        <>
            {/* Main stats boxes */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="card-glass hover-scale" bordered={false}>
                        <div className="flex justify-between items-start">
                            <div>
                                <Text className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">Total Unique Items</Text>
                                <Title level={2} style={{ margin: "4px 0 0 0", color: "#18181b" }}>
                                    {summary.total_items || 0}
                                </Title>
                            </div>
                            <span className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                <AppstoreOutlined className="text-zinc-600 text-lg" />
                            </span>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="card-glass hover-scale" bordered={false}>
                        <div className="flex justify-between items-start">
                            <div>
                                <Text className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">Total Stock Quantity</Text>
                                <Title level={2} style={{ margin: "4px 0 0 0", color: "#18181b" }}>
                                    {summary.total_stock_qty || 0}
                                </Title>
                            </div>
                            <span className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                                <RiseOutlined className="text-emerald-600 text-lg" />
                            </span>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="card-glass hover-scale" bordered={false}>
                        <div className="flex justify-between items-start">
                            <div>
                                <Text className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">Current Stock Value</Text>
                                <Title level={2} style={{ margin: "4px 0 0 0", color: "#18181b" }}>
                                    ₹{Number(summary.current_stock_value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Title>
                            </div>
                            <span className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center">
                                <RiseOutlined className="text-emerald-600 text-lg" />
                            </span>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="card-glass hover-scale" bordered={false}>
                        <div className="flex justify-between items-start">
                            <div>
                                <Text className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">Low & Out of Stock</Text>
                                <Title level={2} style={{ margin: "4px 0 0 0", color: summary.out_of_stock_items > 0 || summary.low_stock_items > 0 ? "#dc2626" : "#18181b" }}>
                                    {summary.out_of_stock_items || 0} / {summary.low_stock_items || 0}
                                </Title>
                            </div>
                            <span className={`p-2.5 rounded-xl flex items-center justify-center ${summary.out_of_stock_items > 0 || summary.low_stock_items > 0 ? "bg-red-50 border border-red-100" : "bg-zinc-50 border border-zinc-100"}`}>
                                <AlertOutlined className={summary.out_of_stock_items > 0 || summary.low_stock_items > 0 ? "text-red-600 text-lg" : "text-zinc-600 text-lg"} />
                            </span>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* In / Out period status row */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12}>
                    <Card className="card-glass" bordered={false}>
                        <div className="flex justify-between items-center">
                            <div>
                                <Text className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">{periodSuffix} Stock In</Text>
                                <Title level={3} style={{ margin: "4px 0 0 0", color: "#16a34a" }}>
                                    +{summary.today_stock_in || 0} Units
                                </Title>
                            </div>
                            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 font-bold">IN</span>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card className="card-glass" bordered={false}>
                        <div className="flex justify-between items-center">
                            <div>
                                <Text className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">{periodSuffix} Stock Out</Text>
                                <Title level={3} style={{ margin: "4px 0 0 0", color: "#dc2626" }}>
                                    -{summary.today_stock_out || 0} Units
                                </Title>
                            </div>
                            <span className="p-2 rounded-lg bg-red-50 text-red-600 font-bold">OUT</span>
                        </div>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default InventorySummaryCards;
