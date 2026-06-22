import React, { useEffect } from "react";
import {
    Form, Input, Button, Alert, Select, DatePicker, Row, Col, Typography, InputNumber
} from "antd";
import dayjs from "dayjs";
import {
    useFrappeGetDoc, useFrappeUpdateDoc, useFrappeCreateDoc, useFrappeGetDocList
} from "../../hooks/useFrappe";
import { DOCTYPE_ROOM_BOOKING } from "../../config/constants";
import { roomBookingFormFields } from "../../formfield/roomBookingFormFields";
import AddPageHeader from "../../components/common/AddPageHeader";
import PageLoader from "../../components/common/PageLoader";
import FormFooter from "../../components/common/FormFooter";
import ViewContainer from "../../components/common/ViewContainer";
import SectionCard from "../../components/common/SectionCard";

const { Text } = Typography;

const RoomBookingForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

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
    const { data: rooms, loading: loadingRooms } = useFrappeGetDocList("Room", {
        fields: ["name", "room_number"],
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
                status: "Booked",
                check_in: dayjs(),
                check_out: dayjs().add(1, 'day')
            });
        }
    }, [isEdit, initialValues, form]);

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

    return (
        <ViewContainer className="donation-page">
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Update Booking" : "New Room Booking"}
                subtitle="Reservation Details"
                showBack={true}
            />

            <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false} size="middle">
                <SectionCard title="Booking Details">
                    <Row gutter={[24, 0]}>
                        {roomBookingFormFields.fields.map((field) => (
                            <Col xs={24} md={12} key={field.name}>
                                <Form.Item
                                    name={field.name}
                                    label={field.label}
                                    style={formItemStyle}
                                    rules={field.required ? [{ required: true, message: field.message || "Required" }] : []}
                                >
                                    {field.type === "select" ? (
                                        <Select placeholder={field.placeholder} options={field.options} />
                                    ) : field.type === "link" ? (
                                        <Select
                                            showSearch
                                            placeholder={field.placeholder}
                                            optionFilterProp="children"
                                            loading={
                                                field.doctype === "Donor" ? loadingDonors :
                                                field.doctype === "Temple" ? loadingTemples :
                                                field.doctype === "Room" ? loadingRooms : false
                                            }
                                            options={
                                                field.doctype === "Donor" ? donors?.map(d => ({ label: d.donor_name, value: d.name })) :
                                                field.doctype === "Temple" ? temples?.map(t => ({ label: t.temple_name, value: t.name })) :
                                                field.doctype === "Room" ? rooms?.map(r => ({ label: `Room ${r.room_number}`, value: r.name })) : []
                                            }
                                        />
                                    ) : field.type === "datetime" ? (
                                        <DatePicker showTime format="DD-MM-YYYY HH:mm:ss" className="w-full" />
                                    ) : field.type === "number" ? (
                                        <InputNumber placeholder={field.placeholder} className="w-full" style={{ height: '32px', display: 'flex', alignItems: 'center' }} />
                                    ) : (
                                        <Input placeholder={field.placeholder} />
                                    )}
                                </Form.Item>
                            </Col>
                        ))}
                    </Row>
                </SectionCard>
                <div style={{ marginTop: '24px' }}>
                    <FormFooter
                        onCancel={onBack}
                        loading={updating || creating}
                        isEdit={isEdit}
                    />
                </div>
            </Form>
        </ViewContainer>
    );
};

export default RoomBookingForm;
