import React, { useState, useEffect } from "react";
import { Table, Card, Select, Button, Space, Typography, Tag, Tooltip, notification } from "antd";
import { LeftOutlined, RightOutlined, PlusOutlined, CalendarOutlined } from "@ant-design/icons";
import { useFrappeGetDocList } from "../../../hooks/useFrappe";

const { Title, Text } = Typography;

const RoomCalendar = () => {
    const [selectedTemple, setSelectedTemple] = useState(null);
    
    // Helper to get the Monday of any date
    const getMonday = (d) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Day is Sunday
        const monday = new Date(date.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
    };

    const [startDate, setStartDate] = useState(() => getMonday(new Date()));
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch Temples
    const { data: temples, loading: loadingTemples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        limit: 1000
    });

    // 7-day range starting from Monday startDate
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
        setStartDate(getMonday(new Date()));
    };

    const handleNewBooking = (roomName, date) => {
        if (typeof frappe !== "undefined") {
            const checkIn = new Date(date);
            const checkOut = new Date(date);
            checkOut.setDate(checkOut.getDate() + 1);

            const formatLocalDate = (d, hours) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const hh = String(hours).padStart(2, '0');
                return `${year}-${month}-${day}T${hh}:00:00`;
            };

            const checkInStr = formatLocalDate(checkIn, 12);
            const checkOutStr = formatLocalDate(checkOut, 11);

            frappe.set_route("temple-donation", "room-bookings", "new");
            localStorage.setItem("prefilled_booking_room", roomName);
            localStorage.setItem("prefilled_booking_check_in", checkInStr);
            localStorage.setItem("prefilled_booking_check_out", checkOutStr);
        }
    };

    const getCalendarHeaderTitle = () => {
        const start = dates[0];
        const end = dates[dates.length - 1];
        if (!start || !end) return "";
        
        const startMonth = start.toLocaleDateString("en-IN", { month: "long" });
        const startYear = start.getFullYear();
        const endMonth = end.toLocaleDateString("en-IN", { month: "long" });
        const endYear = end.getFullYear();

        if (startYear !== endYear) {
            return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
        } else if (startMonth !== endMonth) {
            return `${startMonth} - ${endMonth} ${startYear}`;
        } else {
            return `${startMonth} ${startYear}`;
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
                    // Pre-calculate bookings for all 7 days of the week for this room row
                    const dayBookings = dates.map(d => {
                        const cellDateStart = new Date(d);
                        cellDateStart.setHours(0, 0, 0, 0);
                        const cellDateEnd = new Date(d);
                        cellDateEnd.setHours(23, 59, 59, 999);

                        return bookings.find(b => {
                            if (b.room !== record.name) return false;
                            const bStart = new Date(b.check_in);
                            const bEnd = new Date(b.check_out);
                            return bStart <= cellDateEnd && bEnd >= cellDateStart;
                        });
                    });

                    const currentBooking = dayBookings[idx];

                    // Empty cell
                    if (!currentBooking) {
                        return {
                            children: (
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
                            ),
                            props: {
                                colSpan: 1
                            }
                        };
                    }

                    // Check if this booking began on a previous day in this week's visible range
                    const isFirstDayOfBookingInView = idx === 0 || dayBookings[idx - 1]?.name !== currentBooking.name;

                    if (!isFirstDayOfBookingInView) {
                        // This day is covered by a merge, hide this cell
                        return {
                            children: null,
                            props: {
                                colSpan: 0
                            }
                        };
                    }

                    // Calculate how many consecutive days the booking spans in this view from this point
                    let colSpan = 1;
                    for (let k = idx + 1; k < 7; k++) {
                        if (dayBookings[k]?.name === currentBooking.name) {
                            colSpan++;
                        } else {
                            break;
                        }
                    }

                    const isCheckedIn = currentBooking.status === "Checked In";
                    return {
                        children: (
                            <Tooltip title={
                                <div>
                                    <p>Guest: {currentBooking.guest_name}</p>
                                    <p>Check-in: {new Date(currentBooking.check_in).toLocaleDateString()}</p>
                                    <p>Check-out: {new Date(currentBooking.check_out).toLocaleDateString()}</p>
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
                                        whiteSpace: "nowrap",
                                        width: "100%"
                                    }}
                                    onClick={() => {
                                        frappe.set_route("temple-donation", "room-bookings", "view", currentBooking.name);
                                    }}
                                >
                                    {currentBooking.guest_name}
                                </div>
                            </Tooltip>
                        ),
                        props: {
                            colSpan: colSpan
                        }
                    };
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
                <Space size="middle" style={{ display: "flex", alignItems: "center" }}>
                    <Button.Group>
                        <Button icon={<LeftOutlined />} onClick={handlePrevWeek} />
                        <Button onClick={handleToday}>Today</Button>
                        <Button icon={<RightOutlined />} onClick={handleNextWeek} />
                    </Button.Group>

                    <Text strong style={{ fontSize: "16px", marginLeft: "8px", marginRight: "8px" }}>
                        {getCalendarHeaderTitle()}
                    </Text>

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
