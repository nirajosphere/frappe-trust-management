import React, { useState, useEffect } from "react";
import {
    Row, Col, Card, Typography, Empty, Tag, Spin, List, Timeline, Button
} from "antd";
import {
    AppstoreOutlined, HistoryOutlined, PieChartOutlined,
    AreaChartOutlined, AlertOutlined, RiseOutlined, FallOutlined,
    ReloadOutlined
} from "@ant-design/icons";
import {
    PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import PageHeader from "../../components/common/PageHeader";
import PageLoader from "../../components/common/PageLoader";
import ViewContainer from "../../components/common/ViewContainer";
import SectionCard from "../../components/common/SectionCard";
import { getTagConfig } from "../../utils/tagUtils";

dayjs.extend(relativeTime);
const { Title, Text } = Typography;

// Custom colors for charts
const COLORS = [
    "hsl(220, 90%, 56%)", // Royal Blue
    "hsl(142, 71%, 45%)", // Emerald Green
    "hsl(38, 92%, 50%)",  // Amber
    "hsl(0, 84%, 60%)",   // Coral
    "hsl(262, 83%, 58%)", // Violet
    "hsl(180, 70%, 45%)", // Teal
];

const InventoryDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const call = (method, args = {}) => {
        return new Promise((resolve, reject) => {
            if (typeof frappe === "undefined") {
                resolve(null);
                return;
            }
            frappe.call({
                method,
                args,
                callback: (r) => resolve(r.message || r),
                error: (err) => reject(err)
            });
        });
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            setError(null);
            const res = await call("temple_donation.api.get_inventory_dashboard_data");
            if (res) {
                setData(res);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load inventory dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading && !data) return <PageLoader />;

    const summary = data?.summary || {};
    const charts = data?.charts || {};
    const activities = data?.activities || {};

    // Transform Category data for Pie chart
    const pieData = charts.category_wise_stock?.map(c => ({
        name: c.name,
        value: parseFloat(c.value) || 0
    })).filter(item => item.value > 0) || [];

    // Transform Monthly In/Out data for Bar Chart
    const barData = charts.monthly_stock_in_out?.map(m => ({
        name: m.month_name,
        "Stock In": parseFloat(m.stock_in) || 0,
        "Stock Out": parseFloat(m.stock_out) || 0
    })) || [];

    // Transform Top Consumed data
    const topConsumedData = charts.top_consumed_items?.map(item => ({
        name: item.name,
        qty: parseFloat(item.value) || 0
    })) || [];

    return (
        <ViewContainer className="inventory-dashboard-page">
            <PageHeader
                title="Inventory Dashboard"
                subtitle="Overview of store items, stock levels, and movements"
                actions={
                    <Button 
                        type="default" 
                        icon={<ReloadOutlined />} 
                        onClick={fetchStats}
                        loading={loading}
                    >
                        Refresh Data
                    </Button>
                }
            />

            {error && (
                <div style={{ marginBottom: 24 }}>
                    <Card className="card-glass border-red-200 bg-red-50/50">
                        <Text type="danger">{error}</Text>
                    </Card>
                </div>
            )}

            {/* ── SUMMARY CARDS ── */}
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

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12}>
                    <Card className="card-glass" bordered={false}>
                        <div className="flex justify-between items-center">
                            <div>
                                <Text className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">Today's Stock In</Text>
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
                                <Text className="text-[10px] font-bold tracking-wider uppercase text-zinc-400">Today's Stock Out</Text>
                                <Title level={3} style={{ margin: "4px 0 0 0", color: "#dc2626" }}>
                                    -{summary.today_stock_out || 0} Units
                                </Title>
                            </div>
                            <span className="p-2 rounded-lg bg-red-50 text-red-600 font-bold">OUT</span>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* ── CHARTS ── */}
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

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={8}>
                    <SectionCard title="Top Consumed Items" icon={<RiseOutlined size={15} />}>
                        {topConsumedData.length > 0 ? (
                            <div className="flex flex-col gap-4 py-2">
                                {topConsumedData.map((item, index) => {
                                    const maxVal = Math.max(...topConsumedData.map(d => d.qty), 1);
                                    const pct = (item.qty / maxVal) * 100;
                                    return (
                                        <div key={item.name} className="flex flex-col gap-1">
                                            <div className="flex justify-between items-center text-xs">
                                                <Text strong className="text-zinc-700">{item.name}</Text>
                                                <Text className="font-bold text-zinc-950">{item.qty} Units</Text>
                                            </div>
                                            <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                                                <div 
                                                    style={{ width: `${pct}%`, backgroundColor: COLORS[index % COLORS.length] }} 
                                                    className="h-full rounded-full transition-all duration-500" 
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <Empty description="No item consumption logs found" />
                        )}
                    </SectionCard>
                </Col>

                {/* ── RECENT ACTIVITIES ── */}
                <Col xs={24} lg={8}>
                    <SectionCard title="Latest Stock Movements" icon={<HistoryOutlined size={15} />}>
                        {activities.latest_stock_entries?.length > 0 ? (
                            <Timeline 
                                className="custom-timeline pt-2"
                                items={activities.latest_stock_entries.map(entry => {
                                    const typeTag = getTagConfig(entry.purpose === "Receipt" ? "active" : entry.purpose === "Issue" ? "inactive" : "manager");
                                    return {
                                        color: entry.purpose === "Receipt" ? "green" : entry.purpose === "Issue" ? "red" : "blue",
                                        children: (
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex justify-between items-center">
                                                    <Text strong className="text-xs">{entry.name}</Text>
                                                    <Tag className={`tag-glass ${typeTag.glassClass} font-bold rounded-full !m-0 !py-0 !px-1.5`}>
                                                        {entry.purpose}
                                                    </Tag>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] text-zinc-400">
                                                    <span>By: {entry.owner_name}</span>
                                                    <span>{dayjs(entry.posting_date).fromNow()}</span>
                                                </div>
                                            </div>
                                        )
                                    };
                                })}
                            />
                        ) : (
                            <Empty description="No recent stock entries" />
                        )}
                    </SectionCard>
                </Col>

                <Col xs={24} lg={8}>
                    <SectionCard title="Latest Item Donations" icon={<HistoryOutlined size={15} />}>
                        {activities.latest_donations?.length > 0 ? (
                            <List
                                size="small"
                                dataSource={activities.latest_donations}
                                renderItem={(item) => (
                                    <List.Item className="px-0 py-2 border-b border-zinc-50 last:border-0 last:pb-0">
                                        <div className="flex flex-col w-full gap-0.5">
                                            <div className="flex justify-between items-center">
                                                <Text strong className="text-xs text-zinc-800">{item.donor_name}</Text>
                                                <span className="font-semibold text-xs text-emerald-600">₹{parseFloat(item.amount).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] text-zinc-400">
                                                <span>Entry: {item.name}</span>
                                                <span>{dayjs(item.posting_date).fromNow()}</span>
                                            </div>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        ) : (
                            <Empty description="No recent item donations registered" />
                        )}
                    </SectionCard>
                </Col>
            </Row>
        </ViewContainer>
    );
};

export default InventoryDashboard;
