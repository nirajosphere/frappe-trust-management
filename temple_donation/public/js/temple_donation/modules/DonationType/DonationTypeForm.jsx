// import React, { useEffect } from "react";
// import {
//     Form, Input, Button, Alert, Upload, Select, Row, Col, Card, Space
// } from "antd";
// import {
//     PictureOutlined, TagOutlined, DollarOutlined
// } from "@ant-design/icons";
// import {
//     useFrappeCreateDoc,
//     useFrappeUpdateDoc,
//     useFrappeGetDoc,
//     useFrappeFileUpload,
//     useFrappeGetDocList
// } from "../../hooks/useFrappe";
// import { DOCTYPE_DONATION_TYPE, DOCTYPE_TEMPLE } from "../../config/constants";
// import AddPageHeader from "../../components/common/AddPageHeader";
// import ActivityLog from "../../components/common/ActivityLog";
// import PageLoader from "../../components/common/PageLoader";
// import FormFooter from "../../components/common/FormFooter";

// // --- Clean & Minimalist Section Title with Tailwind ---
// const SectionTitle = ({ icon, children }) => (
//     <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black border-b border-zinc-200 pb-2.5 mb-5 mt-1">
//         {icon} {children}
//     </div>
// );

// const DonationTypeForm = ({ id, onBack }) => {
//     const isEdit = !!id;
//     const [form] = Form.useForm();

//     // --- Frappe API Hooks ---
//     const { createDoc, loading: creating } = useFrappeCreateDoc();
//     const { updateDoc, loading: updating } = useFrappeUpdateDoc();
//     const { upload, loading: uploading } = useFrappeFileUpload();
//     const { data, loading, error } = useFrappeGetDoc(DOCTYPE_DONATION_TYPE, id);
//     const { data: temples } = useFrappeGetDocList(DOCTYPE_TEMPLE, { fields: ["name", "temple_name"] });

//     // --- Form Watchers for Live Preview Panel ---
//     const donationTypeName = Form.useWatch("donation_type", form) || "";
//     const defaultAmount    = Form.useWatch("default_amount", form) || "";
//     const fileList         = Form.useWatch("donation_image", form) || [];
//     const previewUrl       = fileList?.[0]?.url || fileList?.[0]?.thumbUrl || "";

//     // --- Effect for Form Binding in Edit Mode ---
//     useEffect(() => {
//         if (isEdit && data) {
//             let initialFileList = [];
//             if (data.donation_image) {
//                 const url = data.donation_image.startsWith("http")
//                     ? data.donation_image
//                     : `${window.location.origin}${data.donation_image.startsWith("/") ? "" : "/"}${data.donation_image}`;
//                 initialFileList = [{ uid: "-1", name: "image", status: "done", url, thumbUrl: url }];
//             }
//             form.setFieldsValue({ ...data, donation_image: initialFileList });
//         }
//     }, [isEdit, data, form]);

//     // --- Form Submission Logic ---
//     const handleSave = async (values) => {
//         try {
//             const { donation_image, ...rest } = values;
//             let doc;
            
//             if (isEdit) {
//                 doc = await updateDoc(DOCTYPE_DONATION_TYPE, id, rest);
//             } else {
//                 doc = await createDoc(DOCTYPE_DONATION_TYPE, rest);
//             }

//             const docName = isEdit ? id : (doc?.name || doc);
//             if (!docName) throw new Error("Could not determine document name.");

//             // Handle Image Upload / Clean ups
//             if (donation_image && donation_image.length > 0) {
//                 const file = donation_image[0].originFileObj;
//                 if (file) {
//                     const uploaded = await upload(file, { 
//                         doctype: DOCTYPE_DONATION_TYPE, 
//                         docname: docName, 
//                         fieldname: "donation_image", 
//                         is_private: 0 
//                     });
//                     if (uploaded?.file_url) {
//                         await updateDoc(DOCTYPE_DONATION_TYPE, docName, { donation_image: uploaded.file_url });
//                     }
//                 }
//             } else if (isEdit && (!donation_image || donation_image.length === 0)) {
//                 await updateDoc(DOCTYPE_DONATION_TYPE, id, { donation_image: "" });
//             }

//             if (onBack) onBack();
//         } catch (err) { 
//             console.error("Save Error:", err); 
//         }
//     };

//     if (loading) return <PageLoader />;
//     if (error) return <Alert message="Error loading data" type="error" action={<Button onClick={onBack}>Back</Button>} />;

//     return (
//         <div className="donation-page py-6">
//             <AddPageHeader
//                 onBack={onBack}
//                 title={isEdit ? "Edit Donation Type" : "Add Donation Type"}
//                 subtitle="Donation Setup"
//                 showBack={true}
//             />

