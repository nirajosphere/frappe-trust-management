import React, { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Table, Button, Select, Space, Typography, Tag, notification, Progress, DatePicker, Radio, Popover } from "antd";
import { 
    HomeOutlined, CheckCircleOutlined, InfoCircleOutlined, ClockCircleOutlined,
    CalendarOutlined, UserOutlined, LoginOutlined, LogoutOutlined, ReloadOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useFrappeGetDocList } from "../../../hooks/useFrappe";
import PageHeader from "../../../components/common/PageHeader";
import { useUser } from "../../../context/UserContext";

const { Title, Text } = Typography;

const RoomDashboard = () => {
    const { permissions, isSystemManager, isSuperAdmin, isAdmin } = useUser();
    const hasFullAccess = isSystemManager || isSuperAdmin || isAdmin;

    const bookingPermOverride = permissions?.find(p => p.doctype === "Room Booking");
    const bookingPerm = {
        read: hasFullAccess || (bookingPermOverride ? !!bookingPermOverride.read : true),
        write: hasFullAccess || (bookingPermOverride ? !!bookingPermOverride.write : true)
    };

    const [selectedTemple, setSelectedTemple] = useState(null);
    const [periodType, setPeriodType] = useState("today"); // 'today', 'week', 'month', 'custom'
    const [customRange, setCustomRange] = useState([]); // [dayjs, dayjs]
    const [popoverVisible, setPopoverVisible] = useState(false);
    const [data, setData] = useState({
        stats: { total: 0, available: 0, reserved: 0, occupied: 0, cleaning: 0, maintenance: 0 },
        todays_check_ins: [],
        todays_check_outs: [],
        upcoming_bookings: [],
        period_metrics: { total_bookings: 0, total_revenue: 0 }
    });
    const [loading, setLoading] = useState(false);

    const [checkInsPage, setCheckInsPage] = useState(1);
    const [checkInsPageSize, setCheckInsPageSize] = useState(5);
    const [checkOutsPage, setCheckOutsPage] = useState(1);
    const [checkOutsPageSize, setCheckOutsPageSize] = useState(5);
    const [upcomingPage, setUpcomingPage] = useState(1);
    const [upcomingPageSize, setUpcomingPageSize] = useState(10);

    useEffect(() => {
        setCheckInsPage(1);
        setCheckOutsPage(1);
        setUpcomingPage(1);
    }, [selectedTemple, periodType, customRange, data?.todays_check_ins?.length, data?.todays_check_outs?.length, data?.upcoming_bookings?.length]);

    // Fetch Temples
    const { data: temples, loading: loadingTemples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        limit: 1000
    });

    const getPeriodDates = () => {
        let fromDate = null;
        let toDate = null;
        const now = dayjs();
        
        if (periodType === "today") {
            fromDate = now.format("YYYY-MM-DD");
            toDate = now.format("YYYY-MM-DD");
        } else if (periodType === "week") {
            fromDate = now.subtract(7, "day").format("YYYY-MM-DD");
            toDate = now.format("YYYY-MM-DD");
        } else if (periodType === "month") {
            fromDate = now.subtract(30, "day").format("YYYY-MM-DD");
            toDate = now.format("YYYY-MM-DD");
        } else if (periodType === "custom" && customRange && customRange.length === 2) {
            fromDate = customRange[0].format("YYYY-MM-DD");
            toDate = customRange[1].format("YYYY-MM-DD");
        }
        
        return { fromDate, toDate };
    };

    const fetchDashboardData = () => {
        if (typeof frappe === "undefined") return;

        setLoading(true);
        const { fromDate, toDate } = getPeriodDates();
        frappe.call({
            method: "temple_donation.api.room_booking.get_room_dashboard_data",
            args: { 
                temple: selectedTemple,
                from_date: fromDate,
                to_date: toDate
            },
            callback: (r) => {
                setLoading(false);
                if (r.message) {
                    setData(r.message);
                }
            },
            error: () => setLoading(false)
        });
    };

    useEffect(() => {
        if (periodType === "custom" && (!customRange || customRange.length < 2)) {
            return;
        }
        fetchDashboardData();
    }, [selectedTemple, periodType, customRange]);

    const handleCheckIn = (bookingName) => {
        if (typeof frappe === "undefined") return;

        setLoading(true);
        frappe.call({
            method: "temple_donation.api.room_booking.check_in_booking",
            args: { booking_name: bookingName },
              callback: () => {
                notification.success({ message: "Check-in Successful", description: `Booking ${bookingName} checked in.` });
                fetchDashboardData();
            },
            error: () => setLoading(false)
        });
    };

    const handleCheckOut = (bookingName) => {
        if (typeof frappe === "undefined") return;

        setLoading(true);
        frappe.call({
            method: "temple_donation.api.room_booking.early_checkout",
            args: { booking_name: bookingName },
            callback: () => {
                notification.success({ message: "Check-out Successful", description: `Booking ${bookingName} checked out.` });
                fetchDashboardData();
            },
            error: () => setLoading(false)
        });
    };

    const stats = data.stats;

    // Formatting date helper
    const formatDateTime = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const columnsCheckIn = [
        { title: "Guest Name", dataIndex: "guest_name", key: "guest_name", render: (t) => <Text strong>{t}</Text> },
        { title: "Room Number", dataIndex: "room", key: "room", render: (r) => <Tag color="blue">{r}</Tag> },
        { title: "Scheduled In", dataIndex: "check_in", key: "check_in", render: formatDateTime },
        { title: "Adults/Kids", key: "guests", render: (_, record) => `${record.adults || 1}A / ${record.children || 0}C` },
        ...(bookingPerm.write ? [{ 
            title: "Actions", 
            key: "actions", 
            render: (_, record) => (
                <Button 
                    type="primary" 
                    icon={<LoginOutlined />} 
                    size="small" 
                    onClick={() => handleCheckIn(record.name)}
                >
                    Check In
                </Button>
            ) 
        }] : [])
    ];

    const columnsCheckOut = [
        { title: "Guest Name", dataIndex: "guest_name", key: "guest_name", render: (t) => <Text strong>{t}</Text> },
        { title: "Room Number", dataIndex: "room", key: "room", render: (r) => <Tag color="orange">{r}</Tag> },
        { title: "Scheduled Out", dataIndex: "check_out", key: "check_out", render: formatDateTime },
        { title: "Payment", dataIndex: "payment_status", key: "payment_status", render: (p) => {
            const color = p === "Paid" ? "green" : p === "Partial" ? "gold" : "red";
            return <Tag color={color}>{p}</Tag>;
        }},
        ...(bookingPerm.write ? [{ 
            title: "Actions", 
            key: "actions", 
            render: (_, record) => (
                <Button 
                    type="primary" 
                    danger
                    icon={<LogoutOutlined />} 
                    size="small" 
                    onClick={() => handleCheckOut(record.name)}
                >
                    Check Out
                </Button>
            ) 
        }] : [])
    ];

    const columnsUpcoming = [
        { title: "Guest Name", dataIndex: "guest_name", key: "guest_name" },
        { title: "Room Number", dataIndex: "room", key: "room", render: (r) => <Tag color="purple">{r}</Tag> },
        { title: "Check In", dataIndex: "check_in", key: "check_in", render: formatDateTime },
        { title: "Check Out", dataIndex: "check_out", key: "check_out", render: formatDateTime },
        { title: "Status", dataIndex: "status", key: "status", render: (s) => <Tag color="blue">{s}</Tag> }
    ];

    const cardStyles = {
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
    };

    const getPeriodSuffix = () => {
        if (periodType === "today") return "Today's";
        if (periodType === "week") return "Weekly";
        if (periodType === "month") return "Monthly";
        return "Period";
    };

    return (
        <div style={{ padding: "24px 0" }}>
            <PageHeader 
                title="Room Dashboard"
                description="Real-time room occupancy, operations, and booking timeline analytics"
                extra={(
                    <Space wrap size="middle">
                        <Select 
                            showSearch 
                            placeholder="All Trusts"
                            style={{ width: "200px" }}
                            optionFilterProp="children"
                            allowClear
                            loading={loadingTemples}
                            value={selectedTemple}
                            onChange={(val) => setSelectedTemple(val)}
                            options={temples?.map(t => ({ label: t.temple_name, value: t.name })) || []}
                        />
                        <Radio.Group 
                            value={periodType} 
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val !== "custom") {
                                    setPeriodType(val);
                                }
                            }}
                            optionType="button"
                            buttonStyle="solid"
                        >
                            <Radio.Button value="today">Today</Radio.Button>
                            <Radio.Button value="week">Week</Radio.Button>
                            <Radio.Button value="month">Month</Radio.Button>
                            <Popover
                                content={(
                                    <div style={{ padding: "4px" }} onClick={(e) => e.stopPropagation()}>
                                        <DatePicker.RangePicker 
                                            value={customRange}
                                            onChange={(dates) => {
                                                setCustomRange(dates);
                                                if (dates && dates.length === 2) {
                                                    setPopoverVisible(false);
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                                title="Select Custom Range"
                                trigger="click"
                                open={popoverVisible}
                                onOpenChange={(visible) => {
                                    setPopoverVisible(visible);
                                    if (visible) {
                                        setPeriodType("custom");
                                    }
                                }}
                            >
                                <Radio.Button value="custom" style={{ borderLeftWidth: "1px", borderRadius: "0 6px 6px 0" }}>
                                    {periodType === "custom" && customRange && customRange.length === 2 
                                        ? `${customRange[0].format("DD MMM")} - ${customRange[1].format("DD MMM")}`
                                        : "Custom"}
                                </Radio.Button>
                            </Popover>
                        </Radio.Group>
                        <Button 
                            type="default" 
                            icon={<ReloadOutlined />}
                            onClick={fetchDashboardData}
                            loading={loading}
                        >
                            Refresh Data
                        </Button>
                    </Space>
                )}
            />

            {/* KPI Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                <Col xs={12} sm={8} md={4}>
                    <Card style={cardStyles} bordered={false}>
                        <Statistic 
                            title="Total Rooms" 
                            value={stats.total} 
                            valueStyle={{ color: "#1f2937" }}
                            prefix={<HomeOutlined />} 
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card style={cardStyles} bordered={false}>
                        <Statistic 
                            title="Available" 
                            value={stats.available} 
                            valueStyle={{ color: "#10b981" }}
                            prefix={<CheckCircleOutlined />} 
                        />
                        <Progress percent={stats.total ? Math.round((stats.available / stats.total) * 100) : 0} showInfo={false} strokeColor="#10b981" size="small" />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card style={cardStyles} bordered={false}>
                        <Statistic 
                            title="Occupied" 
                            value={stats.occupied} 
                            valueStyle={{ color: "#ef4444" }}
                            prefix={<UserOutlined />} 
                        />
                        <Progress percent={stats.total ? Math.round((stats.occupied / stats.total) * 100) : 0} showInfo={false} strokeColor="#ef4444" size="small" />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card style={cardStyles} bordered={false}>
                        <Statistic 
                            title="Reserved" 
                            value={stats.reserved} 
                            valueStyle={{ color: "#3b82f6" }}
                            prefix={<CalendarOutlined />} 
                        />
                        <Progress percent={stats.total ? Math.round((stats.reserved / stats.total) * 100) : 0} showInfo={false} strokeColor="#3b82f6" size="small" />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card style={cardStyles} bordered={false}>
                        <Statistic 
                            title="Cleaning" 
                            value={stats.cleaning} 
                            valueStyle={{ color: "#f59e0b" }}
                            prefix={<ClockCircleOutlined />} 
                        />
                        <Progress percent={stats.total ? Math.round((stats.cleaning / stats.total) * 100) : 0} showInfo={false} strokeColor="#f59e0b" size="small" />
                    </Card>
                </Col>
                <Col xs={12} sm={8} md={4}>
                    <Card style={cardStyles} bordered={false}>
                        <Statistic 
                            title="Maintenance" 
                            value={stats.maintenance} 
                            valueStyle={{ color: "#8b5cf6" }}
                            prefix={<InfoCircleOutlined />} 
                        />
                        <Progress percent={stats.total ? Math.round((stats.maintenance / stats.total) * 100) : 0} showInfo={false} strokeColor="#8b5cf6" size="small" />
                    </Card>
                </Col>
            </Row>

            {/* Period Statistics Row */}
            <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                <Col xs={24} sm={12}>
                    <Card style={cardStyles} bordered={false}>
                        <Statistic 
                            title={`${getPeriodSuffix()} Total Bookings`}
                            value={data.period_metrics?.total_bookings || 0}
                            valueStyle={{ color: "#1f2937" }}
                            prefix={<CalendarOutlined />} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card style={cardStyles} bordered={false}>
                        <Statistic 
                            title={`${getPeriodSuffix()} Room Donation Revenue`}
                            value={Number(data.period_metrics?.total_revenue || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                            valueStyle={{ color: "#10b981" }}
                            // prefix={<span style={{ marginRight: 8 }}>₹</span>} 
                        />
                    </Card>
                </Col>
            </Row>

            {/* Operational Action Lists */}
            {bookingPerm.read ? (
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={12}>
                        <Card title={`${getPeriodSuffix()} Check Ins`} style={cardStyles} bordered={false}>
                            <Table 
                                className="aavatto-premium-table"
                                columns={columnsCheckIn} 
                                dataSource={data.todays_check_ins} 
                                rowKey="name"
                                loading={loading}
                                pagination={{
                                    current: checkInsPage,
                                    pageSize: checkInsPageSize,
                                    showSizeChanger: true,
                                    onChange: (p, s) => {
                                        setCheckInsPage(p);
                                        setCheckInsPageSize(s);
                                    }
                                }}
                                scroll={{ x: "max-content" }}
                                childrenColumnName="unused_children"
                                locale={{ emptyText: `No check-ins scheduled for ${periodType === 'today' ? 'today' : 'this period'}` }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title={`${getPeriodSuffix()} Check Outs`} style={cardStyles} bordered={false}>
                            <Table 
                                className="aavatto-premium-table"
                                columns={columnsCheckOut} 
                                dataSource={data.todays_check_outs} 
                                rowKey="name"   
                                loading={loading}
                                pagination={{
                                    current: checkOutsPage,
                                    pageSize: checkOutsPageSize,
                                    showSizeChanger: true,
                                    onChange: (p, s) => {
                                        setCheckOutsPage(p);
                                        setCheckOutsPageSize(s);
                                    }
                                }}
                                scroll={{ x: "max-content" }}
                                childrenColumnName="unused_children"
                                locale={{ emptyText: `No check-outs scheduled for ${periodType === 'today' ? 'today' : 'this period'}` }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24}>
                        <Card title="Upcoming Bookings (Next 7 Days)" style={cardStyles} bordered={false}>
                            <Table 
                                className="aavatto-premium-table"
                                columns={columnsUpcoming} 
                                dataSource={data.upcoming_bookings} 
                                rowKey="name"
                                loading={loading}
                                pagination={{
                                    current: upcomingPage,
                                    pageSize: upcomingPageSize,
                                    showSizeChanger: true,
                                    onChange: (p, s) => {
                                        setUpcomingPage(p);
                                        setUpcomingPageSize(s);
                                    }
                                }}
                                scroll={{ x: "max-content" }}
                                childrenColumnName="unused_children"
                                locale={{ emptyText: "No upcoming bookings found" }}
                            />
                        </Card>
                    </Col>
                </Row>
            ) : (
                <>
                </>
                // <Card style={cardStyles} bordered={false}>
                //     <div style={{ textAlign: "center", padding: "40px", color: "#8c8c8c" }}>
                //         You do not have permission to view room bookings.
                //     </div>
                // </Card>
            )}
        </div>
    );
};

export default RoomDashboard;
