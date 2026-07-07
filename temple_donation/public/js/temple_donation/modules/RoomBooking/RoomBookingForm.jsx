import React, { useEffect, useState } from "react";
import {
    Form, Input, Button, Alert, Select, DatePicker, Row, Col, Typography, InputNumber, Tag, message, Space, List, Divider
} from "antd";
import dayjs from "dayjs";
import {
    useFrappeGetDoc, useFrappeUpdateDoc, useFrappeCreateDoc, useFrappeGetDocList
} from "../../hooks/useFrappe";
import { DOCTYPE_ROOM_BOOKING } from "../../config/constants";
import AddPageHeader from "../../components/common/AddPageHeader";
import PageLoader from "../../components/common/PageLoader";
import FormFooter from "../../components/common/FormFooter";
import ViewContainer from "../../components/common/ViewContainer";
import SectionCard from "../../components/common/SectionCard";
import { UserOutlined, HomeOutlined, CalendarOutlined, FileTextOutlined, DeleteOutlined } from "@ant-design/icons";
import RoomFinderModal from "./RoomFinderModal";

const { Text, Title } = Typography;
const { TextArea } = Input;

const RoomBookingForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const [selectedRooms, setSelectedRooms] = useState([]);

    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(DOCTYPE_ROOM_BOOKING, id);

    // Watch values in real-time
    const guestCount = Form.useWatch("number_of_guests", form) || 1;
    const checkIn = Form.useWatch("check_in", form);
    const checkOut = Form.useWatch("check_out", form);
    const nights = (checkIn && checkOut) ? Math.max(1, dayjs(checkOut).diff(dayjs(checkIn), "day")) : 1;

    // Fetch link options
    const { data: donors, loading: loadingDonors } = useFrappeGetDocList("Donor", {
        fields: ["name", "donor_name"],
        limit: 1000
    });
    const { data: temples, loading: loadingTemples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        limit: 1000
    });

    // Load initial data
    useEffect(() => {
        if (isEdit && initialValues) {
            form.setFieldsValue({
                ...initialValues,
                check_in: initialValues.check_in ? dayjs(initialValues.check_in) : null,
                check_out: initialValues.check_out ? dayjs(initialValues.check_out) : null
            });

            if (initialValues.rooms && initialValues.rooms.length > 0) {
                const fetchAllRoomDetails = async () => {
                    const promises = initialValues.rooms.map(r => {
                        return new Promise((resolve) => {
                            if (typeof frappe !== "undefined") {
                                frappe.db.get_doc("Room", r.room_id).then(roomDoc => {
                                    frappe.db.get_value("Room Type", roomDoc.room_type, "room_type_name", (rt) => {
                                        resolve({
                                            name: roomDoc.name,
                                            room_number: roomDoc.room_number,
                                            description: roomDoc.description,
                                            room_type_name: rt ? rt.room_type_name : roomDoc.room_type,
                                            capacity: roomDoc.capacity,
                                            price_per_day: roomDoc.price_per_day,
                                            status: roomDoc.status
                                        });
                                    });
                                });
                            } else {
                                resolve(null);
                            }
                        });
                    });
                    const details = await Promise.all(promises);
                    const resolvedRooms = details.filter(Boolean);
                    setSelectedRooms(resolvedRooms);
                    calculateTotalAmount(resolvedRooms);
                };
                fetchAllRoomDetails();
            }
        } else {
            const prefilledRoom = localStorage.getItem("prefilled_booking_room");
            const prefilledCheckIn = localStorage.getItem("prefilled_booking_check_in");
            const prefilledCheckOut = localStorage.getItem("prefilled_booking_check_out");

            if (prefilledRoom && prefilledCheckIn && prefilledCheckOut) {
                const cIn = dayjs(prefilledCheckIn);
                const cOut = dayjs(prefilledCheckOut);
                form.setFieldsValue({
                    status: "Booked",
                    check_in: cIn,
                    check_out: cOut,
                    number_of_guests: 1,
                    adults: 1,
                    children: 0
                });

                if (typeof frappe !== "undefined") {
                    frappe.db.get_doc("Room", prefilledRoom).then(r => {
                        if (r && r.temple) {
                            form.setFieldsValue({ temple: r.temple });
                        }
                        frappe.db.get_value("Room Type", r.room_type, "room_type_name", (rt) => {
                            const initialRoom = {
                                name: r.name,
                                room_number: r.room_number,
                                description: r.description,
                                room_type_name: rt ? rt.room_type_name : r.room_type,
                                capacity: r.capacity,
                                price_per_day: r.price_per_day,
                                status: r.status
                            };
                            setSelectedRooms([initialRoom]);
                            calculateTotalAmount([initialRoom]);
                        });
                    });
                }

                localStorage.removeItem("prefilled_booking_room");
                localStorage.removeItem("prefilled_booking_check_in");
                localStorage.removeItem("prefilled_booking_check_out");
            } else {
                form.setFieldsValue({
                    status: "Booked",
                    check_in: dayjs(),
                    check_out: dayjs().add(1, 'day'),
                    number_of_guests: 1,
                    adults: 1,
                    children: 0
                });
            }
        }
    }, [isEdit, initialValues, form]);

    useEffect(() => {
        if (!isEdit && !localStorage.getItem("prefilled_booking_room") && temples && temples.length > 0) {
            const currentTemple = form.getFieldValue("temple");
            if (!currentTemple) {
                form.setFieldsValue({ temple: temples[0].name });
            }
        }
    }, [temples, isEdit, form]);

    const calculateTotalAmount = (roomsList = selectedRooms) => {
        const checkIn = form.getFieldValue("check_in");
        const checkOut = form.getFieldValue("check_out");
        if (checkIn && checkOut && roomsList.length > 0) {
            const diff = dayjs(checkOut).diff(dayjs(checkIn), "day");
            const days = diff <= 0 ? 1 : diff;
            const sumPrice = roomsList.reduce((acc, r) => acc + Number(r.price_per_day || 0), 0);
            form.setFieldsValue({ total_amount: sumPrice * days });
        } else {
            form.setFieldsValue({ total_amount: 0 });
        }
    };

    const handleValuesChange = (changedValues, allValues) => {
        if (changedValues.hasOwnProperty("adults") || changedValues.hasOwnProperty("children")) {
            form.setFieldsValue({
                number_of_guests: (allValues.adults || 0) + (allValues.children || 0)
            });
        } else if (changedValues.hasOwnProperty("number_of_guests")) {
            const guests = changedValues.number_of_guests || 1;
            const children = allValues.children || 0;
            form.setFieldsValue({
                adults: guests < children ? 1 : guests - children,
                children: guests < children ? Math.max(0, guests - 1) : children
            });
        }
    };

    const handleDateChange = () => {
        if (selectedRooms.length > 0) {
            setSelectedRooms([]);
            calculateTotalAmount([]);
            message.info("Booking dates changed. Selected rooms have been reset.");
        }
    };

    const handleTempleChange = () => {
        if (selectedRooms.length > 0) {
            setSelectedRooms([]);
            calculateTotalAmount([]);
            message.info("Trust selection changed. Selected rooms have been reset.");
        }
    };

    const handleOpenRoomFinder = () => {
        if (!form.getFieldValue("check_in") || !form.getFieldValue("check_out")) {
            message.warning("Please select Check-in and Check-out dates first.");
            return;
        }
        if (!form.getFieldValue("temple")) {
            message.warning("Please select a Trust first.");
            return;
        }
        setIsRoomModalOpen(true);
    };

    const handleRoomSelected = (room) => {
        if (selectedRooms.some(r => r.name === room.name)) {
            message.warning("Room is already selected.");
            return;
        }
        const newRooms = [...selectedRooms, room];
        setSelectedRooms(newRooms);
        calculateTotalAmount(newRooms);
        setIsRoomModalOpen(false);
    };

    const handleRemoveRoom = (roomName) => {
        const newRooms = selectedRooms.filter(r => r.name !== roomName);
        setSelectedRooms(newRooms);
        calculateTotalAmount(newRooms);
    };

    const totalCapacity = selectedRooms.reduce((acc, r) => acc + Number(r.capacity || 0), 0);

    const handleSave = async (values) => {
        if (selectedRooms.length === 0) {
            message.error("Please select at least one room.");
            return;
        }
        if (totalCapacity < guestCount) {
            message.error(`Selected rooms can accommodate only ${totalCapacity} guests.`);
            return;
        }

        try {
            const payload = {
                ...values,
                check_in: values.check_in?.format("YYYY-MM-DD HH:mm:ss") || null,
                check_out: values.check_out?.format("YYYY-MM-DD HH:mm:ss") || null,
                room: selectedRooms[0]?.name || null,
                rooms: selectedRooms.map(r => ({ room_id: r.name, capacity: r.capacity }))
            };

            if (isEdit) {
                await updateDoc(DOCTYPE_ROOM_BOOKING, id, payload);
            } else {
                await createDoc(DOCTYPE_ROOM_BOOKING, payload);
            }
            if (onBack) onBack();
        } catch (err) {
            console.error(err);
        }
    };

    if (fetching && isEdit) return <PageLoader />;
    if (fetchError) return <Alert message="Error loading room booking" type="error" action={<Button onClick={onBack}>Back</Button>} />;

    return (
        <ViewContainer>
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Update Booking" : "New Room Booking"}
                subtitle="Reservation Details"
                showBack={true}
            />

            <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleSave} 
                onValuesChange={handleValuesChange} 
                requiredMark={false}
            >
                <Row gutter={[24, 24]}>
                    {/* LEFT COLUMN: Configuration details */}
                    <Col xs={24} lg={14}>
                        <Space direction="vertical" size="large" className="w-full">
                            
                            {/* Guest Information Card */}
                            <SectionCard title="Guest Information" icon={<UserOutlined style={{ color: '#002140' }} />}>
                                <Row gutter={[16, 0]}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="guest_name" label="Guest Name" rules={[{ required: true, message: "Required" }]}>
                                            <Input placeholder="Enter guest name" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="guest_id" label="Guest ID (Aadhaar/PAN)" rules={[{ required: true, message: "Required" }]}>
                                            <Input placeholder="Enter guest ID" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24}>
                                        <Form.Item name="donor" label="Donor (Optional)">
                                            <Select
                                                showSearch
                                                placeholder="Select Donor"
                                                optionFilterProp="children"
                                                allowClear
                                                loading={loadingDonors}
                                                options={donors?.map(d => ({ label: d.donor_name, value: d.name })) || []}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={8}>
                                        <Form.Item name="number_of_guests" label="Total Guests">
                                            <InputNumber min={1} className="w-full" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={12} sm={8}>
                                        <Form.Item name="adults" label="Adults">
                                            <InputNumber min={1} className="w-full" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={12} sm={8}>
                                        <Form.Item name="children" label="Children">
                                            <InputNumber min={0} className="w-full" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </SectionCard>

                            {/* Booking Details Card */}
                            <SectionCard title="Booking Schedule" icon={<CalendarOutlined style={{ color: '#002140' }} />}>
                                <Row gutter={[16, 0]}>
                                    <Col xs={24}>
                                        <Form.Item name="temple" label="Trust / Temple" rules={[{ required: true, message: "Required" }]}>
                                            <Select
                                                showSearch
                                                placeholder="Select Trust"
                                                optionFilterProp="children"
                                                loading={loadingTemples}
                                                onChange={handleTempleChange}
                                                options={temples?.map(t => ({ label: t.temple_name, value: t.name })) || []}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="check_in" label="Check-in" rules={[{ required: true, message: "Required" }]}>
                                            <DatePicker showTime format="DD-MM-YYYY HH:mm" className="w-full" onChange={handleDateChange} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="check_out" label="Check-out" rules={[{ required: true, message: "Required" }]}>
                                            <DatePicker showTime format="DD-MM-YYYY HH:mm" className="w-full" onChange={handleDateChange} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24}>
                                        <Form.Item name="status" label="Booking Status">
                                            <Select
                                                options={[
                                                    { label: "Booked", value: "Booked" },
                                                    { label: "Checked In", value: "Checked In" },
                                                    { label: "Checked Out", value: "Checked Out" },
                                                    { label: "Cancelled", value: "Cancelled" }
                                                ]}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </SectionCard>

                            {/* Remarks */}
                            <SectionCard title="Additional Notes" icon={<FileTextOutlined style={{ color: '#002140' }} />}>
                                <Form.Item name="remarks" noStyle>
                                    <TextArea rows={3} placeholder="Special instructions, preferences, etc." />
                                </Form.Item>
                            </SectionCard>
                        </Space>
                    </Col>

                    {/* RIGHT COLUMN: Room Selection, Financials & Live Analytics */}
                    <Col xs={24} lg={10}>
                        <Space direction="vertical" size="large" className="w-full" style={{ position: 'sticky', top: 24 }}>
                            
                            {/* Room Allocator Selection Card */}
                            <SectionCard title="Allocated Rooms" icon={<HomeOutlined style={{ color: '#002140' }} />}>
                                {totalCapacity < guestCount && selectedRooms.length > 0 && (
                                    <Alert
                                        message="Insufficient Capacity"
                                        description={`Selected rooms accommodate ${totalCapacity}/${guestCount} guests. Please allocate more capacity.`}
                                        type="error"
                                        showIcon
                                        style={{ marginBottom: 16 }}
                                    />
                                )}

                                <List
                                    dataSource={selectedRooms}
                                    locale={{ emptyText: <Text type="secondary">No rooms allocated yet.</Text> }}
                                    renderItem={room => (
                                        <List.Item
                                            style={{ padding: '12px 0' }}
                                            actions={[
                                                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveRoom(room.name)} />
                                            ]}
                                        >
                                            <List.Item.Meta
                                                title={<Text strong>Room {room.room_number} <Tag color="blue" style={{ marginLeft: 4 }}>{room.room_type_name || room.room_type}</Tag></Text>}
                                                description={
                                                    <Space direction="vertical" size={2}>
                                                        {room.description && <Text type="secondary" size="small">{room.description}</Text>}
                                                        <Text type="secondary" size="small">Capacity: {room.capacity} Pax • <b>₹{Number(room.price_per_day || 0).toLocaleString()}/day</b></Text>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />

                                <Button type="dashed" block  onClick={handleOpenRoomFinder} style={{ marginTop: 16 }}>
                                    + Allocate Room
                                </Button>
                            </SectionCard>

                            {/* Financial Summary panel */}
                            <SectionCard title="Billing & Summary" icon={<FileTextOutlined style={{ color: '#002140' }} />}>
                                <Row gutter={[16, 12]}>
                                    <Col span={12}>
                                        <Text type="secondary">Nights:</Text>
                                        <div><Text strong style={{ fontSize: 15 }}>{nights}</Text></div>
                                    </Col>
                                    <Col span={12}>
                                        <Text type="secondary">Total Capacity:</Text>
                                        <div>
                                            <Text strong style={{ fontSize: 15, color: totalCapacity >= guestCount ? "green" : "red" }}>
                                                {totalCapacity} / {guestCount} Pax
                                            </Text>
                                        </div>
                                    </Col>
                                </Row>

                                <Divider style={{ margin: '12px 0' }} />

                                <Row gutter={[16, 0]} align="bottom">
                                    <Col span={12}>
                                        <Form.Item name="total_amount" label="Total Amount (₹)" style={{ marginBottom: 0 }}>
                                            <InputNumber disabled className="w-full" style={{ color: '#000', fontWeight: 'bold' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="payment_status" label="Payment Status" style={{ marginBottom: 0 }}>
                                            <Select
                                                placeholder="Status"
                                                options={[
                                                    { label: "Pending", value: "Pending" },
                                                    { label: "Paid", value: "Paid" },
                                                    { label: "Partial", value: "Partial" }
                                                ]}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </SectionCard>

                        </Space>
                    </Col>
                </Row>

                <div style={{ marginTop: '24px' }}>
                    <FormFooter
                        onCancel={onBack}
                        loading={updating || creating}
                        isEdit={isEdit}
                        saveText={isEdit ? "Update Booking" : "Complete Reservation"}
                        disabled={selectedRooms.length === 0 || totalCapacity < guestCount}
                    />
                </div>
            </Form>

            <RoomFinderModal
                open={isRoomModalOpen}
                onCancel={() => setIsRoomModalOpen(false)}
                onSelect={handleRoomSelected}
                checkIn={form.getFieldValue("check_in")}
                checkOut={form.getFieldValue("check_out")}
                initialTemple={form.getFieldValue("temple")}
                selectedRoomIds={selectedRooms.map(r => r.name)}
            />
        </ViewContainer>
    );
};

export default RoomBookingForm;