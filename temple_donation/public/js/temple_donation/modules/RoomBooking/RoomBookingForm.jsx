import React, { useEffect, useState } from "react";
import {
    Form, Input, Button, Alert, Select, DatePicker, Row, Col, Typography, InputNumber, Tag, message
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
import { UserOutlined, HomeOutlined, CalendarOutlined, FileTextOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { TextArea } = Input;

const RoomBookingForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();
    const [availableRooms, setAvailableRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);

    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(DOCTYPE_ROOM_BOOKING, id);

    // Fetch link options
    const { data: donors, loading: loadingDonors } = useFrappeGetDocList("Donor", {
        fields: ["name", "donor_name"],
        limit: 1000
    });
    const { data: temples, loading: loadingTemples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        limit: 1000
    });

    // Fallback: fetch all rooms for edit mode
    const { data: allRooms } = useFrappeGetDocList("Room", {
        fields: ["name", "room_number", "room_type", "capacity", "price_per_day", "status"],
        limit: 1000
    });

    useEffect(() => {
        if (isEdit && initialValues) {
            form.setFieldsValue({
                ...initialValues,
                check_in: initialValues.check_in ? dayjs(initialValues.check_in) : null,
                check_out: initialValues.check_out ? dayjs(initialValues.check_out) : null
            });
        } else {
            form.setFieldsValue({
                status: "Reserved",
                check_in: dayjs(),
                check_out: dayjs().add(1, 'day'),
                number_of_guests: 1
            });
            // Fetch available rooms for default dates
            fetchAvailableRooms(dayjs(), dayjs().add(1, 'day'));
        }
    }, [isEdit, initialValues, form]);

    const fetchAvailableRooms = (checkIn, checkOut, temple = null) => {
        if (!checkIn || !checkOut) return;
        setLoadingRooms(true);

        const args = {
            check_in: checkIn.format("YYYY-MM-DD HH:mm:ss"),
            check_out: checkOut.format("YYYY-MM-DD HH:mm:ss")
        };
        if (temple) args.temple = temple;

        frappe.call({
            method: "temple_donation.api.room_booking.get_available_rooms",
            args,
            callback: (r) => {
                setLoadingRooms(false);
                if (r.message) {
                    setAvailableRooms(r.message);
                }
            },
            error: () => {
                setLoadingRooms(false);
            }
        });
    };

    const handleDateChange = () => {
        const checkIn = form.getFieldValue("check_in");
        const checkOut = form.getFieldValue("check_out");
        const temple = form.getFieldValue("temple");
        if (checkIn && checkOut) {
            fetchAvailableRooms(checkIn, checkOut, temple);
        }
    };

    const handleTempleChange = (value) => {
        const checkIn = form.getFieldValue("check_in");
        const checkOut = form.getFieldValue("check_out");
        if (checkIn && checkOut) {
            fetchAvailableRooms(checkIn, checkOut, value);
        }
    };

    const handleSave = async (values) => {
        try {
            const payload = {
                ...values,
                check_in: values.check_in?.format("YYYY-MM-DD HH:mm:ss") || null,
                check_out: values.check_out?.format("YYYY-MM-DD HH:mm:ss") || null
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

    const formItemStyle = { marginBottom: '14px' };

    // Build room options with availability badges
    const roomOptions = (availableRooms.length > 0 ? availableRooms : (allRooms || [])).map(r => ({
        label: (
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>Room {r.room_number} — {r.room_type} ({r.capacity} pax)</span>
                {r.is_available === false ? (
                    <Tag color="red" style={{ marginLeft: 8, fontSize: '10px' }}>Occupied</Tag>
                ) : (
                    <Tag color="green" style={{ marginLeft: 8, fontSize: '10px' }}>Available</Tag>
                )}
            </span>
        ),
        value: r.name,
        disabled: r.is_available === false
    }));

    return (
        <ViewContainer className="donation-page">
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Update Booking" : "New Room Booking"}
                subtitle="Reservation Details"
                showBack={true}
            />

            <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false} size="middle">
                <Row gutter={[24, 16]}>
                    {/* LEFT COLUMN */}
                    <Col xs={24} lg={12}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Guest Information */}
                            <SectionCard title="Guest Information" icon={<UserOutlined style={{ color: '#18181b' }} />}>
                                <Row gutter={[16, 0]}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="guest_name" label="Guest Name" style={formItemStyle}
                                            rules={[{ required: true, message: "Guest name is required" }]}>
                                            <Input placeholder="Enter guest name" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="guest_id" label="Guest ID (Aadhaar/PAN)" style={formItemStyle}>
                                            <Input placeholder="Enter guest ID" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="donor" label="Donor" style={formItemStyle}>
                                            <Select
                                                showSearch
                                                placeholder="Select Donor (optional)"
                                                optionFilterProp="children"
                                                allowClear
                                                loading={loadingDonors}
                                                options={donors?.map(d => ({ label: d.donor_name, value: d.name })) || []}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="number_of_guests" label="Number of Guests" style={formItemStyle}>
                                            <InputNumber placeholder="1" min={1} className="w-full" style={{ height: '32px', display: 'flex', alignItems: 'center' }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </SectionCard>

                            {/* Remarks */}
                            <SectionCard title="Additional Notes" icon={<FileTextOutlined style={{ color: '#18181b' }} />}>
                                <Form.Item name="remarks" label="Remarks" style={formItemStyle}>
                                    <TextArea rows={3} placeholder="Any special notes or instructions" />
                                </Form.Item>
                            </SectionCard>
                        </div>
                    </Col>

                    {/* RIGHT COLUMN */}
                    <Col xs={24} lg={12}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Booking Details */}
                            <SectionCard title="Booking Details" icon={<CalendarOutlined style={{ color: '#18181b' }} />}>
                                <Row gutter={[16, 0]}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="temple" label="Temple" style={formItemStyle}
                                            rules={[{ required: true, message: "Temple is required" }]}>
                                            <Select
                                                showSearch
                                                placeholder="Select Temple"
                                                optionFilterProp="children"
                                                loading={loadingTemples}
                                                onChange={handleTempleChange}
                                                options={temples?.map(t => ({ label: t.temple_name, value: t.name })) || []}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="status" label="Status" style={formItemStyle}>
                                            <Select
                                                placeholder="Select Status"
                                                options={[
                                                    { label: "Reserved", value: "Reserved" },
                                                    { label: "Checked In", value: "Checked In" },
                                                    { label: "Checked Out", value: "Checked Out" },
                                                    { label: "Cancelled", value: "Cancelled" }
                                                ]}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="check_in" label="Check-in Date & Time" style={formItemStyle}
                                            rules={[{ required: true, message: "Check-in time is required" }]}>
                                            <DatePicker showTime format="DD-MM-YYYY HH:mm" className="w-full"
                                                onChange={handleDateChange} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="check_out" label="Check-out Date & Time" style={formItemStyle}
                                            rules={[{ required: true, message: "Check-out time is required" }]}>
                                            <DatePicker showTime format="DD-MM-YYYY HH:mm" className="w-full"
                                                onChange={handleDateChange} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </SectionCard>

                            {/* Room Selection */}
                            <SectionCard title="Room Selection" icon={<HomeOutlined style={{ color: '#18181b' }} />}>
                                <Row gutter={[16, 0]}>
                                    <Col xs={24}>
                                        <Form.Item name="room" label="Select Room" style={formItemStyle}
                                            rules={[{ required: true, message: "Room is required" }]}>
                                            <Select
                                                showSearch
                                                placeholder="Select an available room"
                                                optionFilterProp="children"
                                                loading={loadingRooms}
                                                options={roomOptions}
                                                optionLabelProp="label"
                                                filterOption={(input, option) => {
                                                    const room = (availableRooms.length > 0 ? availableRooms : (allRooms || [])).find(r => r.name === option.value);
                                                    if (!room) return false;
                                                    return `Room ${room.room_number}`.toLowerCase().includes(input.toLowerCase());
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="total_amount" label="Total Amount (₹)" style={formItemStyle}>
                                            <InputNumber placeholder="0.00" min={0} className="w-full" style={{ height: '32px', display: 'flex', alignItems: 'center' }} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </SectionCard>
                        </div>
                    </Col>
                </Row>

                <div style={{ marginTop: '24px' }}>
                    <FormFooter
                        onCancel={onBack}
                        loading={updating || creating}
                        isEdit={isEdit}
                        saveText={isEdit ? "Update Booking" : "Create Booking"}
                    />
                </div>
            </Form>
        </ViewContainer>
    );
};

export default RoomBookingForm;
