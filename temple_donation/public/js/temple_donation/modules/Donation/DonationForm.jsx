import React, { useEffect } from "react";
import {
    Form, Input, Button, Card, Typography, Row, Col, Spin, Alert, DatePicker, Select
} from "antd";
import dayjs from "dayjs";
import { SaveOutlined } from "@ant-design/icons";
import {
    useFrappeGetDoc, useFrappeUpdateDoc
} from "../../hooks/useFrappe";
import { DOCTYPE_DONATION } from "../../config/constants";
import AddPageHeader from "../../components/common/AddPageHeader";
import ChangeHistory from "../../components/common/ChangeHistory";

const { Text } = Typography;

const DonationForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(DOCTYPE_DONATION, id);

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
            
            await updateDoc(DOCTYPE_DONATION, id, formattedValues);
            if (onBack) onBack();
        } catch (err) {
            console.error(err);
        }
    };

    if (fetching) return <div className="p-20 text-center"><Spin /></div>;
    if (fetchError) return <Alert message="Error" description={fetchError.message} type="error" />;


    return (
    <div className="px-3 sm:px-4 py-4">

        <AddPageHeader
            onBack={onBack}
            title="Edit Donation"
            subtitle="Donation Entry"
        />

        <Card className="border border-zinc-200">
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
            >
                <Row gutter={[24, 16]}>

                    <Form.Item name="name" hidden><Input /></Form.Item>

                    {/* Row 1 */}
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item name="name_on_receipt" label="Name on Receipt">
                            <Input className="h-10" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item name="donor_name" label="Donor Name">
                            <Input className="h-10" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item name="cashier" label="Donation Receiver Name">
                            <Input className="h-10" />
                        </Form.Item>
                    </Col>

                    {/* Row 2 */}
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item name="email" label="Email">
                            <Input className="h-10" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item name="address_line_1" label="Address Line 1">
                            <Input className="h-10" placeholder="Enter Address Line 1" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item name="address_line_2" label="Address Line 2">
                            <Input className="h-10" placeholder="Enter Address Line 2" />
                        </Form.Item>
                    </Col>

                    {/* Row 3 */}
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item name="country" label="Country">
                            <Input className="h-10" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item name="state" label="State">
                            <Input className="h-10" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item name="city" label="City">
                            <Input className="h-10" />
                        </Form.Item>
                    </Col>

                    {/* Row 4 */}
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item name="pincode" label="Pincode">
                            <Input className="h-10" placeholder="Enter pincode" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item name="contact_number" label="Contact Number">
                            <Input className="h-10" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item name="native_place" label="Native Place">
                            <Input className="h-10" placeholder="Enter Native Place" />
                        </Form.Item>
                    </Col>

                    {/* Row 5 */}
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item name="dob" label="Date of Birth">
                            <DatePicker className="h-10 w-full" format="DD-MM-YYYY" placeholder="DD-MM-YYYY" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item name="marital_status" label="Marital Status">
                            <Select className="h-10 w-full" placeholder="Unmarried">
                                <Select.Option value="Unmarried">Unmarried</Select.Option>
                                <Select.Option value="Married">Married</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item name="date_of_anniversary" label="Date of Anniversary">
                            <DatePicker className="h-10 w-full" format="DD-MM-YYYY" placeholder="DD-MM-YYYY" />
                        </Form.Item>
                    </Col>

                    {/* Donation Items */}
                    <Col xs={24}>
                        <Typography.Title level={5} className="text-[#a84422] mt-4 mb-2">Donation Items</Typography.Title>
                    </Col>
                    
                    <Col xs={24} sm={12}>
                        <Form.Item name="thakorji_thal" label="Thakorji Thal">
                            <Input type="number" className="h-10" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item name="lease_land_receipt" label="Lease Land receipt">
                            <Input type="number" className="h-10" />
                        </Form.Item>
                    </Col>

                    {/* Donation Payments */}
                    <Col xs={24}>
                        <Typography.Title level={5} className="text-[#a84422] mt-4 mb-2">Donation Payments</Typography.Title>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Form.Item name="payment_mode" label="Donation Payment Type">
                            <Input className="h-10 bg-zinc-50" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item name="total_amount" label="Donation Total Amount">
                            <Input type="number"  className="h-10 bg-zinc-50 text-zinc-500 font-medium" />
                        </Form.Item>
                    </Col>

                </Row>

                {/* ACTIONS */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-10 pt-6 border-t border-zinc-100">
                    <Button onClick={onBack} className="h-10 px-8 text-[#a84422] border-[#a84422] hover:bg-[#a84422] hover:text-white transition-colors">
                        Back
                    </Button>

                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={updating}
                        className="h-10 px-8 bg-[#9c3e1e] hover:bg-[#853418] border-none font-medium text-white shadow-md"
                    >
                        Update Donation
                    </Button>
                </div>

            </Form>
        </Card>

        {isEdit && <ChangeHistory doctype={DOCTYPE_DONATION} docname={id} />}
    </div>
);
};

export default DonationForm;
