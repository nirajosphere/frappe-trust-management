import React, { useEffect } from "react";
import {
    Form, Input, Button, Alert, Upload, Select, Row, Col
} from "antd";
import {
    PictureOutlined, TagOutlined, DollarOutlined
} from "@ant-design/icons";
import {
    useFrappeCreateDoc,
    useFrappeUpdateDoc,
    useFrappeGetDoc,
    useFrappeFileUpload,
    useFrappeGetDocList
} from "../../hooks/useFrappe";
import { DOCTYPE_DONATION_TYPE, DOCTYPE_TEMPLE } from "../../config/constants";
import AddPageHeader from "../../components/common/AddPageHeader";
import ActivityLog from "../../components/common/ActivityLog";
import PageLoader from "../../components/common/PageLoader";
import FormFooter from "../../components/common/FormFooter";

// --- Clean & Minimalist Section Title with Tailwind ---
const SectionTitle = ({ icon, children }) => (
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-200 pb-2.5 mb-5 mt-1">
        {icon} {children}
    </div>
);

const DonationTypeForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    // --- Frappe API Hooks ---
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { upload, loading: uploading } = useFrappeFileUpload();
    const { data, loading, error } = useFrappeGetDoc(DOCTYPE_DONATION_TYPE, id);
    const { data: temples } = useFrappeGetDocList(DOCTYPE_TEMPLE, { fields: ["name", "temple_name"] });

    // --- Form Watchers for Live Preview Panel ---
    const donationTypeName = Form.useWatch("donation_type", form) || "";
    const defaultAmount    = Form.useWatch("default_amount", form) || "";
    const fileList         = Form.useWatch("donation_image", form) || [];
    const previewUrl       = fileList?.[0]?.url || fileList?.[0]?.thumbUrl || "";

    // --- Effect for Form Binding in Edit Mode ---
    useEffect(() => {
        if (isEdit && data) {
            let initialFileList = [];
            if (data.donation_image) {
                const url = data.donation_image.startsWith("http")
                    ? data.donation_image
                    : `${window.location.origin}${data.donation_image.startsWith("/") ? "" : "/"}${data.donation_image}`;
                initialFileList = [{ uid: "-1", name: "image", status: "done", url, thumbUrl: url }];
            }
            form.setFieldsValue({ ...data, donation_image: initialFileList });
        }
    }, [isEdit, data, form]);

    // --- Form Submission Logic ---
    const handleSave = async (values) => {
        try {
            const { donation_image, ...rest } = values;
            let doc;
            
            if (isEdit) {
                doc = await updateDoc(DOCTYPE_DONATION_TYPE, id, rest);
            } else {
                doc = await createDoc(DOCTYPE_DONATION_TYPE, rest);
            }

            const docName = isEdit ? id : (doc?.name || doc);
            if (!docName) throw new Error("Could not determine document name.");

            // Handle Image Upload / Clean ups
            if (donation_image && donation_image.length > 0) {
                const file = donation_image[0].originFileObj;
                if (file) {
                    const uploaded = await upload(file, { 
                        doctype: DOCTYPE_DONATION_TYPE, 
                        docname: docName, 
                        fieldname: "donation_image", 
                        is_private: 0 
                    });
                    if (uploaded?.file_url) {
                        await updateDoc(DOCTYPE_DONATION_TYPE, docName, { donation_image: uploaded.file_url });
                    }
                }
            } else if (isEdit && (!donation_image || donation_image.length === 0)) {
                await updateDoc(DOCTYPE_DONATION_TYPE, id, { donation_image: "" });
            }

            if (onBack) onBack();
        } catch (err) { 
            console.error("Save Error:", err); 
        }
    };

    if (loading) return <PageLoader />;
    if (error) return <Alert message="Error loading data" type="error" action={<Button onClick={onBack}>Back</Button>} />;

    return (
        <div className="max-w-6xl mx-auto p-4 pb-28 form-fade-in">
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Edit Donation Type" : "Add Donation Type"}
                subtitle="Donation Setup"
            />

            <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false}>
                <div className="flex flex-col md:flex-row items-start gap-6">

                    {/* ─── LEFT: Image Preview Panel ─── */}
                    <div className="w-full md:w-[230px] shrink-0 bg-white border border-zinc-200 rounded-xl p-6 flex flex-col items-center gap-4 shadow-sm">
                        <Form.Item
                            name="donation_image"
                            valuePropName="fileList"
                            getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
                            className="m-0 w-full"
                        >
                            <Upload maxCount={1} beforeUpload={() => false} listType="picture" showUploadList={false}>
                                <div className="cursor-pointer flex flex-col items-center">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl} 
                                            alt="preview"
                                            className="w-28 height-28 rounded-lg object-cover border border-zinc-900"
                                        />
                                    ) : (
                                        <div className="w-28 h-28 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 flex flex-col items-center justify-center gap-2 transition-colors hover:border-zinc-400">
                                            <PictureOutlined className="text-xl text-zinc-400" />
                                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Upload</span>
                                        </div>
                                    )}
                                </div>
                            </Upload>
                        </Form.Item>

                        <div className="text-center w-full">
                            <div className="text-sm font-bold text-zinc-900 leading-snug break-words">
                                {donationTypeName || "Donation Type"}
                            </div>
                            
                            {defaultAmount && (
                                <div className="mt-2">
                                    <span className="inline-block bg-zinc-900 text-white rounded px-3 py-1 text-xs font-semibold">
                                        ₹ {defaultAmount}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="w-full border-t border-zinc-100 pt-3 mt-1">
                            <div className="text-[10px] text-zinc-400 text-center font-bold uppercase tracking-wide">
                                {isEdit ? "Editing Category" : "New Category"}
                            </div>
                        </div>
                    </div>

                    {/* ─── RIGHT: Form Inputs ─── */}
                    <div className="flex-1 w-full">
                        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                            <SectionTitle icon={<TagOutlined />}>Category Details</SectionTitle>
                            
                            <Row gutter={[24, 16]}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="donation_type" label="Donation Type" rules={[{ required: true, message: "Required" }]}>
                                        <Input prefix={<TagOutlined className="text-zinc-400" />} placeholder="e.g. Anndan, Vastra Daan" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="default_amount" label="Default Amount">
                                        <Input prefix={<DollarOutlined className="text-zinc-400" />} placeholder="0.00" type="number" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24}>
                                    <Form.Item name="temple" label="Associated Temple">
                                        <Select
                                            placeholder="Select Temple"
                                            allowClear
                                            options={temples?.map(t => ({ value: t.name, label: t.temple_name || t.name }))}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>

                <FormFooter
                    onCancel={onBack}
                    loading={creating || updating || uploading}
                    isEdit={isEdit}
                    saveText={isEdit ? "Update Type" : "Create Type"}
                />
            </Form>

            {isEdit && <ActivityLog doctype={DOCTYPE_DONATION_TYPE} docname={id} />}
        </div>
    );
};

export default DonationTypeForm;