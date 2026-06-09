// import React, { useEffect } from "react";
// import {
//     Form, Input, Button, Card, Typography, Space, Row, Col,
//     message, Spin, Alert, Upload
// } from "antd";
// import { ArrowLeftOutlined, SaveOutlined, UploadOutlined } from "@ant-design/icons";
// import {
//     useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDoc, useFrappeFileUpload
// } from "../../hooks/useFrappe";
// import { DOCTYPE_DONATION_TYPE } from "../../config/constants";
// import { donationTypeFormFields } from "../../formfield/donationTypeFormFields";
// import PageHeader from "../../components/common/PageHeader";

// const { Title, Text } = Typography;

// const DonationTypeForm = ({ id, onBack }) => {
//     const isEdit = !!id;
//     const [form] = Form.useForm();

//     const { createDoc, loading: creating } = useFrappeCreateDoc();
//     const { updateDoc, loading: updating } = useFrappeUpdateDoc();
//     const { upload, loading: uploading } = useFrappeFileUpload();
//     const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(DOCTYPE_DONATION_TYPE, id);

//     useEffect(() => {
//         if (isEdit && initialValues) {
//             form.setFieldsValue(initialValues);
//         } else if (!isEdit) {
//             const defaultValues = {};
//             donationTypeFormFields.fields.forEach(f => {
//                 if (f.defaultValue) defaultValues[f.name] = f.defaultValue;
//             });
//             form.setFieldsValue(defaultValues);
//         }
//     }, [isEdit, initialValues, form]);

//     const handleSave = async (values) => {
//         try {
//             const formData = { ...values };
//             const fileValue = values.donation_image;
//             delete formData.donation_image;

//             let doc;
//             if (isEdit) {
//                 doc = await updateDoc(DOCTYPE_DONATION_TYPE, id, formData);
//             } else {
//                 doc = await createDoc(DOCTYPE_DONATION_TYPE, formData);
//             }

//             const docName = isEdit ? id : doc.name;

//             if (fileValue && fileValue.fileList && fileValue.fileList.length > 0) {
//                 const file = fileValue.fileList[0].originFileObj;
//                 if (file) {
//                     await upload(file, {
//                         doctype: DOCTYPE_DONATION_TYPE,
//                         docname: docName,
//                         fieldname: "donation_image"
//                     });
//                 }
//             }

//             message.success(`Category ${isEdit ? 'updated' : 'created'} successfully!`);
//             if (onBack) onBack();
//         } catch (err) {
//             message.error(err.message || "Something went wrong during synchronization.");
//         }
//     };

//     if (isEdit && fetching) {
//         return (
//             <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
//                 <Spin size="large" />
//                 <Text className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Fetching category configuration...</Text>
//             </div>
//         );
//     }

//     if (isEdit && fetchError) {
//         return (
//             <div className="p-8">
//                 <Alert
//                     message="Synchronization Error"
//                     description={fetchError.message || "Failed to fetch category details."}
//                     type="error"
//                     showIcon
//                     action={<Button onClick={onBack} icon={<ArrowLeftOutlined />}>Return</Button>}
//                 />
//             </div>
//         );
//     }

//     return (
//         <div className="max-w-3xl mx-auto py-6">
//             <PageHeader
//                 onBack={onBack}
//                 subtitle="Donation Taxonomy"
//                 title={isEdit ? "Edit Category" : "Establish Category"}
//             />

//             <Card size="small" className="aavatto-card">
//                 <Form
//                     form={form}
//                     layout="vertical"
//                     onFinish={handleSave}
//                     scrollToFirstError
//                     requiredMark={false}
//                     className="p-6"
//                 >
//                     <Row gutter={[24, 0]}>
//                         {donationTypeFormFields.fields.map((field) => (
//                             <Col xs={24} md={field.type === 'textarea' ? 24 : 12} key={field.name}>
//                                 <Form.Item
//                                     name={field.name}
//                                     label={<Text strong className="text-zinc-500 uppercase text-[10px] tracking-widest">{field.label}</Text>}
//                                     rules={[
//                                         { required: field.required, message: field.message }
//                                     ].filter(Boolean)}
//                                 >
//                                     {field.type === 'image' ? (
//                                         <Upload
//                                             maxCount={1}
//                                             beforeUpload={() => false}
//                                             listType="picture"
//                                             className="w-full"
//                                         >
//                                             <Button icon={<UploadOutlined />} className="h-10 w-full border-dashed border-zinc-200 bg-zinc-50/50 text-zinc-500 font-black text-[10px] tracking-widest uppercase">
//                                                 Select Representative Image
//                                             </Button>
//                                         </Upload>
//                                     ) : (
//                                         <Input
//                                             placeholder={field.placeholder}
//                                             className="h-10 border-zinc-200 bg-zinc-50/30 focus:bg-white transition-all rounded-xl px-4 font-bold tracking-tight"
//                                         />
//                                     )}
//                                 </Form.Item>
//                             </Col>
//                         ))}
//                     </Row>

//                     <div className="flex items-center justify-end gap-3 mt-10 border-t border-zinc-100 pt-8">
//                         <Button
//                             onClick={onBack}
//                             className="h-10 px-8 font-black border-zinc-200 text-zinc-400 hover:text-zinc-900 transition-all text-[10px] uppercase tracking-widest"
//                         >
//                             Cancel
//                         </Button>
//                         <Button
//                             type="primary"
//                             htmlType="submit"
//                             loading={creating || updating || uploading}
//                             icon={<SaveOutlined />}
//                             className="h-10 px-10 font-bold bg-black hover:bg-zinc-800 border-none shadow-md flex items-center gap-2 text-[10px] uppercase tracking-widest"
//                         >
//                             {isEdit ? "Update Metadata" : "Initialize Category"}
//                         </Button>
//                     </div>
//                 </Form>
//             </Card>
//         </div>
//     );
// };

