import React, { useState, useEffect } from "react";
import { Table, Card, Select, Button, Space, Typography, Tag, Tooltip, notification } from "antd";
import { LeftOutlined, RightOutlined, PlusOutlined, CalendarOutlined } from "@ant-design/icons";
import { useFrappeGetDocList } from "../../../hooks/useFrappe";

const { Title, Text } = Typography;

const RoomCalendar = () => {
    const [selectedTemple, setSelectedTemple] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch Temples
    const { data: temples, loading: loadingTemples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        limit: 1000
    });

    // 7-day range starting from startDate
    const getDatesRange = () => {
        const range = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            range.push(date);
        }
        return range;
    };

    const dates = getDatesRange();

    const fetchCalendarData = () => {
        if (typeof frappe === "undefined") return;

        setLoading(true);

        const rangeStart = new Date(startDate);
        rangeStart.setHours(0, 0, 0, 0);

        const rangeEnd = new Date(startDate);
        rangeEnd.setDate(startDate.getDate() + 7);
        rangeEnd.setHours(23, 59, 59, 999);

        // Fetch Rooms
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Room",
                fields: ["name", "room_number", "temple", "room_type", "capacity", "price_per_day", "status"],
                filters: selectedTemple ? { temple: selectedTemple } : {},
                limit_page_length: 1000
            },
            callback: (rRooms) => {
                if (rRooms.message) {
                    setRooms(rRooms.message);
                }

                // Fetch Bookings overlapping this range
                frappe.call({
                    method: "frappe.client.get_list",
                    args: {
                        doctype: "Room Booking",
                        fields: ["name", "donor", "temple", "room", "check_in", "check_out", "guest_name", "status"],
                        filters: {
                            status: ["not in", ["Cancelled", "Checked Out"]],
                            check_in: ["<", rangeEnd.toISOString().replace('T', ' ').substring(0, 19)],
                            check_out: [">", rangeStart.toISOString().replace('T', ' ').substring(0, 19)]
                        },
                        limit_page_length: 1000
                    },
                    callback: (rBookings) => {
                        setLoading(false);
                        if (rBookings.message) {
                            setBookings(rBookings.message);
                        }
                    },
                    error: () => setLoading(false)
                });
            },
            error: () => setLoading(false)
        });
    };

    useEffect(() => {
        fetchCalendarData();
    }, [selectedTemple, startDate]);

    const handlePrevWeek = () => {
        const prev = new Date(startDate);
        prev.setDate(startDate.getDate() - 7);
        setStartDate(prev);
    };

    const handleNextWeek = () => {
        const next = new Date(startDate);
        next.setDate(startDate.getDate() + 7);
        setStartDate(next);
    };

    const handleToday = () => {
        setStartDate(new Date());
    };

    const handleNewBooking = (roomName, date) => {
        if (typeof frappe !== "undefined") {
            const checkIn = new Date(date);
            checkIn.setHours(12, 0, 0, 0); // standard checkin
            const checkOut = new Date(date);
            checkOut.setDate(checkOut.getDate() + 1);
            checkOut.setHours(11, 0, 0, 0); // standard checkout

            // Set route with parameters if needed or go to new booking
            // Using Frappe route setting
            frappe.set_route("temple-donation", "room-bookings", "new");
            // We can pass state in localStorage to auto-populate the form
            localStorage.setItem("prefilled_booking_room", roomName);
            localStorage.setItem("prefilled_booking_check_in", checkIn.toISOString().substring(0, 16));
            localStorage.setItem("prefilled_booking_check_out", checkOut.toISOString().substring(0, 16));
        }
    };

    // Columns config
    const columns = [
        {
            title: "Room Number",
            key: "room_number",
            fixed: "left",
            width: 150,
            render: (_, record) => (
                <div>
                    <Text strong style={{ fontSize: "15px" }}>{record.room_number}</Text>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>
                        {record.room_type} • {record.capacity} Pax
                    </div>
                </div>
            )
        },
        ...dates.map((date, idx) => {
            const dateStr = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
            const dayName = date.toLocaleDateString("en-IN", { weekday: "short" });
            
            return {
                title: (
                    <div style={{ textAlign: "center" }}>
                        <div>{dayName}</div>
                        <Text type="secondary" style={{ fontSize: "11px" }}>{dateStr}</Text>
                    </div>
                ),
                key: `date_${idx}`,
                width: 140,
                align: "center",
                render: (_, record) => {
                    // Check if there is a booking overlapping this day
                    const cellDateStart = new Date(date);
                    cellDateStart.setHours(0, 0, 0, 0);
                    const cellDateEnd = new Date(date);
                    cellDateEnd.setHours(23, 59, 59, 999);

                    const booking = bookings.find(b => {
                        if (b.room !== record.name) return false;
                        const bStart = new Date(b.check_in);
                        const bEnd = new Date(b.check_out);
                        return bStart <= cellDateEnd && bEnd >= cellDateStart;
                    });

                    if (booking) {
                        const isCheckedIn = booking.status === "Checked In";
                        return (
                            <Tooltip title={
                                <div>
                                    <p>Guest: {booking.guest_name}</p>
                                    <p>Check-in: {new Date(booking.check_in).toLocaleDateString()}</p>
                                    <p>Check-out: {new Date(booking.check_out).toLocaleDateString()}</p>
                                </div>
                            }>
                                <div 
                                    style={{
                                        background: isCheckedIn ? "#fee2e2" : "#dbeafe",
                                        border: `1px solid ${isCheckedIn ? "#fca5a5" : "#bfdbfe"}`,
                                        borderRadius: "6px",
                                        padding: "8px 4px",
                                        fontSize: "12px",
                                        color: isCheckedIn ? "#991b1b" : "#1e40af",
                                        fontWeight: "600",
                                        textAlign: "center",
                                        cursor: "pointer",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                    }}
                                    onClick={() => {
                                        frappe.set_route("temple-donation", "room-bookings", "view", booking.name);
                                    }}
                                >
                                    {booking.guest_name}
                                </div>
                            </Tooltip>
                        );
                    }

                    // Empty cell
                    return (
                        <div 
                            style={{
                                height: "36px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                borderRadius: "6px",
                                border: "1px dashed transparent"
                            }}
                            className="hover:border-blue-300 hover:bg-blue-50"
                            onClick={() => handleNewBooking(record.name, date)}
                        >
                            <PlusOutlined style={{ color: "#d1d5db" }} />
                        </div>
                    );
                }
            };
        })
    ];

    const cardStyles = {
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)"
    };

    return (
        <div style={{ padding: "24px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <Title level={2} style={{ margin: 0 }}>Room Calendar</Title>
                    <Text type="secondary">Interactive weekly booking calendar and quick reservation matrix</Text>
                </div>
                <Space size="middle">
                    <Button.Group>
                        <Button icon={<LeftOutlined />} onClick={handlePrevWeek} />
                        <Button onClick={handleToday}>Today</Button>
                        <Button icon={<RightOutlined />} onClick={handleNextWeek} />
                    </Button.Group>

                    <Select 
                        showSearch 
                        placeholder="All Temples"
                        style={{ width: "200px" }}
                        optionFilterProp="children"
                        allowClear
                        loading={loadingTemples}
                        onChange={(val) => setSelectedTemple(val)}
                        options={temples?.map(t => ({ label: t.temple_name, value: t.name })) || []}
                    />
                </Space>
            </div>

            <Card style={cardStyles} bordered={false} bodyStyle={{ padding: 0 }}>
                <Table 
                    columns={columns} 
                    dataSource={rooms} 
                    rowKey="name"
                    loading={loading}
                    pagination={{ pageSize: 15 }}
                    scroll={{ x: 1100 }}
                />
            </Card>
        </div>
    );
};

export default RoomCalendar;
