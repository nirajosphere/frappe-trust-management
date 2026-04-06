import React, { useState } from "react";
import { Table, Card, Typography, Row, Col, Button, Input, Space, Modal, message, Divider } from "antd";
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
    EyeOutlined, PrinterOutlined, ExportOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

/**
 * CommonTable Component
 */
const CommonTable = ({
    columns,
    dataSource,
    loading,
    searchPlaceholder = "Search...",
    onEdit,
    onDelete,
    onView,
    onPrint,
    rowKey = "name",
}) => {
    const [searchText, setSearchText] = useState("");

    const filteredData = dataSource?.filter(item => {
        return Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchText.toLowerCase())
        );
    });

    const actionColumn = {
        title: 'Actions',
        key: 'actions',
        fixed: 'right',
        width: 220,
        render: (_, record) => (
            <Space size="small">
                {onView && (
                    <Button
                        type="default"
                        shape="circle"
                        icon={<EyeOutlined />}
                        onClick={() => onView(record)}
                        size="small"
                        title="View Details"
                    />
                )}
                {onPrint && (
                    <Button
                        type="default"
                        shape="circle"
                        icon={<PrinterOutlined />}
                        onClick={() => onPrint(record)}
                        size="small"
                        title="Print"
                    />
                )}
                {onEdit && (
                    <Button
                        type="primary"
                        ghost
                        shape="circle"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(record)}
                        size="small"
                        title="Edit"
                    />
                )}
                {onDelete && (
                    <Button
                        danger
                        shape="circle"
                        icon={<DeleteOutlined />}
                        onClick={() => onDelete(record)}
                        size="small"
                        title="Delete"
                    />
                )}
            </Space>
        )
    };

    const finalColumns = onView || onPrint || onEdit || onDelete ? [...columns, actionColumn] : columns;

    return (
        <Card bordered={false} className="shadow-sm listing-table-card" style={{ borderRadius: '16px' }}>
            <div style={{ marginBottom: '24px' }}>
                <Input
                    placeholder={searchPlaceholder}
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: '100%', maxWidth: '400px', height: '45px', borderRadius: '10px' }}
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
                    showTotal: (total) => `Total ${total} entries`,
                    style: { marginTop: '24px' }
                }}
                className="aavatto-premium-table"
                scroll={{ x: 'max-content' }}
            />
        </Card>
    );
};

export default CommonTable;