// export default DonationTypeForm;


import React, { useEffect } from "react";
import {
    Form, Input, Button, Card, Typography, Row, Col,
    message, Alert, Upload, Select
} from "antd";
import { SaveOutlined } from "@ant-design/icons";

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

const { Text } = Typography;

const DonationTypeForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { upload, loading: uploading } = useFrappeFileUpload();
    const { data, loading, error } = useFrappeGetDoc(DOCTYPE_DONATION_TYPE, id);

    // ✅ FETCH TEMPLES (NEW)
    const { data: temples } = useFrappeGetDocList(DOCTYPE_TEMPLE, {
        fields: ["name", "temple_name"]
    });

    // ✅ FIX IMAGE + EDIT DATA
    useEffect(() => {
        if (isEdit && data) {
            let fileList = [];
            if (data.donation_image) {
                const imageUrl = data.donation_image.startsWith('http') 
                    ? data.donation_image 
                    : `${window.location.origin}${data.donation_image.startsWith('/') ? '' : '/'}${data.donation_image}`;
                
                fileList = [{
                    uid: "-1",
                    name: "image",
                    status: "done",
                    url: imageUrl,
                    thumbUrl: imageUrl
                }];
            }

            form.setFieldsValue({
                ...data,
                donation_image: fileList
            });
        }
    }, [isEdit, data]);

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

            if (!docName) {
                throw new Error("Could not determine document name for upload.");
            }

            // Handle image upload or clearing
            if (donation_image && donation_image.length > 0) {
                const file = donation_image[0].originFileObj;
                if (file) {
                    // New image selected, upload it
                    const uploaded = await upload(file, {
                        doctype: DOCTYPE_DONATION_TYPE,
                        docname: docName,
                        fieldname: "donation_image",
                        is_private: 0
                    });

                    // 🔥 IMPORTANT: update field with file_url if the hook doesn't do it automatically
                    if (uploaded?.file_url) {
                        await updateDoc(DOCTYPE_DONATION_TYPE, docName, {
                            donation_image: uploaded.file_url
                        });
                    }
                }
            } else if (isEdit && (!donation_image || donation_image.length === 0)) {
                // Image was cleared, update the field to empty string
                await updateDoc(DOCTYPE_DONATION_TYPE, id, { donation_image: "" });
            }

            message.success("Saved successfully");
            onBack && onBack();

        } catch (err) {
            console.error("Save Error:", err);
            message.error(err.message || "Error saving data");
        }
    };

    if (loading) return <PageLoader />;

    if (error) {
        return (
            <Alert
                message="Error loading data"
                type="error"
                action={<Button onClick={onBack}>Back</Button>}
            />
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4">

            <AddPageHeader
                onBack={onBack}
                title={isEdit ? "Edit Donation Type" : "Add Donation Type"}
                subtitle="Donation Setup"
            />

            <Card className="border border-zinc-200">
                <Form form={form} layout="vertical" onFinish={handleSave}>

                    <Row gutter={[16, 0]}>

                        {/* Donation Type */}
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="donation_type"
                                label={<Text>Donation Type</Text>}
                                rules={[{ required: true, message: "Enter type" }]}
                            >
                                <Input className="h-10" />
                            </Form.Item>
                        </Col>

                        {/* Default Amount */}
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="default_amount"
                                label={<Text>Default Amount</Text>}
                            >
                                <Input className="h-10" />
                            </Form.Item>
                        </Col>

                        {/* ✅ TEMPLE DROPDOWN FIX */}
                        <Col xs={24} sm={12} md={8}>
                            <Form.Item
                                name="temple"
                                label={<Text>Temple</Text>}
                            >
                                <Select
                                    placeholder="Select Temple"
                                    className="h-10"
                                    options={temples?.map(t => ({
                                        value: t.name,
                                        label: t.temple_name || t.name
                                    }))}
                                    allowClear
                                />
                            </Form.Item>
                        </Col>

                        {/* IMAGE */}
                        <Col xs={24}>
                            <Form.Item
                                name="donation_image"
                                label="Donation Image"
                                valuePropName="fileList"
                                getValueFromEvent={(e) => {
                                    if (Array.isArray(e)) return e;
                                    return e && e.fileList;
                                }}
                            >
                                <Upload
                                    maxCount={1}
                                    beforeUpload={() => false}
                                    listType="picture-card"
                                    className="donation-upload"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="text-xs font-bold uppercase tracking-widest">Upload</div>
                                    </div>
                                </Upload>
                            </Form.Item>
                        </Col>

                    </Row>

                    {/* ACTIONS */}
                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 border-t pt-4">

                        <Button onClick={onBack} className="h-10 px-6">
                            Cancel
                        </Button>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={creating || updating || uploading}
                            icon={<SaveOutlined />}
                            className="h-10 px-6 bg-black border-black"
                        >
                            {isEdit ? "Update" : "Save"}
                        </Button>

                    </div>

                </Form>
            </Card>

            {isEdit && <ActivityLog doctype={DOCTYPE_DONATION_TYPE} docname={id} />}
        </div>
    );
};

export default DonationTypeForm;