import React, { useState } from "react";
import { Table, Card, Typography, Row, Col, Button, Input, Space, Modal, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

/**
 * CommonTable Component
 *
 * Props:
 * @param {string} title - Page title
 * @param {string} description - Page description/subtitle
 * @param {Array} columns - Ant Design Table columns
 * @param {Array} dataSource - Table data
 * @param {boolean} loading - Loading state
 * @param {string} searchPlaceholder - Placeholder for search input
 * @param {function} onAdd - Callback for "Add New" button
 * @param {function} onEdit - Callback for "Edit" action
 * @param {function} onDelete - Callback for "Delete" action
 * @param {string} rowKey - Field used as row key (default: 'name')
 */
const CommonTable = ({
    title,
    description,
    columns,
    dataSource,
    loading,
    searchPlaceholder = "Search...",
    onAdd,
    onEdit,
    onDelete,
    rowKey = "name",
}) => {
    const [searchText, setSearchText] = useState("");

    const filteredData = dataSource?.filter(item => {
        // Simple search across all values
        return Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchText.toLowerCase())
        );
    });

    const actionColumn = {
        title: 'Actions',
        key: 'actions',
        width: 150,
        render: (_, record) => (
            <Space size="middle">
                {onEdit && (
                    <Button
                        type="primary"
                        ghost
                        icon={<EditOutlined />}
                        onClick={() => onEdit(record)}
                        size="small"
                    >
                        Edit
                    </Button>
                )}
                {onDelete && (
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDelete(record)}
                        size="small"
                    >
                        Delete
                    </Button>
                )}
            </Space>
        )
    };

    const finalColumns = onEdit || onDelete ? [...columns, actionColumn] : columns;

    return (
        <Card bordered={false} className="shadow-sm" style={{ borderRadius: '12px' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: "24px" }}>
                <Col>
                    <Title level={3} style={{ margin: 0, fontWeight: 800 }}>{title}</Title>
                    <Text type="secondary">{description}</Text>
                </Col>
                <Col>
                    {onAdd && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={onAdd}
                            style={{ height: '40px', borderRadius: '8px', fontWeight: 600 }}
                        >
                            Add New
                        </Button>
                    )}
                </Col>
            </Row>

            <div style={{ marginBottom: '20px' }}>
                <Input
                    placeholder={searchPlaceholder}
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}
                    allowClear
                />
            </div>

            <Table
                dataSource={filteredData}
                columns={finalColumns}
                rowKey={rowKey}
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`
                }}
                className="aavatto-table"
                scroll={{ x: 'max-content' }}
            />
        </Card>
    );
};

export default CommonTable;
