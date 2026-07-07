import React, { useEffect, useState, useRef } from "react";
import {
    Modal, Input, Table, Select, Tag, Button, Row, Col, Space, Typography, Skeleton
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useFrappeGetDocList } from "../../hooks/useFrappe";

const { Text, Title } = Typography;

const RoomFinderModal = ({
    open,
    onCancel,
    onSelect,
    checkIn,
    checkOut,
    initialTemple,
    selectedRoomIds = []
}) => {
    const [search, setSearch] = useState("");
    const [availability, setAvailability] = useState("All");
    const [floor, setFloor] = useState("All");
    const [roomType, setRoomType] = useState("All");
    const [capacity, setCapacity] = useState("All");

    const [rooms, setRooms] = useState([]);
    const [totalRooms, setTotalRooms] = useState(0);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const searchInputRef = useRef(null);

    // Fetch dynamic options
    const { data: temples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        limit: 1000
    });

    const { data: roomTypes } = useFrappeGetDocList("Room Type", {
        fields: ["name", "room_type_name"],
        limit: 1000
    });

    // Reset filters on open
    useEffect(() => {
        if (open) {
            setSearch("");
            setAvailability("All");
            setFloor("All");
            setRoomType("All");
            setCapacity("All");
            setRooms([]);
            setTotalRooms(0);
            setCurrentPage(1);
            setHighlightedIndex(-1);
        }
    }, [open]);

    // Load rooms with search debounce & instant loading for other filters
    useEffect(() => {
        if (!open) return;

        // If search is empty, fetch immediately
        if (search.trim() === "") {
            fetchRooms(1);
            return;
        }

        // If typing a search keyword, debounce the API request
        const handler = setTimeout(() => {
            fetchRooms(1);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [search, availability, floor, roomType, capacity, initialTemple, open]);

    const fetchRooms = (pageNumber = 1) => {
        setLoading(true);
        setCurrentPage(pageNumber);
        const limit = 20;
        const offset = (pageNumber - 1) * limit;

        const args = {
            search: search.trim() || undefined,
            check_in: checkIn ? checkIn.format("YYYY-MM-DD HH:mm:ss") : undefined,
            check_out: checkOut ? checkOut.format("YYYY-MM-DD HH:mm:ss") : undefined,
            temple: initialTemple || undefined, // Locked to selected trust
            availability: availability,
            floor: floor,
            room_type: roomType,
            capacity: capacity,
            limit: limit,
            offset: offset
        };

        if (typeof frappe !== "undefined") {
            frappe.call({
                method: "temple_donation.api.room_booking.search_rooms",
                args,
                callback: (r) => {
                    setLoading(false);
                    if (r.message) {
                        setRooms(r.message.rooms || []);
                        setTotalRooms(r.message.total || 0);
                    }
                },
                error: () => {
                    setLoading(false);
                }
            });
        } else {
            setLoading(false);
        }
    };

    // Keyboard navigation and Auto-focus
    useEffect(() => {
        if (!open) return;

        const focusTimer = setTimeout(() => {
            if (searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }, 150);

        const handleKeyDown = (e) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightedIndex((prev) => {
                    if (rooms.length === 0) return -1;
                    const next = prev + 1;
                    return next >= rooms.length ? 0 : next;
                });
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightedIndex((prev) => {
                    if (rooms.length === 0) return -1;
                    const next = prev - 1;
                    return next < 0 ? rooms.length - 1 : next;
                });
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < rooms.length) {
                    const selectedRoom = rooms[highlightedIndex];
                    const isAlreadyAdded = selectedRoomIds.includes(selectedRoom.name);
                    if (selectedRoom.is_available && !isAlreadyAdded) {
                        handleSelect(selectedRoom);
                    }
                }
            } else if (e.key === "Escape") {
                onCancel();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            clearTimeout(focusTimer);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, rooms, highlightedIndex, selectedRoomIds]);

    // Update highlighted row when rooms change
    useEffect(() => {
        if (rooms.length > 0) {
            const firstAvail = rooms.findIndex(r => r.is_available && !selectedRoomIds.includes(r.name));
            setHighlightedIndex(firstAvail >= 0 ? firstAvail : 0);
        } else {
            setHighlightedIndex(-1);
        }
    }, [rooms, selectedRoomIds]);

    const handleSelect = (room) => {
        onSelect(room);
    };

    const getStatusBadge = (room) => {
        if (room.is_available) {
            return <Tag color="green" style={{ borderRadius: '12px', fontWeight: 'bold' }}>🟢 Available</Tag>;
        }
        const status = room.status || "Occupied";
        switch (status) {
            case "Occupied":
                return <Tag color="red" style={{ borderRadius: '12px', fontWeight: 'bold' }}>🔴 Occupied</Tag>;
            case "Cleaning":
                return <Tag color="gold" style={{ borderRadius: '12px', fontWeight: 'bold' }}>🟡 Cleaning</Tag>;
            case "Maintenance":
                return <Tag color="default" style={{ borderRadius: '12px', fontWeight: 'bold' }}>⚫ Maintenance</Tag>;
            default:
                return <Tag color="red" style={{ borderRadius: '12px', fontWeight: 'bold' }}>🔴 Occupied</Tag>;
        }
    };

    const columns = [
        {
            title: "Room Number",
            dataIndex: "room_number",
            key: "room_number",
            render: (text) => (
                <Text strong>
                    {text}
                </Text>
            )
        },
        {
            title: "Room Name",
            dataIndex: "description",
            key: "description",
            render: (text) => text || "—"
        },
        {
            title: "Room Type",
            dataIndex: "room_type_name",
            key: "room_type_name",
            render: (text) => text || "—"
        },
        {
            title: "Floor",
            dataIndex: "floor_number",
            key: "floor_number",
            align: "center",
            render: (val) => val === 0 ? "Ground" : `Floor ${val}`
        },
        {
            title: "Capacity",
            dataIndex: "capacity",
            key: "capacity",
            align: "center",
            render: (val) => `${val} Pax`
        },
        {
            title: "Price per Day",
            dataIndex: "price_per_day",
            key: "price_per_day",
            align: "right",
            render: (val) => (
                <Text strong style={{ color: "#18181b" }}>
                    ₹{Number(val || 0).toLocaleString()}
                </Text>
            )
        },
        {
            title: "Current Status",
            dataIndex: "status",
            key: "status",
            align: "center",
            render: (_, record) => getStatusBadge(record)
        },
        {
            title: "Action",
            key: "action",
            align: "center",
            fixed: "right",
            // width: 10,
            render: (_, record) => {
                const isAlreadyAdded = selectedRoomIds.includes(record.name);
                return (
                    <Button
                        type={isAlreadyAdded ? "default" : "primary"}
                        size="small"
                        disabled={!record.is_available || isAlreadyAdded}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(record);
                        }}
                    >
                        {isAlreadyAdded ? "Selected" : "Select"}
                    </Button>
                );
            }
        }
    ];

    const styleTag = (
        <style>{`
            .highlighted-row {
                background-color: #f4f4f5 !important;
                cursor: pointer;
            }
            .row-disabled {
                opacity: 0.65;
            }
            .room-finder-modal .ant-modal-content {
                border-radius: 12px;
                padding: 24px;
                max-width: 95vw;
            }
            .sticky-filters {
                position: sticky;
                top: 0;
                background: #fff;
                z-index: 10;
                padding-bottom: 16px;
                border-bottom: 1px solid #f0f0f0;
                margin-bottom: 16px;
            }
            .search-container {
                margin-bottom: 16px;
            }
            .room-finder-table .ant-table-row {
                transition: background-color 0.2s ease;
            }
            @media (max-width: 576px) {
                .room-finder-modal .ant-modal-content {
                    padding: 12px;
                }
                .sticky-filters {
                    padding-bottom: 8px;
                    margin-bottom: 8px;
                }
            }
        `}</style>
    );

    const initialTempleName = temples?.find(t => t.name === initialTemple)?.temple_name || initialTemple;

    return (
        <Modal
            title={<Title level={4} style={{ margin: 0 }}>Find Available Room</Title>}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={1000}
            className="room-finder-modal"
            centered
            destroyOnClose
        >
            {styleTag}
            <div className="sticky-filters">
                <div className="search-container">
                    <Input
                        ref={searchInputRef}
                        placeholder="Search by Room Number, Room Name, Room Type..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                        // size="large"
                        allowClear
                    />
                </div>

                <Row gutter={[12, 12]}>
                    <Col xs={24} sm={12} md={5}>
                        <div style={{ fontSize: "12px", color: "#8c8c8c", marginBottom: "4px" }}>Trust (Locked)</div>
                        <Select
                            value={initialTemple}
                            disabled
                            style={{ width: "100%" }}
                            options={[
                                { label: initialTempleName || "Global", value: initialTemple }
                            ]}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={5}>
                        <div style={{ fontSize: "12px", color: "#8c8c8c", marginBottom: "4px" }}>Availability</div>
                        <Select
                            value={availability}
                            onChange={setAvailability}
                            style={{ width: "100%" }}
                            options={[
                                { label: "All", value: "All" },
                                { label: "Available", value: "Available" },
                                { label: "Occupied", value: "Occupied" },
                                { label: "Cleaning", value: "Cleaning" },
                                { label: "Maintenance", value: "Maintenance" }
                            ]}
                        />
                    </Col>
                    <Col xs={24} sm={8} md={5}>
                        <div style={{ fontSize: "12px", color: "#8c8c8c", marginBottom: "4px" }}>Floor</div>
                        <Select
                            value={floor}
                            onChange={setFloor}
                            style={{ width: "100%" }}
                            options={[
                                { label: "All", value: "All" },
                                { label: "Ground", value: "Ground" },
                                { label: "First", value: "First" },
                                { label: "Second", value: "Second" },
                                { label: "Third", value: "Third" },
                                { label: "Fourth", value: "Fourth" }
                            ]}
                        />
                    </Col>
                    <Col xs={24} sm={8} md={5}>
                        <div style={{ fontSize: "12px", color: "#8c8c8c", marginBottom: "4px" }}>Room Type</div>
                        <Select
                            value={roomType}
                            onChange={setRoomType}
                            style={{ width: "100%" }}
                            options={[
                                { label: "All", value: "All" },
                                ...(roomTypes?.map(rt => ({ label: rt.room_type_name, value: rt.room_type_name })) || [])
                            ]}
                        />
                    </Col>
                    <Col xs={24} sm={8} md={4}>
                        <div style={{ fontSize: "12px", color: "#8c8c8c", marginBottom: "4px" }}>Capacity</div>
                        <Select
                            value={capacity}
                            onChange={setCapacity}
                            style={{ width: "100%" }}
                            options={[
                                { label: "All", value: "All" },
                                { label: "1 Pax", value: "1 Pax" },
                                { label: "2 Pax", value: "2 Pax" },
                                { label: "3 Pax", value: "3 Pax" },
                                { label: "4 Pax", value: "4 Pax" }
                            ]}
                        />
                    </Col>
                </Row>
            </div>

            {loading && rooms.length === 0 ? (
                <div style={{ padding: "32px 0" }}>
                    <Skeleton active paragraph={{ rows: 6 }} />
                </div>
            ) : (
                <Table
                    dataSource={rooms}
                    columns={columns}
                    rowKey="name"
                    className="room-finder-table"
                    rowClassName={(record, index) => {
                        let classes = "";
                        if (index === highlightedIndex) {
                            classes += " highlighted-row";
                        }
                        if (!record.is_available || selectedRoomIds.includes(record.name)) {
                            classes += " row-disabled";
                        }
                        return classes;
                    }}
                    onRow={(record) => ({
                        onClick: () => {
                            const isAlreadyAdded = selectedRoomIds.includes(record.name);
                            if (record.is_available && !isAlreadyAdded) {
                                handleSelect(record);
                            }
                        }
                    })}
                    pagination={{
                        current: currentPage,
                        pageSize: 20,
                        total: totalRooms,
                        showSizeChanger: false,
                        onChange: (page) => fetchRooms(page)
                    }}
                    scroll={{ x: "max-content", y: 350 }}
                />
            )}
        </Modal>
    );
};

export default RoomFinderModal;
