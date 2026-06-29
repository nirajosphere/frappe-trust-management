import React, { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Table, Button, Select, Space, Typography, Tag, notification, Progress } from "antd";
import { 
    HomeOutlined, CheckCircleOutlined, InfoCircleOutlined, ClockCircleOutlined,
    CalendarOutlined, UserOutlined, LoginOutlined, LogoutOutlined 
} from "@ant-design/icons";
import { useFrappeGetDocList } from "../../../hooks/useFrappe";

const { Title, Text } = Typography;

const RoomDashboard = () => {
    const [selectedTemple, setSelectedTemple] = useState(null);
    const [data, setData] = useState({
        stats: { total: 0, available: 0, reserved: 0, occupied: 0, cleaning: 0, maintenance: 0 },
        todays_check_ins: [],
        todays_check_outs: [],
        upcoming_bookings: []
    });
    const [loading, setLoading] = useState(false);

    // Fetch Temples
    const { data: temples, loading: loadingTemples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        limit: 1000
    });

    const fetchDashboardData = () => {
        if (typeof frappe === "undefined") return;

        setLoading(true);
        frappe.call({
            method: "temple_donation.api.room_booking.get_room_dashboard_data",
            args: { temple: selectedTemple },
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
        fetchDashboardData();
    }, [selectedTemple]);

    const handleCheckIn = (bookingName) => {
        if (typeof frappe === "undefined") return;

        setLoading(true);
        frappe.call({
            method: "frappe.client.set_value",
            args: {
                doctype: "Room Booking",
                name: bookingName,
                fieldname: {
                    status: "Checked In"
                }
            },
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
        { 
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
        }
    ];

    const columnsCheckOut = [
        { title: "Guest Name", dataIndex: "guest_name", key: "guest_name", render: (t) => <Text strong>{t}</Text> },
        { title: "Room Number", dataIndex: "room", key: "room", render: (r) => <Tag color="orange">{r}</Tag> },
        { title: "Scheduled Out", dataIndex: "check_out", key: "check_out", render: formatDateTime },
        { title: "Payment", dataIndex: "payment_status", key: "payment_status", render: (p) => {
            const color = p === "Paid" ? "green" : p === "Partial" ? "gold" : "red";
            return <Tag color={color}>{p}</Tag>;
        }},
        { 
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
        }
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

    return (
        <div style={{ padding: "24px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>Room Dashboard</Title>
                    <Text type="secondary">Real-time room occupancy, operations, and booking timeline analytics</Text>
                </div>
                <Space>
                    <Text strong>Filter by Temple:</Text>
                    <Select 
                        showSearch 
                        placeholder="All Temples"
                        style={{ width: "220px" }}
                        optionFilterProp="children"
                        allowClear
                        loading={loadingTemples}
                        onChange={(val) => setSelectedTemple(val)}
                        options={temples?.map(t => ({ label: t.temple_name, value: t.name })) || []}
                    />
                </Space>
            </div>

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

            {/* Operational Action Lists */}
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <Card title="Today's Check Ins" style={cardStyles} bordered={false}>
                        <Table 
                            columns={columnsCheckIn} 
                            dataSource={data.todays_check_ins} 
                            rowKey="name"
                            loading={loading}
                            pagination={{ pageSize: 5 }}
                            locale={{ emptyText: "No check-ins scheduled for today" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Today's Check Outs" style={cardStyles} bordered={false}>
                        <Table 
                            columns={columnsCheckOut} 
                            dataSource={data.todays_check_outs} 
                            rowKey="name"
                            loading={loading}
                            pagination={{ pageSize: 5 }}
                            locale={{ emptyText: "No check-outs scheduled for today" }}
                        />
                    </Card>
                </Col>
                <Col xs={24}>
                    <Card title="Upcoming Bookings (Next 7 Days)" style={cardStyles} bordered={false}>
                        <Table 
                            columns={columnsUpcoming} 
                            dataSource={data.upcoming_bookings} 
                            rowKey="name"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                            locale={{ emptyText: "No upcoming bookings found" }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default RoomDashboard;
