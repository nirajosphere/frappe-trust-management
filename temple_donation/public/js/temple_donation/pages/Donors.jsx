import React, { useState } from "react";
import { Alert, Button, Modal, Form, Input, message, Space, Typography, Row, Col } from "antd";
import { useFrappeGetDocList, useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeDeleteDoc } from "../hooks/useFrappe";
import { donorColumns } from "../tabelcolumn/donorTable";
import CommonTable from "../components/common/CommonTable";
import PageHeader from "../components/common/PageHeader";

const { Title, Text } = Typography;

const Donors = () => {
    // 1. Fetch Donors
    const { data: donors, loading, error, mutate } = useFrappeGetDocList("Donor", {
        fields: ["name", "donor_name", "mobile_number", "address", "email", "city"],
        limit: 100
    });

    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { deleteDoc } = useFrappeDeleteDoc();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDonor, setEditingDonor] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState("");

    const showModal = () => {
        setEditingDonor(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (donor) => {
        setEditingDonor(donor);
        form.setFieldsValue(donor);
        setIsModalOpen(true);
    };

    const handleDelete = (record) => {
        const name = record.name;
        Modal.confirm({
            title: 'Are you sure you want to delete this donor?',
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                return deleteDoc("Donor", name)
                    .then(() => {
                        message.success("Donor deleted successfully!");
                        mutate();
                    })
                    .catch((err) => {
                        message.error(err.message || "Failed to delete.");
                    });
            }
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingDonor(null);
        form.resetFields();
    };

    const handleSave = async (values) => {
        try {
            if (editingDonor) {
                await updateDoc("Donor", editingDonor.name, values);
                message.success("Donor updated successfully!");
            } else {
                await createDoc("Donor", values);
                message.success("Donor created successfully!");
            }
            handleCancel();
            await mutate();
        } catch (err) {
            message.error(err.message || "Something went wrong");
        }
    };

    if (error) {
        return (
            <div className="p-6">
                <Alert
                    message="Connection Error"
                    description={error.message || "Failed to fetch donors list."}
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <PageHeader 
                title="Donors Management" 
                description="View, add, edit or delete donor records" 
                onAdd={showModal} 
                onSearch={setSearchText}
                searchPlaceholder="Search donors by name or mobile..."
                addLabel="Add New Donor" 
            />

            <CommonTable
                columns={donorColumns}
                dataSource={donors}
                loading={loading}
                searchText={searchText}
                onEdit={handleEdit}
                onDelete={handleDelete}
                rowKey="name"
            />

            <Modal
                title={editingDonor ? "Edit Donor Details" : "Register New Donor"}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                destroyOnClose
                className="aavatto-premium-modal"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    className="p-4"
                >
                    <Form.Item
                        name="donor_name"
                        label="Full Name"
                        rules={[{ required: true, message: 'Please enter the donor\'s full name!' }]}
                    >
                        <Input placeholder="John Doe" className="h-11 rounded-lg" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="mobile_number"
                                label="Mobile Number"
                                rules={[
                                    { required: true, message: 'Please enter the mobile number!' },
                                    { pattern: /^\d{10}$/, message: 'Please enter a valid 10-digit number!' }
                                ]}
                            >
                                <Input placeholder="9876543210" className="h-11 rounded-lg" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="city"
                                label="City"
                            >
                                <Input placeholder="Enter city" className="h-11 rounded-lg" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="address"
                        label="Address"
                    >
                        <Input.TextArea placeholder="Enter full address" rows={3} className="rounded-lg" />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: '24px' }}>
                        <Space>
                            <Button onClick={handleCancel} className="h-11 px-8 rounded-lg font-bold">Cancel</Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={creating || updating}
                                className="h-11 px-10 rounded-lg font-bold bg-black border-none"
                            >
                                {editingDonor ? "Save Changes" : "Create Donor"}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Donors;
