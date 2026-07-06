import React from "react";
import { Row, Col, Typography, Empty, Cell } from "antd";
import { AreaChartOutlined, PieChartOutlined } from "@ant-design/icons";
import {
    PieChart, Pie, ResponsiveContainer, BarChart, Bar, 
    XAxis, YAxis, CartesianGrid, Legend, Tooltip as ReTooltip
} from "recharts";
import SectionCard from "../../components/common/SectionCard";

const { Text } = Typography;

const COLORS = [
    "hsl(220, 90%, 56%)", // Royal Blue
    "hsl(142, 71%, 45%)", // Emerald Green
    "hsl(38, 92%, 50%)",  // Amber
    "hsl(0, 84%, 60%)",   // Coral
    "hsl(262, 83%, 58%)", // Violet
    "hsl(180, 70%, 45%)", // Teal
];

const InventoryCharts = ({ barData, pieData }) => {
    return (
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
                <SectionCard title="Monthly Stock Movements (IN vs OUT)" icon={<AreaChartOutlined size={15} />}>
                    {barData.length > 0 ? (
                        <div style={{ width: "100%", height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                    <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} />
                                    <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} />
                                    <ReTooltip cursor={{ fill: "#f4f4f5" }} />
                                    <Legend />
                                    <Bar dataKey="Stock In" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Stock Out" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <Empty description="No monthly transaction records found" />
                    )}
                </SectionCard>
            </Col>

            <Col xs={24} lg={12}>
                <SectionCard title="Category Wise Stock Distribution" icon={<PieChartOutlined size={15} />}>
                    {pieData.length > 0 ? (
                        <div style={{ width: "100%", height: 300 }} className="flex flex-col sm:flex-row items-center justify-center">
                            <div style={{ width: "60%", height: "100%" }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <ReTooltip formatter={(value) => `${value} units`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-col gap-2 w-full sm:w-[40%] justify-center px-4">
                                {pieData.map((entry, index) => (
                                    <div key={entry.name} className="flex items-center gap-2">
                                        <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: COLORS[index % COLORS.length] }} />
                                        <Text ellipsis className="text-xs font-semibold text-zinc-700 w-28">{entry.name}</Text>
                                        <Text className="text-xs font-bold text-zinc-900 ml-auto">{entry.value}</Text>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <Empty description="No stock category information" />
                    )}
                </SectionCard>
            </Col>
        </Row>
    );
};

export default InventoryCharts;
