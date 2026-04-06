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
    title,
    description,
    columns,
    dataSource,
    loading,
    searchPlaceholder = "Search...",
    onAdd,
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

    const exportToExcel = () => {
        if (!filteredData || filteredData.length === 0) {
            message.warning("No data to export");
            return;
        }

        // CSV Header
        const headers = columns.map(col => col.title).filter(title => title && title !== 'Actions');
        const csvRows = [];
        csvRows.push(headers.join(','));

        // CSV Body
        filteredData.forEach(item => {
            const row = columns
                .filter(col => col.title && col.title !== 'Actions')
                .map(col => {
                    const val = item[col.dataIndex];
                    return `"${String(val || '').replace(/"/g, '""')}"`;
                });
            csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${title.replace(/\s+/g, '_')}_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
            <Row justify="space-between" align="middle" style={{ marginBottom: "32px" }}>
                <Col>
                    <Title level={3} style={{ margin: 0, fontWeight: 800 }}>{title}</Title>
                    <Text type="secondary">{description}</Text>
                </Col>
                <Col>
                    <Space size="middle">
                        <Button 
                            icon={<ExportOutlined />} 
                            onClick={exportToExcel}
                            style={{ height: '40px', borderRadius: '8px' }}
                        >
                            Export
                        </Button>
                        {onAdd && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={onAdd}
                                style={{ height: '40px', borderRadius: '8px', fontWeight: 600 }}
                            >
                                Add New Record
                            </Button>
                        )}
                    </Space>
                </Col>
            </Row>

            <Divider style={{ marginTop: 0, marginBottom: '24px' }} />

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