//             <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false}>
//                 <Row gutter={[24, 24]}>

//                     {/* ─── LEFT: Image Preview Panel ─── */}
//                     <Col xs={24} lg={7}>
//                         <div className="space-y-6 sticky top-6">
//                             <Card size="small" title={<Space><PictureOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Preview</span></Space>}>
//                                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '8px 0' }}>
//                                     <Form.Item
//                                         name="donation_image"
//                                         valuePropName="fileList"
//                                         getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
//                                         style={{ marginBottom: 0, width: '100%' }}
//                                     >
//                                         <Upload maxCount={1} beforeUpload={() => false} listType="picture" showUploadList={false}>
//                                             <div style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//                                                 {previewUrl ? (
//                                                     <img src={previewUrl} alt="preview" style={{ width: 112, height: 112, borderRadius: 10, objectFit: 'cover', border: '1px solid #18181b' }} />
//                                                 ) : (
//                                                     <div style={{ width: 112, height: 112, borderRadius: 10, border: '2px dashed #d4d4d8', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
//                                                         <PictureOutlined style={{ fontSize: 20, color: '#a1a1aa' }} />
//                                                         <span style={{ fontSize: 10, fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>Upload</span>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </Upload>
//                                     </Form.Item>

//                                     <div style={{ textAlign: 'center', width: '100%' }}>
//                                         <div style={{ fontSize: 14, fontWeight: 600, color: '#18181b' }}>{donationTypeName || "Donation Type"}</div>
//                                         {defaultAmount && (
//                                             <div style={{ marginTop: 6 }}>
//                                                 <span style={{ backgroundColor: '#18181b', color: '#fff', borderRadius: 6, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>₹ {defaultAmount}</span>
//                                             </div>
//                                         )}
//                                     </div>

//                                     <div style={{ width: '100%', borderTop: '1px solid #f4f4f5', paddingTop: 10, textAlign: 'center' }}>
//                                         <span style={{ fontSize: 10, color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
//                                             {isEdit ? "Editing Category" : "New Category"}
//                                         </span>
//                                     </div>
//                                 </div>
//                             </Card>
//                         </div>
//                     </Col>

//                     {/* ─── RIGHT: Form Card ─── */}
//                     <Col xs={24} lg={17}>
//                         <div className="space-y-6">
//                             <Card size="small" title={<Space><TagOutlined style={{ color: '#18181b' }} /><span style={{ fontWeight: 700, color: '#27272a' }}>Category Details</span></Space>}>
//                                 <Row gutter={[16, 12]}>
//                                     <Col xs={24} sm={12}>
//                                         <Form.Item name="donation_type" label="Donation Type" rules={[{ required: true, message: "Required" }]}>
//                                             <Input prefix={<TagOutlined style={{ color: '#a1a1aa' }} />} placeholder="e.g. Anndan, Vastra Daan" />
//                                         </Form.Item>
//                                     </Col>
//                                     <Col xs={24} sm={12}>
//                                         <Form.Item name="default_amount" label="Default Amount">
//                                             <Input prefix={<DollarOutlined style={{ color: '#a1a1aa' }} />} placeholder="0.00" type="number" />
//                                         </Form.Item>
//                                     </Col>
//                                     <Col xs={24}>
//                                         <Form.Item name="temple" label="Associated Temple">
//                                             <Select
//                                                 placeholder="Select Temple"
//                                                 allowClear
//                                                 options={temples?.map(t => ({ value: t.name, label: t.temple_name || t.name }))}
//                                             />
//                                         </Form.Item>
//                                     </Col>
//                                 </Row>
//                             </Card>
//                         </div>
//                     </Col>

//                 </Row>

//                 <FormFooter
//                     onCancel={onBack}
//                     loading={creating || updating || uploading}
//                     isEdit={isEdit}
//                     saveText={isEdit ? "Update Type" : "Create Type"}
//                 />
//             </Form>

//             {isEdit && <ActivityLog doctype={DOCTYPE_DONATION_TYPE} docname={id} />}
//         </div>
//     );
// };

// export default DonationTypeForm;



