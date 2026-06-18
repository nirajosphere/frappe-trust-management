import React, { useEffect } from "react";
import {
    Form, Input, Button, Alert, Select, DatePicker, Avatar, Row, Col, Typography
} from "antd";
import {
    UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined,
    HomeOutlined, GlobalOutlined, PushpinOutlined, IdcardOutlined, HeartOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
    useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDoc
} from "../../hooks/useFrappe";
import { DOCTYPE_DONOR } from "../../config/constants";
import AddPageHeader from "../../components/common/AddPageHeader";
import ActivityLog from "../../components/common/ActivityLog";
import PageLoader from "../../components/common/PageLoader";
import FormFooter from "../../components/common/FormFooter";

const { Text } = Typography;

// --- Clean & Minimalist Section Title with Tailwind ---
const SectionTitle = ({ icon, children }) => (
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-200 pb-2.5 mb-5 mt-1">
        {icon} {children}
    </div>
);

const DonorForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    // --- Frappe API Hooks ---
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data, loading, error } = useFrappeGetDoc(DOCTYPE_DONOR, id);

    // --- Form Watchers for Live Preview Panel ---
    const donorName = Form.useWatch("donor_name", form) || "";
    const initials = donorName
        ? donorName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
        : "D";

    // --- Effect for Form Setup and Binding ---
    useEffect(() => {
        if (isEdit && data) {
            form.setFieldsValue({
                ...data,
                date_of_birth: data.date_of_birth ? dayjs(data.date_of_birth) : null,
                anniversary_date: data.anniversary_date ? dayjs(data.anniversary_date) : null
            });
        } else {
            form.setFieldsValue({
                country: "India",
                state: "Gujarat",
                marital_status: "Unmarried"
            });
        }
    }, [isEdit, data, form]);

    // --- Form Submission Logic ---
    const handleSave = async (values) => {
        try {
            const payload = {
                ...values,
                date_of_birth: values.date_of_birth?.format("YYYY-MM-DD") || null,
                anniversary_date: values.anniversary_date?.format("YYYY-MM-DD") || null
            };

            if (isEdit) {
                await updateDoc(DOCTYPE_DONOR, id, payload);
            } else {
                await createDoc(DOCTYPE_DONOR, payload);
            }

            if (onBack) onBack();
        } catch (err) {
            console.error("Save Error:", err);
        }
    };

    if (loading) return <PageLoader />;
    if (error) return <Alert message="Error loading donor" type="error" action={<Button onClick={onBack}>Back</Button>} />;

    return (
        <div className="max-w-6xl mx-auto p-4 pb-28 form-fade-in">
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Edit Donor" : "Add Donor"}
                subtitle="Donor Management"
            />

            <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false}>
                <div className="flex flex-col md:flex-row items-start gap-6">

                    {/* ─── LEFT: Donor Info Panel ─── */}
                    <div className="w-full md:w-[230px] shrink-0 bg-white border border-zinc-200 rounded-xl p-6 flex flex-col items-center gap-4 shadow-sm">
                        <Avatar
                            size={88}
                            className="text-2xl font-black border-2 border-zinc-100 shadow-sm bg-zinc-900 text-white"
                        >
                            {initials}
                        </Avatar>

                        <div className="text-center w-full">
                            <div className="text-sm font-bold text-zinc-900 leading-snug break-words">
                                {donorName || "Donor Name"}
                            </div>
                            <div className="mt-1">
                                <span className="inline-block bg-zinc-100 border border-zinc-200 text-zinc-800 rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                    {isEdit ? "Registered" : "New Donor"}
                                </span>
                            </div>
                        </div>

                        <div className="w-full border-t border-zinc-100 pt-3 mt-1">
                            <div className="text-[10px] text-zinc-400 text-center font-bold uppercase tracking-wide">
                                Donor Record
                            </div>
                        </div>
                    </div>

                    {/* ─── RIGHT: Form Inputs ─── */}
                    <div className="flex-1 w-full flex flex-col gap-6">

                        {/* Card 1: Profile Information */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                            <SectionTitle icon={<UserOutlined className="text-zinc-400" />}>Profile Information</SectionTitle>
                            
                            <Row gutter={[24, 16]}>
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item
                                        name="donor_name"
                                        label="Full Name"
                                        rules={[{ required: true, message: "Required" }]}
                                    >
                                        <Input prefix={<UserOutlined className="text-zinc-400" />} placeholder="Donor Full Name" className="h-10" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item
                                        name="mobile_number"
                                        label="Contact No"
                                        rules={[
                                            { required: true, message: "Required" },
                                            { pattern: /^\d{10}$/, message: "Invalid number" }
                                        ]}
                                    >
                                        <Input maxLength={10} prefix={<PhoneOutlined className="text-zinc-400" />} placeholder="Mobile Number" className="h-10" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item name="email" label="Email">
                                        <Input prefix={<MailOutlined className="text-zinc-400" />} placeholder="email@example.com" className="h-10" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item
                                        name="pan_card"
                                        label="PAN Card"
                                        rules={[
                                            { pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: "Invalid PAN" }
                                        ]}
                                    >
                                        <Input prefix={<IdcardOutlined className="text-zinc-400" />} placeholder="ABCDE1234F" className="h-10" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* Card 2: Personal Details */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                            <SectionTitle icon={<HeartOutlined className="text-zinc-400" />}>Personal Details</SectionTitle>
                            
                            <Row gutter={[24, 16]}>
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item name="date_of_birth" label="Date of Birth">
                                        <DatePicker className="w-full h-10" format="DD-MM-YYYY" placeholder="DD-MM-YYYY" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item name="marital_status" label="Marital Status">
                                        <Select
                                            className="h-10 w-full"
                                            options={[
                                                { label: "Unmarried", value: "Unmarried" },
                                                { label: "Married", value: "Married" }
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item name="anniversary_date" label="Anniversary Date">
                                        <DatePicker className="w-full h-10" format="DD-MM-YYYY" placeholder="DD-MM-YYYY" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* Card 3: Address & Native Origin */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                            <SectionTitle icon={<EnvironmentOutlined className="text-zinc-400" />}>Address & Native Origin</SectionTitle>
                            
                            <Row gutter={[24, 16]}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="address" label="Address Line 1">
                                        <Input prefix={<HomeOutlined className="text-zinc-400" />} placeholder="Flat / House No, Building" className="h-10" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="address_line_2" label="Address Line 2">
                                        <Input prefix={<EnvironmentOutlined className="text-zinc-400" />} placeholder="Street, Locality" className="h-10" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Form.Item name="country" label="Country">
                                        <Input prefix={<GlobalOutlined className="text-zinc-400" />} placeholder="Country" className="h-10" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Form.Item name="state" label="State" rules={[{ required: true, message: "Required" }]}>
                                        <Input prefix={<EnvironmentOutlined className="text-zinc-400" />} placeholder="State" className="h-10" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Form.Item name="city" label="City" rules={[{ required: true, message: "Required" }]}>
                                        <Input prefix={<EnvironmentOutlined className="text-zinc-400" />} placeholder="City" className="h-10" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="pincode" label="Pincode">
                                        <Input prefix={<PushpinOutlined className="text-zinc-400" />} placeholder="Postal Code" className="h-10" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="native_place" label="Native Place">
                                        <Input prefix={<EnvironmentOutlined className="text-zinc-400" />} placeholder="Native Place / Town" className="h-10" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                    </div>
                </div>

                <FormFooter
                    onCancel={onBack}
                    loading={creating || updating}
                    isEdit={isEdit}
                />
            </Form>

            {isEdit && <ActivityLog doctype={DOCTYPE_DONOR} docname={id} />}
        </div>
    );
};

export default DonorForm;