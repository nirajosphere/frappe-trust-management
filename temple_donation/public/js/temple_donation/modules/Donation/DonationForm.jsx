import React, { useEffect } from "react";
import {
    Form, Input, Button, Card, Typography, Row, Col, Alert, DatePicker, Select, Space
} from "antd";
import dayjs from "dayjs";
import {
    SaveOutlined, UserOutlined, EnvironmentOutlined, HeartOutlined,
    GiftOutlined, DollarOutlined
} from "@ant-design/icons";
import {
    useFrappeGetDoc, useFrappeUpdateDoc, useFrappeGetDocList
} from "../../hooks/useFrappe";
import { DOCTYPE_DONATION } from "../../config/constants";
import AddPageHeader from "../../components/common/AddPageHeader";
import ActivityLog from "../../components/common/ActivityLog";
import PageLoader from "../../components/common/PageLoader";
import FormFooter from "../../components/common/FormFooter";

const { Text } = Typography;

const DonationForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(DOCTYPE_DONATION, id);
    const { data: donationTypesList } = useFrappeGetDocList("Donation Type", { fields: ["name", "donation_type"], limit: 500 });

    useEffect(() => {
        if (isEdit && initialValues) {
            const vals = { ...initialValues };
            if (vals.dob) vals.dob = dayjs(vals.dob);
            if (vals.date_of_anniversary) vals.date_of_anniversary = dayjs(vals.date_of_anniversary);
            form.setFieldsValue(vals);
        }
    }, [isEdit, initialValues, form]);

    const handleSave = async (values) => {
        try {
            const formattedValues = { ...values };
            if (values.dob && values.dob.format) formattedValues.dob = values.dob.format('YYYY-MM-DD');
            if (values.date_of_anniversary && values.date_of_anniversary.format) formattedValues.date_of_anniversary = values.date_of_anniversary.format('YYYY-MM-DD');
            
            // Format amounts in donation_items to float/number
            if (formattedValues.donation_items && Array.isArray(formattedValues.donation_items)) {
                formattedValues.donation_items = formattedValues.donation_items.map(item => ({
                    ...item,
                    amount: parseFloat(item.amount) || 0
                }));
            }
            
            await updateDoc(DOCTYPE_DONATION, id, formattedValues);
            if (onBack) onBack();
        } catch (err) {
            console.error(err);
        }
    };

    if (fetching) return <PageLoader />;
    if (fetchError) return <Alert message="Error" description={fetchError.message} type="error" />;


    return (
    <div className="donation-page py-6">

        <AddPageHeader
            onBack={onBack}
            title="Edit Donation"
            subtitle="Donation Entry"
            showBack={true}
        />

        <Form form={form} layout="vertical" onFinish={handleSave}>
            <div className="space-y-6">

                {/* Card 1: Donor Information */}
                <Card size="small" title={<Space><UserOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Donor Information</span></Space>}>
                    <Form.Item name="name" hidden><Input /></Form.Item>
                    <Row gutter={[16, 12]}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="name_on_receipt" label="Name on Receipt">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="donor_name" label="Donor Name">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="cashier" label="Donation Receiver Name">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="email" label="Email">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="contact_number" label="Contact Number">
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* Card 2: Address */}
                <Card size="small" title={<Space><EnvironmentOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Address</span></Space>}>
                    <Row gutter={[16, 12]}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="address_line_1" label="Address Line 1">
                                <Input placeholder="Enter Address Line 1" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="address_line_2" label="Address Line 2">
                                <Input placeholder="Enter Address Line 2" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="country" label="Country">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="state" label="State">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Form.Item name="city" label="City">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="pincode" label="Pincode">
                                <Input placeholder="Enter pincode" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="native_place" label="Native Place">
                                <Input placeholder="Enter Native Place" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* Card 3: Personal Details */}
                <Card size="small" title={<Space><HeartOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Personal Details</span></Space>}>
                    <Row gutter={[16, 12]}>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="dob" label="Date of Birth">
                                <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" placeholder="DD-MM-YYYY" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="marital_status" label="Marital Status">
                                <Select style={{ width: '100%' }} placeholder="Unmarried">
                                    <Select.Option value="Unmarried">Unmarried</Select.Option>
                                    <Select.Option value="Married">Married</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item name="date_of_anniversary" label="Date of Anniversary">
                                <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" placeholder="DD-MM-YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* Card 4: Donation Items */}
                <Card size="small" title={<Space><GiftOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Donation Items</span></Space>}>
                    <Row gutter={[16, 12]}>
                        <Form.List name="donation_items">
                            {(fields) => (
                                <>
                                    {fields.map(({ key, name: fieldName, ...restField }) => {
                                        const itemVal = form.getFieldValue(["donation_items", fieldName]);
                                        const dTypeRecord = donationTypesList?.find(t => t.name === itemVal?.donation_type);
                                        const label = dTypeRecord ? dTypeRecord.donation_type : (itemVal?.donation_type || "Donation Item");
                                        return (
                                            <Col xs={24} sm={12} key={key}>
                                                <Form.Item {...restField} name={[fieldName, 'amount']} label={label}>
                                                    <Input type="number" />
                                                </Form.Item>
                                                <Form.Item name={[fieldName, 'name']} hidden><Input /></Form.Item>
                                                <Form.Item name={[fieldName, 'donation_type']} hidden><Input /></Form.Item>
                                            </Col>
                                        );
                                    })}
                                </>
                            )}
                        </Form.List>
                    </Row>
                </Card>

                {/* Card 5: Donation Payments */}
                <Card size="small" title={<Space><DollarOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Donation Payments</span></Space>}>
                    <Row gutter={[16, 12]}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="payment_mode" label="Donation Payment Type">
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="total_amount" label="Donation Total Amount">
                                <Input type="number" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

            </div>

            <FormFooter
                onCancel={onBack}
                loading={updating}
                cancelText="Back"
                saveText="Update Donation"
            />
        </Form>

        {isEdit && <ActivityLog doctype={DOCTYPE_DONATION} docname={id} />}
    </div>
);
};

export default DonationForm;
