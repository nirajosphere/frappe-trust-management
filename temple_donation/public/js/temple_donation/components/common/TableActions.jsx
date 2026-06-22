import React from "react";
import { Space, Button, Popconfirm, Tooltip } from "antd";
import { EyeOutlined, EditOutlined, PrinterOutlined, DeleteOutlined } from "@ant-design/icons";

/**
 * Reusable Action Buttons for Tables
 */
const TableActions = ({
    record,
    onView,
    onEdit,
    onPrint,
    onDelete,
    showView = true,
    showEdit = true,
    showPrint = true,
    showDelete = true
}) => {
    return (
        <Space size="small">
            {onView && showView && (
                <Tooltip title="View">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => onView(record)}
                        className="px-2 border border-gray-200 hover:!text-orange-500"
                    />
                </Tooltip>
            )}

            {onEdit && showEdit && (
                <Tooltip title="Edit">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(record)}
                        className="px-2 border border-gray-200 hover:!text-blue-500"
                    />
                </Tooltip>
            )}

            {/* {onPrint && showPrint && (
                <Tooltip title="Print">
                    <Button
                        type="text"
                        icon={<PrinterOutlined />}
                        onClick={() => onPrint(record)}
                        className="px-2 border border-gray-200 hover:!text-amber-500"
                    />
                </Tooltip>
            )} */}

            {onDelete && showDelete && (
                <Tooltip title="Delete">
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDelete(record)}
                        className="px-2 border border-red-200 hover:!text-red-500"
                    />
                </Tooltip>
            )}
        </Space>
    );
};

export default TableActions;
