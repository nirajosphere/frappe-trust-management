import React from "react";
import { Table, Card, Typography, Row, Col, Button, Space, Modal, message, Divider } from "antd";
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
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
    searchText = "",
    onEdit,
    onDelete,
    onView,
    onPrint,
    rowKey = "name",
}) => {

    const filteredData = dataSource?.filter(item => {
        return Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchText.toLowerCase())
        );
    });

    const actionColumn = {
        title: 'Actions',
        key: 'actions',
        fixed: 'right',
        width: 180,
        render: (_, record) => (
            <Space size="middle">
                {onView && (
                    <Button
                        type="text"
                        icon={<EyeOutlined className="text-orange-500" />}
                        onClick={() => onView(record)}
                        className="hover:bg-orange-50 rounded-lg"
                        title="View Details"
                    />
                )}
                {onPrint && (
                    <Button
                        type="text"
                        icon={<PrinterOutlined className="text-amber-500" />}
                        onClick={() => onPrint(record)}
                        className="hover:bg-amber-50 rounded-lg"
                        title="Print"
                    />
                )}
                {onEdit && (
                    <Button
                        type="text"
                        icon={<EditOutlined className="text-amber-700" />}
                        onClick={() => onEdit(record)}
                        className="hover:bg-amber-100/50 rounded-lg"
                        title="Edit"
                    />
                )}
                {onDelete && (
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDelete(record)}
                        className="hover:bg-red-50 rounded-lg"
                        title="Delete"
                    />
                )}
            </Space>
        )
    };

    const finalColumns = (onView || onPrint || onEdit || onDelete) ? [...columns, actionColumn] : columns;

    return (
        <Card bordered={false} className="aavatto-card !p-0 overflow-hidden shadow-xl shadow-amber-900/5 border-orange-100">

            <Table
                dataSource={filteredData}
                columns={finalColumns}
                rowKey={rowKey}
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => <span className="font-medium text-stone-500">Total <span className="text-amber-600 font-bold">{total}</span> records</span>,
                    className: "!m-8"
                }}
                className="aavatto-premium-table"
                scroll={{ x: 'max-content' }}
            />
        </Card>
    );
};



export default CommonTable;
