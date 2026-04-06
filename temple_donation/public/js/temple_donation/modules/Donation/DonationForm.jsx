import React, { useEffect } from "react";
import {
    Form, Input, Button, Card, Typography, Space, Row, Col,
    Spin, Alert
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import {
    useFrappeGetDoc, useFrappeUpdateDoc
} from "../../hooks/useFrappe";
import { DOCTYPE_DONATION } from "../../config/constants";
import { donationFormFields } from "../../formfield/donationFormFields";
import PageHeader from "../../components/common/PageHeader";

const { Title, Text } = Typography;

const DonationForm = ({ id, onBack }) => {
    const isEdit = !!id;
    const [form] = Form.useForm();

    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { data: initialValues, loading: fetching, error: fetchError } = useFrappeGetDoc(DOCTYPE_DONATION, id);

    useEffect(() => {
        if (isEdit && initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [isEdit, initialValues, form]);

    const handleSave = async (values) => {
        try {
            await updateDoc(DOCTYPE_DONATION, id, values);
            if (onBack) onBack();
        } catch (err) {
            console.error(err);
        }
    };

    if (fetching) return <div className="p-20 text-center"><Spin /></div>;
    if (fetchError) return <Alert message="Error" description={fetchError.message} type="error" />;

    return (
        <div className="max-w-5xl mx-auto py-6">
            <PageHeader
                onBack={onBack}
                subtitle="Transaction Record"
                title="Edit Donation Record"
            />

            <Card size="small" className="aavatto-card">
                <Form form={form} layout="vertical" onFinish={handleSave} className="p-6">
                    <Row gutter={[24, 0]}>
                        {donationFormFields.fields.map((field) => (
                            <Col xs={24} md={12} key={field.name}>
                                <Form.Item
                                    name={field.name}
                                    label={<Text strong className="text-zinc-500 uppercase text-[10px] tracking-widest">{field.label}</Text>}
                                >
                                    <Input
                                        placeholder={field.placeholder}
                                        disabled={field.readOnly}
                                        className="h-10 border-zinc-200 bg-zinc-50/30 font-bold"
                                    />
                                </Form.Item>
                            </Col>
                        ))}
                    </Row>
                    <div className="flex justify-end gap-3 mt-10 border-t pt-8">
                        <Button onClick={onBack} className="h-10 px-8 font-bold text-zinc-400">Cancel</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={updating}
                            icon={<SaveOutlined />}
                            className="h-10 px-10 font-bold bg-black border-none"
                        >
                            Sync Changes
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default DonationForm;
