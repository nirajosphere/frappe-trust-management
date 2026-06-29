import React, { useState, useEffect } from "react";
import { Form, Select, Input, InputNumber, Button, Card, Typography, Row, Col, Alert, notification } from "antd";
import { useFrappeGetDocList } from "../../../hooks/useFrappe";

const { Title, Paragraph } = Typography;

const BulkRoomGenerator = ({ onComplete }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedTemple, setSelectedTemple] = useState(null);

    // Fetch Temples
    const { data: temples, loading: loadingTemples } = useFrappeGetDocList("Temple", {
        fields: ["name", "temple_name"],
        limit: 1000
    });

    // Fetch Buildings filtered by Temple
    const { data: buildings, mutate: refetchBuildings } = useFrappeGetDocList("Building", {
        fields: ["name", "building_name", "building_code", "temple"],
        filters: selectedTemple ? { temple: selectedTemple } : {},
        limit: 1000
    });

    // Fetch Room Types
    const { data: roomTypes, loading: loadingRoomTypes } = useFrappeGetDocList("Room Type", {
        fields: ["name", "room_type_name", "default_capacity", "default_price_per_day"],
        filters: { active: 1 },
        limit: 1000
    });

    useEffect(() => {
        if (selectedTemple) {
            refetchBuildings();
            form.setFieldsValue({ building: undefined });
        }
    }, [selectedTemple]);

    const handleRoomTypeChange = (val) => {
        const selectedType = roomTypes?.find(rt => rt.name === val);
        if (selectedType) {
            form.setFieldsValue({
                capacity: selectedType.default_capacity,
                price_per_day: selectedType.default_price_per_day
            });
        }
    };

    const handleGenerate = (values) => {
        if (typeof frappe === "undefined") {
            notification.error({ message: "Frappe environment not available" });
            return;
        }

        setLoading(true);
        frappe.call({
            method: "temple_donation.api.room_booking.bulk_generate_rooms",
            args: {
                temple: values.temple,
                building: values.building,
                floor: values.floor || 0,
                room_prefix: values.room_prefix || "",
                starting_number: values.starting_number,
                ending_number: values.ending_number,
                room_type: values.room_type,
                capacity: values.capacity || 2,
                price_per_day: values.price_per_day || 0
            },
            callback: (r) => {
                setLoading(false);
                if (r.message) {
                    notification.success({
                        message: "Rooms Generated",
                        description: r.message.message || `Successfully created ${r.message.created} rooms. ${r.message.exists} already existed.`,
                        duration: 6
                    });
                    form.resetFields();
                    if (onComplete) onComplete();
                }
            },
            error: (err) => {
                setLoading(false);
            }
        });
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px 0" }}>
            <Card 
                bordered={false} 
                style={{ 
                    borderRadius: "12px", 
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(10px)"
                }}
            >
                <div style={{ marginBottom: "24px" }}>
                    <Title level={3} style={{ margin: 0 }}>Bulk Room Generator</Title>
                    <Paragraph type="secondary">
                        Automatically create hundreds of rooms sequentially. If a room number already exists, the generator will skip it automatically.
                    </Paragraph>
                </div>

                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={handleGenerate}
                    initialValues={{ capacity: 2, price_per_day: 0, room_prefix: "", floor: 0 }}
                    requiredMark={false}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item 
                                name="temple" 
                                label="Temple / Trust" 
                                rules={[{ required: true, message: "Please select a Temple" }]}
                            >
                                <Select 
                                    showSearch 
                                    placeholder="Select Temple"
                                    optionFilterProp="children"
                                    loading={loadingTemples}
                                    onChange={(val) => setSelectedTemple(val)}
                                    options={temples?.map(t => ({ label: t.temple_name, value: t.name })) || []}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item 
                                name="building" 
                                label="Building" 
                                rules={[{ required: true, message: "Please select a Building" }]}
                            >
                                <Select 
                                    showSearch 
                                    placeholder={selectedTemple ? "Select Building" : "Select Temple first"}
                                    optionFilterProp="children"
                                    disabled={!selectedTemple}
                                    options={buildings?.map(b => ({ label: `${b.building_name} (${b.building_code})`, value: b.name })) || []}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="floor" label="Floor Number">
                                <InputNumber min={0} style={{ width: "100%" }} placeholder="e.g. 1" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item 
                                name="room_type" 
                                label="Room Category" 
                                rules={[{ required: true, message: "Please select Room Type" }]}
                            >
                                <Select 
                                    showSearch 
                                    placeholder="Select Room Category"
                                    optionFilterProp="children"
                                    loading={loadingRoomTypes}
                                    onChange={handleRoomTypeChange}
                                    options={roomTypes?.map(rt => ({ label: rt.room_type_name, value: rt.name })) || []}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="room_prefix" label="Room Prefix">
                                <Input placeholder="e.g. A-, B-, VIP-" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item 
                                name="starting_number" 
                                label="Start Number" 
                                rules={[{ required: true, message: "Required" }]}
                            >
                                <InputNumber min={1} style={{ width: "100%" }} placeholder="e.g. 101" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item 
                                name="ending_number" 
                                label="End Number" 
                                rules={[
                                    { required: true, message: "Required" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('starting_number') <= value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Must be >= Start Number'));
                                        },
                                    })
                                ]}
                            >
                                <InputNumber min={1} style={{ width: "100%" }} placeholder="e.g. 150" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="capacity" label="Capacity (Persons)">
                                <InputNumber min={1} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="price_per_day" label="Price Per Day (₹)">
                                <InputNumber min={0} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item style={{ marginTop: "24px", textAlign: "right" }}>
                        <Button type="primary" htmlType="submit" loading={loading} style={{ minWidth: "120px" }}>
                            Generate Rooms
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default BulkRoomGenerator;
