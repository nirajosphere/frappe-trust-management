import React, { useState, useEffect } from "react";
import { Table, Spin, Alert, Button, Modal, Form, Input, message, Space, Card, Typography, Row, Col } from "antd";
import { UserAddOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import { useFrappeGetDocList, useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeDeleteDoc } from "../hooks/useFrappe";

const { Title, Text } = Typography;

const Donors = () => {
    // 1. Fetch Donors
    const { data: donors, loading, error, mutate } = useFrappeGetDocList("Donor", {
        fields: ["name", "donor_name", "mobile_number", "address"],
        limit: 100
    });

    const { createDoc, loading: creating } = useFrappeCreateDoc();
    const { updateDoc, loading: updating } = useFrappeUpdateDoc();
    const { deleteDoc } = useFrappeDeleteDoc();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDonor, setEditingDonor] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState("");

    const filteredDonors = donors?.filter(donor =>
        donor.donor_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        donor.mobile_number?.includes(searchText)
    );

    const columns = [
        {
            title: 'Donor ID',
            dataIndex: 'name',
            key: 'name',
            width: 150,
            render: (text) => <Text copyable>{text}</Text>
        },
        {
            title: 'Name',
            dataIndex: 'donor_name',
            key: 'donor_name',
            render: (text) => <Text strong>{text}</Text>,
            sorter: (a, b) => a.donor_name.localeCompare(b.donor_name),
        },
        {
            title: 'Mobile Number',
            dataIndex: 'mobile_number',
            key: 'mobile_number',
        },

        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true,
            render: (text) => text || <Text type="secondary">-</Text>
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        ghost
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
                        Edit
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.name)}
                    >
                        Delete
                    </Button>
                </Space>
            )
        }
    ];

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

    const handleDelete = (name) => {
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

    return (
        <div style={{ padding: "24px" }}>
            <Card bordered={false} className="shadow-sm" style={{ borderRadius: '12px' }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: "24px" }}>
                    <Col>
                        <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Donors Management</Title>
                        <Text type="secondary">View, add, edit or delete donor records</Text>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            size="large"
                            icon={<UserAddOutlined />}
                            onClick={() => {
                                if (typeof frappe !== "undefined") {
                                    frappe.set_route("temple-donation", "donation");
                                }
                            }}
                            style={{ height: '48px', borderRadius: '8px', fontWeight: 600 }}
                        >
                            Add New Donor
                        </Button>
                    </Col>
                </Row>

                <div style={{ marginBottom: '20px' }}>
                    <Input
                        placeholder="Search donors by name or mobile..."
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}
                        allowClear
                    />
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}>
                        <Spin size="large" tip="Fetching donors..." />
                    </div>
                ) : error ? (
                    <Alert
                        message="Connection Error"
                        description={error.message || "Failed to fetch donors list."}
                        type="error"
                        showIcon
                    />
                ) : (
                    // <div style={{ overflowX: 'auto' }}>
                    <Table
                        dataSource={filteredDonors}
                        columns={columns}
                        rowKey="name"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} donors`
                        }}
                        className="aavatto-table"
                    />
                    // </div>
                )}
            </Card>

            <Modal
                title={editingDonor ? "Edit Donor Details" : "Register New Donor"}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    initialValues={{ payment_mode: "Cash" }}
                >
                    <Form.Item
                        name="donor_name"
                        label="Full Name"
                        rules={[{ required: true, message: 'Please enter the donor\'s full name!' }]}
                    >
                        <Input placeholder="John Doe" style={{ borderRadius: '6px' }} />
                    </Form.Item>

                    <Form.Item
                        name="mobile_number"
                        label="Mobile Number"
                        rules={[
                            { required: true, message: 'Please enter the mobile number!' },
                            { pattern: /^\d{10}$/, message: 'Please enter a valid 10-digit number!' }
                        ]}
                    >
                        <Input placeholder="9876543210" style={{ borderRadius: '6px' }} />
                    </Form.Item>

                    {/* <Form.Item
                        name="email"
                        label="Email Address (Optional)"
                        rules={[{ type: 'email', message: 'Please enter a valid email!' }]}
                    >
                        <Input placeholder="john@example.com" style={{ borderRadius: '6px' }} />
                    </Form.Item> */}

                    <Form.Item
                        name="address"
                        label="Address (Optional)"
                    >
                        <Input.TextArea placeholder="Enter full address" rows={3} style={{ borderRadius: '6px' }} />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: '24px' }}>
                        <Space>
                            <Button onClick={handleCancel} style={{ borderRadius: '6px' }}>Cancel</Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={creating || updating}
                                style={{ borderRadius: '6px', minWidth: '100px' }}
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