import React, { useEffect } from "react";
import {
    Form, Input, Button, Alert, Upload, Select, Row, Col, Card, Space
} from "antd";
import {
    PictureOutlined, TagOutlined, DollarOutlined, BankOutlined, CloudUploadOutlined
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
import PageLoader from "../../components/common/PageLoader";
import FormFooter from "../../components/common/FormFooter";
import ViewContainer from "../../components/common/ViewContainer";
import SectionCard from "../../components/common/SectionCard";

const DonationTypeForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    // --- Frappe API Hooks ---
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { upload, loading: uploading } = useFrappeFileUpload();
    const { data, loading, error } = useFrappeGetDoc(DOCTYPE_DONATION_TYPE, id);
    const { data: temples } = useFrappeGetDocList(DOCTYPE_TEMPLE, { fields: ["name", "temple_name"] });

    // --- Form Watchers for Live Image Configuration ---
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

    const formItemStyle = { marginBottom: '16px' };

    // Common Premium Card Style Config
    // const commonCardProps = {
    //     size: "small",
    //     className: "shadow-sm border border-zinc-200/80 overflow-hidden",
    //     style: { 
    //         height: '100%',
    //         background: '#ffffff',
    //     },
    //     headStyle: {
    //         background: '#f4f4f5',
    //         borderBottom: '1px solid #e4e4e7',
    //         paddingTop: '10px',
    //         paddingBottom: '10px'
    //     },
    //     bodyStyle: {
    //         padding: '20px'
    //     }
    // };

    return (
        <ViewContainer className="donation-page">
            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Edit Donation Type" : "Add Donation Type"}
                subtitle="Donation Setup"
                showBack={true}
            />

            <Form form={form} layout="vertical" onFinish={handleSave} requiredMark={false} size="middle">
                
                <Row gutter={[24, 24]} align="stretch">

                    {/* ================= LEFT COLUMN: Modern Image Management ================= */}
                    <Col xs={24} md={9} lg={8}>
                        <SectionCard 
                            title="Display Image"
                            icon={<PictureOutlined style={{ color: '#18181b' }} />}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '210px' }}>
                                
                                <Form.Item
                                    name="donation_image"
                                    valuePropName="fileList"
                                    getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}
                                    style={{ marginBottom: 0 }}
                                >
                                    <Upload maxCount={1} beforeUpload={() => false} listType="picture" showUploadList={false}>
                                        <div style={{
                                            width: '130px',
                                            height: '130px',
                                            borderRadius: '14px',
                                            border: previewUrl ? '1px solid #e4e4e7' : '2px dashed #cbd5e1',
                                            backgroundColor: '#f8fafc',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            transition: 'all 0.2s ease',
                                            boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)'
                                        }}>
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="donation configuration banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <>
                                                    <CloudUploadOutlined style={{ fontSize: '26px', color: '#64748b' }} />
                                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Upload Photo</span>
                                                </>
                                            )}
                                        </div>
                                    </Upload>
                                </Form.Item>

                                {/* Improved & Highly Professional Helper Text */}
                                <div style={{ marginTop: '16px' }}>
                                    <h5 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                                        Category Banner
                                    </h5>
                                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: '1.5', maxWidth: '210px' }}>
                                        Recommended square aspect (1:1 Ratio). Supports high-quality PNG or JPG formats.
                                    </p>
                                </div>

                            </div>
                        </SectionCard>
                    </Col>

                    {/* ================= RIGHT COLUMN: Core Details ================= */}
                    <Col xs={24} md={15} lg={16}>
                        <SectionCard 
                            title="Category Details"
                            icon={<TagOutlined style={{ color: '#18181b' }} />}
                        >
                            <Row gutter={[16, 0]}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="donation_type" label="Donation Type" style={formItemStyle} rules={[{ required: true, message: "Required" }]}>
                                        <Input prefix={<TagOutlined style={{ color: '#a1a1aa' }} />} placeholder="e.g. Anndan, Vastra Daan" />
                                    </Form.Item>
                                </Col>
                                
                                <Col xs={24} sm={12}>
                                    <Form.Item name="default_amount" label="Default Amount (₹)" style={formItemStyle}>
                                        <Input prefix={<DollarOutlined style={{ color: '#a1a1aa' }} />} placeholder="0.00" type="number" />
                                    </Form.Item>
                                </Col>

                                <Col xs={24}>
                                    <Form.Item name="temple" label="Associated Temple" style={formItemStyle}>
                                        <Select
                                            placeholder="Select Associated Temple"
                                            allowClear
                                            suffixIcon={<BankOutlined style={{ color: '#a1a1aa' }} />}
                                            options={temples?.map(t => ({ value: t.name, label: t.temple_name || t.name }))}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </SectionCard>
                    </Col>

                </Row>

                <div style={{ marginTop: '24px' }}>
                    <FormFooter
                        onCancel={onBack}
                        loading={creating || updating || uploading}
                        isEdit={isEdit}
                        saveText={isEdit ? "Update Type" : "Create Type"}
                    />
                </div>
            </Form>
        </ViewContainer>
    );
};

export default DonationTypeForm;