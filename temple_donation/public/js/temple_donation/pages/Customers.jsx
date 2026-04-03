import React, { useState } from "react";
import { Table, Spin, Alert, Button, Modal, Form, Input, message, Space } from "antd";
import { useFrappeGetDocList, useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeDeleteDoc, useFrappeFileUpload } from "../hooks/useFrappe";
import FileUpload from "../components/FileUpload";

const Customers = () => {
    // 1. Fetch Using Custom Hook
    const { data: customers, loading, error, mutate } = useFrappeGetDocList("Customer", {
        fields: ["name", "customer_name", "phone", "image"]
    });

    // 2. Continuous Hooks
    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { deleteDoc } = useFrappeDeleteDoc();
    const { upload, loading: uploading } = useFrappeFileUpload();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [form] = Form.useForm();

    const columns = [
        {
            title: 'ID',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Image',
            dataIndex: 'image',
            key: 'image',
            render: (text) => text ? (
                <img src={text} alt="Customer" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eaeaea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#888' }}>N/A</div>
            )
        },
        {
            title: 'Customer Name',
            dataIndex: 'customer_name',
            key: 'customer_name',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Manage',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
                    <Button type="link" danger onClick={() => handleDelete(record.name)}>Delete</Button>
                </Space>
            )
        }
    ];

    const showModal = () => {
        setEditingCustomer(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        form.setFieldsValue(customer);
        setIsModalOpen(true);
    };

    const handleDelete = (name) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this customer?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                return deleteDoc("Customer", name)
                    .then(() => {
                        message.success("Customer deleted successfully!");
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
        setEditingCustomer(null);
        form.resetFields();
    };

    const handleSave = async (values) => {
        try {
            const file = values.attachment;

            const uploadFile = async (docname) => {
                if (file) {
                    await upload(file, {
                        doctype: "Customer",
                        docname: docname,
                        fieldname: "image",
                        is_private: 0
                    });
                }
            };

            if (editingCustomer) {
                await updateDoc("Customer", editingCustomer.name, {
                    customer_name: values.customer_name,
                    phone: values.phone
                });

                await uploadFile(editingCustomer.name);

                message.success("Customer updated successfully!");
            } else {
                const doc = await createDoc("Customer", {
                    customer_name: values.customer_name,
                    phone: values.phone,
                });

                await uploadFile(doc.name);

                message.success("Customer created successfully!");
            }

            handleCancel();

            // 🔥 IMPORTANT
            await mutate();   // force fresh fetch

        } catch (err) {
            message.error(err.message || "Something went wrong");
        }
    };

    return (
        <div style={{ padding: "20px", background: "#f5f7fa", minHeight: "100vh" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "20px" }}>
                <h2 style={{ margin: 0 }}>Customers List</h2>
                <Button type="primary" onClick={showModal}>+ Create Customer</Button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                </div>
            ) : error ? (
                <Alert message="Error" description={error.message || "Something went wrong"} type="error" showIcon />
            ) : (
                <Table
                    dataSource={customers}
                    columns={columns}
                    rowKey="name"
                    pagination={{ pageSize: 10 }}
                />
            )}

            {/* Create / Edit Customer Modal */}
            <Modal
                title={editingCustomer ? "Edit Customer" : "Create New Customer"}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item
                        name="customer_name"
                        label="Customer Name"
                        rules={[{ required: true, message: 'Please enter customer name!' }]}
                    >
                        <Input placeholder="Enter Customer Name" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Phone"
                    >
                        <Input placeholder="Enter Phone Number" />
                    </Form.Item>

                    <Form.Item
                        name="attachment"
                        label="Attachment (PDF, CSV, Image)"
                    >
                        <FileUpload accept="image/*,application/pdf,.csv,.xlsx" />
                    </Form.Item>

                    <Form.Item style={{ marginTop: '20px', textAlign: 'right' }}>
                        <Button style={{ marginRight: '10px' }} onClick={handleCancel}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={creating || updating || uploading}>
                            {editingCustomer ? "Update" : "Create"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Customers;