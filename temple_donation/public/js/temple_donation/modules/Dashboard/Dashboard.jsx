import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Row, Col, Card, Typography, Select, DatePicker, Button,
    Space, Empty, Avatar, Tag, Spin
} from "antd";
import {
    WalletOutlined, AppstoreOutlined, UserAddOutlined,
    HistoryOutlined, TrophyOutlined, PieChartOutlined,
    AreaChartOutlined
} from "@ant-design/icons";

import {
    PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer,
    AreaChart, Area, XAxis, YAxis, CartesianGrid
} from "recharts";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import PageHeader from "../../components/common/PageHeader";
import PageLoader from "../../components/common/PageLoader";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ["#111", "#555", "#999", "#ccc"];

const Dashboard = () => {
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        temple: null,
        user: null,
        dateRange: null,
        dateType: null
    });

    const [stats, setStats] = useState({
        total_donation: 0,
        top_category: "N/A",
        new_donors: 0
    });

    const [typeData, setTypeData] = useState([]);
    const [topDonors, setTopDonors] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [recentDonations, setRecentDonations] = useState([]);

    const [temples, setTemples] = useState([]);
    const [users, setUsers] = useState([]);
    const [optionsLoading, setOptionsLoading] = useState({ temple: false, user: false });

    const templeSearchTimer = useRef(null);
    const userSearchTimer = useRef(null);

    const buildFilterParams = useCallback((filterState = filters) => ({
        temple: filterState.temple,
        user: filterState.user,
        from_date: filterState.dateRange?.[0]?.format("YYYY-MM-DD"),
        to_date: filterState.dateRange?.[1]?.format("YYYY-MM-DD")
    }), [filters]);

    const searchTemples = async (searchText = "") => {
        setOptionsLoading((prev) => ({ ...prev, temple: true }));
        try {
            const args = {
                doctype: "Temple",
                fields: ["name", "temple_name"],
                limit_page_length: 50,
                order_by: "temple_name asc"
            };
            if (searchText?.trim()) {
                args.or_filters = [
                    ["temple_name", "like", `%${searchText.trim()}%`],
                    ["name", "like", `%${searchText.trim()}%`]
                ];
            }
            const res = await frappe.call({ method: "frappe.client.get_list", args });
            setTemples(res.message || []);
        } catch (err) {
            console.error(err);
        } finally {
            setOptionsLoading((prev) => ({ ...prev, temple: false }));
        }
    };

    const searchUsers = async (searchText = "") => {
        setOptionsLoading((prev) => ({ ...prev, user: true }));
        try {
            const args = {
                doctype: "User",
                fields: ["name", "full_name"],
                filters: { enabled: 1, name: ["not in", ["Administrator", "Guest"]] },
                limit_page_length: 50,
                order_by: "full_name asc"
            };
            if (searchText?.trim()) {
                args.or_filters = [
                    ["full_name", "like", `%${searchText.trim()}%`],
                    ["name", "like", `%${searchText.trim()}%`]
                ];
            }
            const res = await frappe.call({ method: "frappe.client.get_list", args });
            setUsers(res.message || []);
        } catch (err) {
            console.error(err);
        } finally {
            setOptionsLoading((prev) => ({ ...prev, user: false }));
        }
    };

    const handleTempleSearch = (value) => {
        clearTimeout(templeSearchTimer.current);
        templeSearchTimer.current = setTimeout(() => searchTemples(value), 300);
    };

    const handleUserSearch = (value) => {
        clearTimeout(userSearchTimer.current);
        userSearchTimer.current = setTimeout(() => searchUsers(value), 300);
    };

    // 🔥 FETCH DATA
    const fetchData = async (params = {}) => {
        setLoading(true);
        try {
            const [statsRes, typesRes, donorsRes, trendRes, recentRes] = await Promise.all([
                frappe.call({
                    method: "temple_donation.api.get_dashboard_stats",
                    args: params
                }),
                frappe.call({
                    method: "temple_donation.api.get_donations_by_type",
                    args: params
                }),
                frappe.call({
                    method: "temple_donation.api.get_top_donors",
                    args: params
                }),
                frappe.call({
                    method: "temple_donation.api.get_monthly_donations",
                    args: { temple: params.temple, user: params.user }
                }),
                frappe.call({
                    method: "temple_donation.api.get_recent_donations",
                    args: { temple: params.temple, user: params.user, limit: 5 }
                })
            ]);

            setStats(statsRes.message || {});
            setTypeData(typesRes.message || []);
            setTopDonors(donorsRes.message || []);
            setTrendData(trendRes.message || []);
            setRecentDonations(recentRes.message || []);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        searchTemples();
        searchUsers();
        fetchData();
    }, []);

    // 🔥 DATE TYPE HANDLER
    const handleDateTypeChange = (value) => {
        let range = null;

        if (value === "today") {
            range = [dayjs().startOf("day"), dayjs().endOf("day")];
        }

        if (value === "week") {
            range = [dayjs().startOf("week"), dayjs().endOf("week")];
        }

        if (value === "month") {
            range = [dayjs().startOf("month"), dayjs().endOf("month")];
        }

        setFilters({
            ...filters,
            dateType: value,
            dateRange: range
        });
    };

    const handleTempleChange = (value) => {
        const nextFilters = { ...filters, temple: value };
        setFilters(nextFilters);
        fetchData(buildFilterParams(nextFilters));
    };

    const handleUserChange = (value) => {
        const nextFilters = { ...filters, user: value };
        setFilters(nextFilters);
        fetchData(buildFilterParams(nextFilters));
    };

    // 🔥 SUBMIT
    const handleSubmit = () => {
        fetchData(buildFilterParams());
    };

    // 🔥 CLEAR
    const handleClear = () => {
        setFilters({
            temple: null,
            user: null,
            dateRange: null,
            dateType: null
        });
        fetchData();
    };

    if (loading && !stats.total_donation) {
        return <PageLoader />;
    }

    return (
        <div className="py-6">
            <PageHeader title="Dashboard" description="Analytics Overview" />
                {/* 🔥 FILTER */}
                <Card className="border border-zinc-200 mb-6">

                    <Row gutter={[16, 16]}>

                        {/* TEMPLE */}
                        <Col xs={24} md={8}>
                            <Text>Search By Temple</Text>
                            <Select
                                showSearch
                                value={filters.temple}
                                onChange={handleTempleChange}
                                onSearch={handleTempleSearch}
                                onClear={() => searchTemples()}
                                placeholder="Search temple..."
                                className="w-full mt-1"
                                allowClear
                                loading={optionsLoading.temple}
                                filterOption={false}
                                notFoundContent={optionsLoading.temple ? "Loading..." : "No temples found"}
                                options={temples.map(t => ({
                                    label: t.temple_name || t.name,
                                    value: t.name
                                }))}
                            />
                        </Col>

                        {/* USER */}
                        <Col xs={24} md={8}>
                            <Text>Search By User</Text>
                            <Select
                                showSearch
                                value={filters.user}
                                onChange={handleUserChange}
                                onSearch={handleUserSearch}
                                onClear={() => searchUsers()}
                                placeholder="Search user..."
                                className="w-full mt-1"
                                allowClear
                                loading={optionsLoading.user}
                                filterOption={false}
                                notFoundContent={optionsLoading.user ? "Loading..." : "No users found"}
                                options={users.map(u => ({
                                    label: u.full_name || u.name,
                                    value: u.name
                                }))}
                            />
                        </Col>

                        {/* DATE */}
                        <Col xs={24} md={8}>
                            <Text>Filter By Date</Text>

                            <Space direction="vertical" className="w-full mt-1">

                                <Select
                                    placeholder="Select Range"
                                    value={filters.dateType}
                                    onChange={handleDateTypeChange}
                                    className="w-full"
                                    options={[
                                        { label: "Today", value: "today" },
                                        { label: "This Week", value: "week" },
                                        { label: "This Month", value: "month" },
                                        { label: "Custom Range", value: "custom" }
                                    ]}
                                />

                                {filters.dateType === "custom" && (
                                    <RangePicker
                                        className="w-full"
                                        value={filters.dateRange}
                                        onChange={(dates) =>
                                            setFilters({ ...filters, dateRange: dates })
                                        }
                                    />
                                )}

                            </Space>
                        </Col>

                    </Row>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={handleClear}>Clear Filter</Button>
                        <Button type="primary" onClick={handleSubmit}>
                            Submit
                        </Button>
                    </div>

                </Card>

                {/* 🔥 STATS */}
                <Spin spinning={loading}>
                <Row gutter={[16, 16]} className="mb-6">

                    <Col xs={24} md={8}>
                        <Card className="border">
                            <Space align="center" className="mb-2">
                                <WalletOutlined className="text-zinc-400" />
                                <Text>Total Donation</Text>
                            </Space>
                            <Title level={3} className="!m-0">₹{(stats.total_donation || 0).toLocaleString()}</Title>
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card className="border">
                            <Space align="center" className="mb-2">
                                <AppstoreOutlined className="text-zinc-400" />
                                <Text>Top Category</Text>
                            </Space>
                            <Title level={3} className="!m-0 truncate">{stats.top_category}</Title>
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card className="border">
                            <Space align="center" className="mb-2">
                                <UserAddOutlined className="text-zinc-400" />
                                <Text>New Donors</Text>
                            </Space>
                            <Title level={3} className="!m-0">{stats.new_donors}</Title>
                        </Card>
                    </Col>

                </Row>

                {/* 🔥 CHARTS */}
                <Row gutter={[16, 16]} className="mb-6">

                    <Col xs={24} md={12}>
                        <Card title={<Space><PieChartOutlined /> Donation Distribution</Space>} className="border">

                            {typeData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={typeData}
                                            dataKey="value"
                                            nameKey="type"
                                            outerRadius={100}
                                            stroke="none"
                                        >
                                            {typeData.map((_, index) => (
                                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <ReTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <Empty />}

                        </Card>
                    </Col>

                    {/* TREND CHART */}
                    <Col xs={24} md={12}>
                        <Card title={<Space><AreaChartOutlined /> Collection Trend</Space>} className="border">
                            {trendData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <ReTooltip />
                                        <Area type="monotone" dataKey="amount" stroke="#111" fill="#f4f4f5" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : <Empty />}
                        </Card>
                    </Col>

                </Row>

                {/* 🔥 TABLES */}
                <Row gutter={[16, 16]}>

                    {/* TOP DONORS */}
                    <Col xs={24} md={12}>
                        <Card title={<Space><TrophyOutlined /> Top Donors</Space>} className="border">

                            {topDonors.length > 0 ? (
                                topDonors.map((d, i) => (
                                    <div key={i} className="flex justify-between py-3 border-b last:border-0">
                                        <Text font-semibold>{d.name}</Text>
                                        <Text font-bold>₹{d.total.toLocaleString()}</Text>
                                    </div>
                                ))
                            ) : <Empty />}

                        </Card>
                    </Col>

                    {/* RECENT ACTIVITY */}
                    <Col xs={24} md={12}>
                        <Card title={<Space><HistoryOutlined /> Recent Activity</Space>} className="border">
                            {recentDonations.length > 0 ? (
                                recentDonations.map((d, i) => (
                                    <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                                        <Space>
                                            <Avatar size="small" className="bg-zinc-800">{d.initials}</Avatar>
                                            <div>
                                                <Text className="block font-medium">{d.donor_name}</Text>
                                                <Text className="text-zinc-400 text-xs">{dayjs(d.creation).fromNow()}</Text>
                                            </div>
                                        </Space>
                                        <div className="text-right">
                                            <Text className="block font-bold">₹{d.total_amount.toLocaleString()}</Text>
                                            <Tag className="m-0 border-none bg-zinc-100 text-zinc-500 text-[10px]">{d.category}</Tag>
                                        </div>
                                    </div>
                                ))
                            ) : <Empty />}
                        </Card>
                    </Col>

                </Row>
                </Spin>
        </div>
    );
};

export default Dashboard;