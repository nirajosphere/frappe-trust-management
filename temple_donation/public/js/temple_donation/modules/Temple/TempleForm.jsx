import React, { useEffect, useState } from "react";
import {
    Form, Input, Button, Alert, Switch, List, Avatar, Row, Col, Typography
} from "antd";
import {
    HomeOutlined, EnvironmentOutlined, GlobalOutlined, PushpinOutlined,
    InfoCircleOutlined, FileTextOutlined, BankOutlined, AppstoreOutlined
} from "@ant-design/icons";
import {
    useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDoc, useFrappeGetDocList
} from "../../hooks/useFrappe";
import { DOCTYPE_TEMPLE, DOCTYPE_DONATION_TYPE } from "../../config/constants";
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

const TempleForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();
    const [selectedDonationTypes, setSelectedDonationTypes] = useState([]);

    // --- Frappe API Hooks ---
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data, loading, error } = useFrappeGetDoc(DOCTYPE_TEMPLE, id);
    const { data: donationTypes } = useFrappeGetDocList(DOCTYPE_DONATION_TYPE, {
        fields: ["name", "donation_type", "donation_image"]
    });

    // --- Form Watchers for Live Preview Panel ---
    const templeName = Form.useWatch("temple_name", form) || "";
    const templeId   = Form.useWatch("temple_id",   form) || "";
    const initials   = templeName
        ? templeName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
        : "T";

    // --- Effect for Form Setup and Binding ---
    useEffect(() => {
        if (isEdit && data) {
            form.setFieldsValue(data);
            if (data.donation_types && Array.isArray(data.donation_types) && data.donation_types.length > 0) {
                setSelectedDonationTypes(data.donation_types.map(d => d.donation_type));
            } else if (data.dontatio_type) {
                setSelectedDonationTypes([data.dontatio_type]);
            }
        } else {
            form.setFieldsValue({ country: "India", state: "Gujarat" });
        }
    }, [isEdit, data, form]);

    // --- Form Submission Logic ---
    const handleSave = async (values) => {
        try {
            const payload = {
                ...values,
                donation_types: selectedDonationTypes.map(name => ({
                    doctype: "Temple Donation Type",
                    donation_type: name
                }))
            };
            if (isEdit) await updateDoc(DOCTYPE_TEMPLE, id, payload);
            else        await createDoc(DOCTYPE_TEMPLE, payload);
            if (onBack) onBack();
        } catch (err) {
            console.error("Save Error:", err);
        }
    };

    const toggleDonationType = (name) => {
        setSelectedDonationTypes(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    };

    const allSelected = donationTypes && donationTypes.length > 0 && selectedDonationTypes.length === donationTypes.length;

    const handleSelectAllChange = (checked) => {
        setSelectedDonationTypes(checked ? donationTypes.map(d => d.name) : []);
    };

    if (isEdit && loading) return <PageLoader />;
    if (isEdit && error)   return <Alert message="Error loading data" type="error" />;

    return (
        <div className="max-w-6xl mx-auto p-4 pb-28 form-fade-in">
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Edit Temple" : "Add Temple"}
                subtitle="Temple Management"
            />

            <Form layout="vertical" form={form} onFinish={handleSave} requiredMark={false}>
                <div className="flex flex-col md:flex-row items-start gap-6">

                    {/* ─── LEFT: Temple Info Panel ─── */}
                    <div className="w-full md:w-[230px] shrink-0 bg-white border border-zinc-200 rounded-xl p-6 flex flex-col items-center gap-4 shadow-sm">
                        <Avatar
                            size={88}
                            className="text-2xl font-black border-2 border-zinc-100 shadow-sm bg-zinc-900 text-white"
                        >
                            {initials}
                        </Avatar>

                        <div className="text-center w-full">
                            <div className="text-sm font-bold text-zinc-900 leading-snug break-words">
                                {templeName || "Temple Name"}
                            </div>
                            {templeId && (
                                <div className="mt-2">
                                    <span className="inline-block bg-zinc-100 border border-zinc-200 text-zinc-800 rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                        ID: {templeId}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="w-full border-t border-zinc-100 pt-3 mt-1">
                            <div className="text-[10px] text-zinc-400 text-center font-bold uppercase tracking-wide">
                                {selectedDonationTypes.length > 0
                                    ? `${selectedDonationTypes.length} Active Type${selectedDonationTypes.length > 1 ? "s" : ""}`
                                    : "No Active Types"}
                            </div>
                        </div>
                    </div>

                    {/* ─── RIGHT: Form Inputs ─── */}
                    <div className="flex-1 w-full flex flex-col gap-6">

                        {/* Temple Details */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                            <SectionTitle icon={<BankOutlined className="text-zinc-400" />}>Temple Details</SectionTitle>
                            
                            <Row gutter={[24, 16]}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="temple_name" label="Temple Name" rules={[{ required: true, message: "Required" }]}>
                                        <Input prefix={<BankOutlined className="text-zinc-400" />} placeholder="Full Temple Name" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="temple_id" label="Temple ID" rules={[{ required: true, message: "Required" }]}>
                                        <Input prefix={<InfoCircleOutlined className="text-zinc-400" />} placeholder="Unique Temple ID" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="trust_registration_no" label="Trust Registration No." rules={[{ required: true, message: "Required" }]}>
                                        <Input prefix={<FileTextOutlined className="text-zinc-400" />} placeholder="Trust Reg. Number" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="note" label="Note">
                                        <Input prefix={<FileTextOutlined className="text-zinc-400" />} placeholder="Optional note" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* Address */}
                        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                            <SectionTitle icon={<EnvironmentOutlined className="text-zinc-400" />}>Address</SectionTitle>
                            
                            <Row gutter={[24, 16]}>
                                <Col xs={24}>
                                    <Form.Item name="temple_address" label="Temple Address" rules={[{ required: true, message: "Required" }]}>
                                        <Input prefix={<HomeOutlined className="text-zinc-400" />} placeholder="Full Street Address" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Form.Item name="country" label="Country" rules={[{ required: true }]}>
                                        <Input prefix={<GlobalOutlined className="text-zinc-400" />} placeholder="India" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Form.Item name="state" label="State" rules={[{ required: true }]}>
                                        <Input prefix={<EnvironmentOutlined className="text-zinc-400" />} placeholder="State" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Form.Item name="city" label="City" rules={[{ required: true }]}>
                                        <Input prefix={<EnvironmentOutlined className="text-zinc-400" />} placeholder="City" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="pincode" label="Pincode" rules={[{ required: true }]}>
                                        <Input prefix={<PushpinOutlined className="text-zinc-400" />} placeholder="Postal Code" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>

                        {/* Donation Types */}
                        <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black">
                                    <AppstoreOutlined className="text-zinc-400" /> Donation Types
                                </div>
                                {donationTypes && donationTypes.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Select All</span>
                                        <Switch
                                            checked={allSelected}
                                            onChange={handleSelectAllChange}
                                            className={allSelected ? "bg-zinc-800" : "bg-zinc-200"}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                                <List
                                    dataSource={donationTypes}
                                    className="donation-type-list"
                                    renderItem={item => {
                                        const active = selectedDonationTypes.includes(item.name);
                                        return (
                                            <List.Item
                                                className="px-6 py-3 hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0 flex items-center justify-between"
                                                actions={[
                                                    <Switch
                                                        checked={active}
                                                        onChange={() => toggleDonationType(item.name)}
                                                        className={active ? "bg-zinc-800" : "bg-zinc-200"}
                                                    />
                                                ]}
                                            >
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar
                                                            src={item.donation_image}
                                                            shape="square"
                                                            size="large"
                                                            className="bg-zinc-100 rounded-lg border border-zinc-200 text-zinc-950 font-black"
                                                        >
                                                            {item.donation_type?.charAt(0)}
                                                        </Avatar>
                                                    }
                                                    title={<Text strong className="text-zinc-700">{item.donation_type}</Text>}
                                                />
                                            </List.Item>
                                        );
                                    }}
                                />
                            </div>
                        </div>

                    </div>
                </div>

                <FormFooter
                    onCancel={onBack}
                    loading={creating || updating}
                    isEdit={isEdit}
                    saveText={isEdit ? "Update Temple" : "Add Temple"}
                />
            </Form>

            {isEdit && <ActivityLog doctype={DOCTYPE_TEMPLE} docname={id} />}
        </div>
    );
};

export default TempleForm;