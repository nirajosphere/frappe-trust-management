import React, { useEffect } from "react";
import {
    Form, Input, Button, Card, Typography, Space, Row, Col,
    message, Spin, Alert, Upload
} from "antd";
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined } from "@ant-design/icons";
import {
    useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDoc, useFrappeFileUpload
} from "../../hooks/useFrappe";
import { DOCTYPE_DONATION_TYPE } from "../../config/constants";
import { donationTypeFormFields } from "../../formfield/donationTypeFormFields";
import PageHeader from "../../components/common/PageHeader";

const { Title, Text } = Typography;

const DonationTypeForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { upload, loading: uploading } = useFrappeFileUpload();
    const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(DOCTYPE_DONATION_TYPE, id);

    useEffect(() => {
        if (isEdit && initialValues) {
            form.setFieldsValue(initialValues);
        } else if (!isEdit) {
            const defaultValues = {};
            donationTypeFormFields.fields.forEach(f => {
                if (f.defaultValue) defaultValues[f.name] = f.defaultValue;
            });
            form.setFieldsValue(defaultValues);
        }
    }, [isEdit, initialValues, form]);

    const handleSave = async (values) => {
        try {
            const formData = { ...values };
            const fileValue = values.donation_image;
            delete formData.donation_image;

            let doc;
            if (isEdit) {
                doc = await updateDoc(DOCTYPE_DONATION_TYPE, id, formData);
            } else {
                doc = await createDoc(DOCTYPE_DONATION_TYPE, formData);
            }

            const docName = isEdit ? id : doc.name;

            if (fileValue && fileValue.fileList && fileValue.fileList.length > 0) {
                const file = fileValue.fileList[0].originFileObj;
                if (file) {
                    await upload(file, {
                        doctype: DOCTYPE_DONATION_TYPE,
                        docname: docName,
                        fieldname: "donation_image"
                    });
                }
            }

            message.success(`Category ${isEdit ? 'updated' : 'created'} successfully!`);
            if (onBack) onBack();
        } catch (err) {
            message.error(err.message || "Something went wrong during synchronization.");
        }
    };

    if (isEdit && fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Spin size="large" />
                <Text className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Fetching category configuration...</Text>
            </div>
        );
    }

    if (isEdit && fetchError) {
        return (
            <div className="p-8">
                <Alert
                    message="Synchronization Error"
                    description={fetchError.message || "Failed to fetch category details."}
                    type="error"
                    showIcon
                    action={<Button onClick={onBack} icon={<ArrowLeftOutlined />}>Return</Button>}
                />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-6">
            <PageHeader
                onBack={onBack}
                subtitle="Donation Taxonomy"
                title={isEdit ? "Edit Category" : "Establish Category"}
            />

            <Card size="small" className="aavatto-card">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    scrollToFirstError
                    requiredMark={false}
                    className="p-6"
                >
                    <Row gutter={[24, 0]}>
                        {donationTypeFormFields.fields.map((field) => (
                            <Col xs={24} md={field.type === 'textarea' ? 24 : 12} key={field.name}>
                                <Form.Item
                                    name={field.name}
                                    label={<Text strong className="text-zinc-500 uppercase text-[10px] tracking-widest">{field.label}</Text>}
                                    rules={[
                                        { required: field.required, message: field.message }
                                    ].filter(Boolean)}
                                >
                                    {field.type === 'image' ? (
                                        <Upload
                                            maxCount={1}
                                            beforeUpload={() => false}
                                            listType="picture"
                                            className="w-full"
                                        >
                                            <Button icon={<UploadOutlined />} className="h-10 w-full border-dashed border-zinc-200 bg-zinc-50/50 text-zinc-500 font-black text-[10px] tracking-widest uppercase">
                                                Select Representative Image
                                            </Button>
                                        </Upload>
                                    ) : (
                                        <Input
                                            placeholder={field.placeholder}
                                            className="h-10 border-zinc-200 bg-zinc-50/30 focus:bg-white transition-all rounded-xl px-4 font-bold tracking-tight"
                                        />
                                    )}
                                </Form.Item>
                            </Col>
                        ))}
                    </Row>

                    <div className="flex items-center justify-end gap-3 mt-10 border-t border-zinc-100 pt-8">
                        <Button
                            onClick={onBack}
                            className="h-10 px-8 font-black border-zinc-200 text-zinc-400 hover:text-zinc-900 transition-all text-[10px] uppercase tracking-widest"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={creating || updating || uploading}
                            icon={<SaveOutlined />}
                            className="h-10 px-10 font-bold bg-black hover:bg-zinc-800 border-none shadow-md flex items-center gap-2 text-[10px] uppercase tracking-widest"
                        >
                            {isEdit ? "Update Metadata" : "Initialize Category"}
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default DonationTypeForm;
