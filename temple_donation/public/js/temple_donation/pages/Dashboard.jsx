import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Card, Typography, Space, Tooltip, Empty, Spin } from "antd";
import { 
    WalletOutlined, 
    AppstoreOutlined, 
    UserAddOutlined, 
    ArrowUpOutlined,
    TrophyOutlined,
    PieChartOutlined
} from "@ant-design/icons";
import PageHeader from "../components/common/PageHeader";

const { Title, Text } = Typography;

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total_donation: 0, top_category: "N/A", new_donors: 0 });
    const [topDonors, setTopDonors] = useState([]);
    const [typeData, setTypeData] = useState([]);
    const chartRef = useRef(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (typeof frappe !== "undefined") {
                const [statsRes, typesRes, donorsRes] = await Promise.all([
                    frappe.call({ method: "temple_donation.api.get_dashboard_stats" }),
                    frappe.call({ method: "temple_donation.api.get_donations_by_type" }),
                    frappe.call({ method: "temple_donation.api.get_top_donors" })
                ]);

                if (statsRes.message) setStats(statsRes.message);
                if (typesRes.message) setTypeData(typesRes.message);
                if (donorsRes.message) setTopDonors(donorsRes.message);
            }
        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
                <Spin size="large" />
                <Text className="text-zinc-400 font-bold tracking-widest uppercase text-[10px] animate-pulse">
                    Analyzing Temple Statistics...
                </Text>
            </div>
        );
    }

    return (
        <div className="dashboard-container animate-fadeIn">
            <PageHeader 
                title="Consolidated Dashboard" 
                subtitle="Real-time performance analytics and donation insights."
            />

            <div className="p-8">
                {/* --- Top Stat Cards --- */}
                <Row gutter={[24, 24]} className="mb-10">
                    <Col xs={24} md={8}>
                        <Card className="premium-stat-card border-zinc-100 shadow-sm rounded-[32px] hover:border-zinc-900/10 transition-all duration-300">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Text className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Total Donation</Text>
                                    <Title level={2} className="!m-0 font-black tracking-tighter text-zinc-900">
                                        ₹{(stats.total_donation || 0).toLocaleString()}
                                    </Title>
                                    <div className="mt-2 flex items-center gap-1 text-emerald-500 font-bold text-xs">
                                        <ArrowUpOutlined />
                                        <span>Live Update</span>
                                    </div>
                                </div>
                                <div className="h-12 w-12 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-900/10">
                                    <WalletOutlined className="text-white text-xl" />
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card className="premium-stat-card border-zinc-100 shadow-sm rounded-[32px] hover:border-zinc-900/10 transition-all duration-300">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Text className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Top Category</Text>
                                    <Title level={2} className="!m-0 font-black tracking-tighter text-zinc-900 max-w-[200px] truncate">
                                        {stats.top_category}
                                    </Title>
                                    <div className="mt-2 text-zinc-400 font-medium text-xs">Based on total collection</div>
                                </div>
                                <div className="h-12 w-12 bg-zinc-100 rounded-2xl flex items-center justify-center">
                                    <AppstoreOutlined className="text-zinc-900 text-xl" />
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card className="premium-stat-card border-zinc-100 shadow-sm rounded-[32px] hover:border-zinc-900/10 transition-all duration-300">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Text className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">New Donors (Today)</Text>
                                    <Title level={2} className="!m-0 font-black tracking-tighter text-zinc-900">
                                        {stats.new_donors}
                                    </Title>
                                    <div className="mt-2 text-zinc-400 font-medium text-xs">Community growth tracking</div>
                                </div>
                                <div className="h-12 w-12 bg-zinc-100 rounded-2xl flex items-center justify-center">
                                    <UserAddOutlined className="text-zinc-900 text-xl" />
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[24, 24]}>
                    {/* --- Donation Types Breakdown --- */}
                    <Col xs={24} lg={14}>
                        <Card 
                            title={<span className="font-bold tracking-tight text-zinc-800">Donations By Type</span>}
                            className="h-full border-zinc-100 shadow-sm rounded-[40px] overflow-hidden"
                            extra={<PieChartOutlined className="text-zinc-300" />}
                        >
                            <div className="py-6 px-4">
                                {typeData.length > 0 ? (
                                    <div className="flex flex-col gap-4">
                                        {typeData.map((item, idx) => {
                                            const percentage = ((item.value / (stats.total_donation || 1)) * 100).toFixed(1);
                                            return (
                                                <div key={idx} className="group flex items-center justify-between p-4 rounded-2xl border border-zinc-50 hover:bg-zinc-50/50 hover:border-zinc-200 transition-all duration-300">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-2 w-2 rounded-full bg-zinc-900 group-hover:scale-125 transition-transform" />
                                                        <Text className="font-bold text-zinc-700 truncate max-w-[200px]">{item.type}</Text>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-black text-zinc-900">₹{item.value.toLocaleString()}</div>
                                                        <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none mt-1">{percentage}%</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <Empty description="No breakdown data available" />
                                )}
                            </div>
                        </Card>
                    </Col>

                    {/* --- Top Donors Leaderboard --- */}
                    <Col xs={24} lg={10}>
                        <Card 
                            title={<span className="font-bold tracking-tight text-zinc-800">Top Benefactors</span>}
                            className="h-full border-zinc-100 shadow-sm rounded-[40px] overflow-hidden"
                            extra={<TrophyOutlined className="text-zinc-300" />}
                        >
                            <div className="p-4">
                                {topDonors.length > 0 ? (
                                    <div className="space-y-1">
                                        {topDonors.map((donor, idx) => (
                                            <div 
                                                key={idx} 
                                                className="flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 transition-all border-b border-zinc-50 last:border-0"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500">
                                                        {idx + 1}
                                                    </div>
                                                    <Text className="font-semibold text-zinc-800 truncate max-w-[150px]">
                                                        {donor.name}
                                                    </Text>
                                                </div>
                                                <Text className="font-black text-zinc-900">
                                                    ₹{donor.total.toLocaleString()}
                                                </Text>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Empty description="No donor data" />
                                )}
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Dashboard;