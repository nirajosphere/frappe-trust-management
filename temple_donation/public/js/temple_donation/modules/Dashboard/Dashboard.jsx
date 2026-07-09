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
import ViewContainer from "../../components/common/ViewContainer";
import { useUser } from "../../context/UserContext";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ["#111", "#555", "#999", "#ccc"];

const Dashboard = () => {
    const { permissions, isSystemManager: isSysMgr, isSuperAdmin, isAdmin } = useUser();
    const hasFullAccess = isSysMgr || isSuperAdmin || isAdmin;

    const donationPerm = permissions?.find(p => p.doctype === "Donation");
    const donorPerm = permissions?.find(p => p.doctype === "Donor");
    const templePerm = permissions?.find(p => p.doctype === "Temple");
    const userPerm = permissions?.find(p => p.doctype === "User");

    const hasDonationRead = hasFullAccess || (donationPerm ? !!donationPerm.read : true);
    const hasDonorRead = hasFullAccess || (donorPerm ? !!donorPerm.read : true);
    const hasTempleRead = hasFullAccess || (templePerm ? !!templePerm.read : true);
    const hasUserRead = hasFullAccess || (userPerm ? !!userPerm.read : true);

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

    const [allowedTemples, setAllowedTemples] = useState([]);
    const [allowedUsers, setAllowedUsers] = useState([]);
    const [isSystemManager, setIsSystemManager] = useState(true);

    const templeSearchTimer = useRef(null);
    const userSearchTimer = useRef(null);

    const buildFilterParams = useCallback((filterState = filters) => ({
        temple: filterState.temple,
        user: filterState.user,
        from_date: filterState.dateRange?.[0]?.format("YYYY-MM-DD"),
        to_date: filterState.dateRange?.[1]?.format("YYYY-MM-DD")
    }), [filters]);

    const searchTemples = async (searchText = "", limitToTemples = null) => {
        if (!hasTempleRead) return;
        setOptionsLoading((prev) => ({ ...prev, temple: true }));
        try {
            const args = {
                doctype: "Temple",
                fields: ["name", "temple_name"],
                filters: {},
                limit_page_length: 50,
                order_by: "temple_name asc"
            };

            const targetAllowed = limitToTemples !== null ? limitToTemples : allowedTemples;
            if (targetAllowed && targetAllowed.length > 0) {
                args.filters.name = ["in", targetAllowed];
            }

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

    const searchUsers = async (searchText = "", limitToUsers = null) => {
        if (!hasUserRead) return;
        setOptionsLoading((prev) => ({ ...prev, user: true }));
        try {
            const args = {
                doctype: "User",
                fields: ["name", "full_name"],
                filters: { enabled: 1, name: ["not in", ["Administrator", "Guest"]] },
                limit_page_length: 50,
                order_by: "full_name asc"
            };

            const targetAllowed = limitToUsers !== null ? limitToUsers : allowedUsers;
            if (targetAllowed && targetAllowed.length > 0) {
                args.filters.name = ["in", targetAllowed];
            }

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
            const promises = [];

            if (hasDonationRead) {
                promises.push(
                    frappe.call({
                        method: "temple_donation.api.get_dashboard_stats",
                        args: params
                    }).then(res => ({ type: "stats", data: res.message || {} })),
                    frappe.call({
                        method: "temple_donation.api.get_donations_by_type",
                        args: params
                    }).then(res => ({ type: "types", data: res.message || [] })),
                    frappe.call({
                        method: "temple_donation.api.get_monthly_donations",
                        args: { temple: params.temple, user: params.user }
                    }).then(res => ({ type: "trend", data: res.message || [] })),
                    frappe.call({
                        method: "temple_donation.api.get_recent_donations",
                        args: { temple: params.temple, user: params.user, limit: 5 }
                    }).then(res => ({ type: "recent", data: res.message || [] }))
                );
            }

            if (hasDonorRead) {
                promises.push(
                    frappe.call({
                        method: "temple_donation.api.get_top_donors",
                        args: params
                    }).then(res => ({ type: "donors", data: res.message || [] }))
                );
            }

            const results = await Promise.all(promises);

            results.forEach((res) => {
                if (res.type === "stats") {
                    setStats(res.data);
                } else if (res.type === "types") {
                    setTypeData(res.data);
                } else if (res.type === "trend") {
                    setTrendData(res.data);
                } else if (res.type === "recent") {
                    setRecentDonations(res.data);
                } else if (res.type === "donors") {
                    setTopDonors(res.data);
                }
            });

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initDashboard = async () => {
            if (!hasDonationRead && !hasDonorRead) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                let systemManager = true;
                let templesToAllow = null;
                let usersToAllow = null;

                if (typeof frappe !== "undefined" && frappe.session.user !== "Administrator") {
                    const userRoles = frappe.user_roles || [];
                    const isManager = userRoles.includes("System Manager") || userRoles.includes("Super Admin");

                    if (!isManager) {
                        systemManager = false;
                        // Fetch assigned temples for the current user
                        const userRes = await frappe.call({
                            method: "frappe.client.get",
                            args: {
                                doctype: "User",
                                name: frappe.session.user
                            }
                        });

                        const myTemples = userRes.message?.custom_select_temple?.map(t => t.temple) || [];
                        if (myTemples.length > 0) {
                            templesToAllow = myTemples;

                            // Fetch other users who are also assigned to these temples
                            const userDetailsRes = await frappe.call({
                                method: "temple_donation.api.get_users_assigned_to_temples",
                                args: {
                                    temples: JSON.stringify(myTemples)
                                }
                            });

                            const matchedUsers = Array.from(new Set(userDetailsRes.message || []));
                            if (!matchedUsers.includes(frappe.session.user)) {
                                matchedUsers.push(frappe.session.user);
                            }
                            usersToAllow = matchedUsers;
                        }
                    }
                }

                setIsSystemManager(systemManager);
                setAllowedTemples(templesToAllow || []);
                setAllowedUsers(usersToAllow || []);

                await Promise.all([
                    hasTempleRead ? searchTemples("", templesToAllow) : Promise.resolve(),
                    hasUserRead ? searchUsers("", usersToAllow) : Promise.resolve(),
                    fetchData()
                ]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        initDashboard();
    }, [hasDonationRead, hasDonorRead]);

    // 🔥 DATE TYPE HANDLER
    const handleDateTypeChange = (value) => {
        let range = null;

        if (value === "today") {
            range = [dayjs().startOf("day"), dayjs().endOf("day")];
        } else if (value === "week") {
            range = [dayjs().startOf("week"), dayjs().endOf("week")];
        } else if (value === "month") {
            range = [dayjs().startOf("month"), dayjs().endOf("month")];
        }

        const nextFilters = {
            ...filters,
            dateType: value,
            dateRange: range
        };

        setFilters(nextFilters);

        if (value !== "custom") {
            fetchData(buildFilterParams(nextFilters));
        }
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

    if (!hasDonationRead && !hasDonorRead) {
        return (
            <ViewContainer>
                <PageHeader title="Dashboard" description="Analytics Overview" />
                <Card className="border border-zinc-200 mt-6 text-center py-12">
                    <Empty description="You do not have permission to view dashboard analytics." />
                </Card>
            </ViewContainer>
        );
    }

    if (loading && !stats.total_donation) {
        return <PageLoader />;
    }

    const showFilterCard = hasTempleRead || hasUserRead || hasDonationRead;

    // Calculate dynamic column spans for stats widgets
    const statsCols = [];
    if (hasDonationRead) {
        statsCols.push("donation_total", "donation_category");
    }
    if (hasDonorRead) {
        statsCols.push("donor_new");
    }
    const statSpan = statsCols.length > 0 ? 24 / statsCols.length : 24;

    return (
        <ViewContainer>
            <PageHeader title="Dashboard" description="Analytics Overview" />
            
            {/* 🔥 FILTER */}
            {showFilterCard && (
                <Card className="border border-zinc-200 mb-6">
                    <Row gutter={[16, 16]}>
                        {/* TEMPLE */}
                        {hasTempleRead && (
                            <Col xs={24} md={hasUserRead && hasDonationRead ? 6 : 8}>
                                <Text>Search By Trust</Text>
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
                        )}

                        {/* USER */}
                        {hasUserRead && (
                            <Col xs={24} md={hasTempleRead && hasDonationRead ? 6 : 8}>
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
                        )}

                        {/* DATE */}
                        {hasDonationRead && (
                            <Col xs={24} md={hasTempleRead && hasUserRead ? 6 : 8}>
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
                                            onChange={(dates) => {
                                                const nextFilters = { ...filters, dateRange: dates };
                                                setFilters(nextFilters);
                                                if (dates && dates[0] && dates[1]) {
                                                    fetchData(buildFilterParams(nextFilters));
                                                }
                                            }}
                                        />
                                    )}
                                </Space>
                            </Col>
                        )}

                        <Col xs={24} md={hasTempleRead && hasUserRead && hasDonationRead ? 6 : 8}>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button onClick={handleClear}>Clear Filter</Button>
                                <Button type="primary" onClick={handleSubmit}>
                                    Submit
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Card>
            )}

            {/* 🔥 STATS */}
            <Spin spinning={loading}>
                <Row gutter={[16, 16]} className="mb-6">
                    {hasDonationRead && (
                        <Col xs={24} md={statSpan}>
                            <Card className="border">
                                <Space align="center" className="mb-2">
                                    <WalletOutlined className="text-zinc-400" />
                                    <Text>Total Donation</Text>
                                </Space>
                                <Title level={3} className="!m-0">₹{(stats.total_donation || 0).toLocaleString()}</Title>
                            </Card>
                        </Col>
                    )}

                    {hasDonationRead && (
                        <Col xs={24} md={statSpan}>
                            <Card className="border">
                                <Space align="center" className="mb-2">
                                    <AppstoreOutlined className="text-zinc-400" />
                                    <Text>Top Category</Text>
                                </Space>
                                <Title level={3} className="!m-0 truncate">{stats.top_category}</Title>
                            </Card>
                        </Col>
                    )}

                    {hasDonorRead && (
                        <Col xs={24} md={statSpan}>
                            <Card className="border">
                                <Space align="center" className="mb-2">
                                    <UserAddOutlined className="text-zinc-400" />
                                    <Text>New Donors</Text>
                                </Space>
                                <Title level={3} className="!m-0">{stats.new_donors}</Title>
                            </Card>
                        </Col>
                    )}
                </Row>

                {/* 🔥 CHARTS */}
                {hasDonationRead && (
                    <Row gutter={[16, 16]} className="mb-6">
                        <Col xs={24} md={12}>
                            <Card title={<Space><PieChartOutlined /> Donation Distribution</Space>} className="border !h-full">
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

                        <Col xs={24} md={12}>
                            <Card title={<Space><AreaChartOutlined /> Collection Trend</Space>} className="border !h-full">
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
                )}

                {/* 🔥 TABLES */}
                <Row gutter={[16, 16]}>
                    {/* TOP DONORS */}
                    {hasDonationRead && hasDonorRead && (
                        <Col xs={24} md={hasDonationRead ? 12 : 24}>
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
                    )}

                    {/* RECENT ACTIVITY */}
                    {hasDonationRead && (
                        <Col xs={24} md={hasDonorRead ? 12 : 24}>
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
                    )}
                </Row>
            </Spin>
        </ViewContainer>
    );
};

export default Dashboard;