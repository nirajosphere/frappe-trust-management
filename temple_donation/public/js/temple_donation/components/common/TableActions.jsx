import React from "react";
import { Space, Button, Popconfirm, Tooltip, Dropdown } from "antd";
import { EyeOutlined, EditOutlined, PrinterOutlined, DeleteOutlined, MoreOutlined } from "@ant-design/icons";

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
    showDelete = true,
    isMobile = false
}) => {
    if (isMobile) {
        const menuItems = [];
        if (onView && showView) {
            menuItems.push({
                key: "view",
                label: "View",
                icon: <EyeOutlined className="text-orange-500" />,
                onClick: () => onView(record)
            });
        }
        if (onEdit && showEdit) {
            menuItems.push({
                key: "edit",
                label: "Edit",
                icon: <EditOutlined className="text-blue-500" />,
                onClick: () => onEdit(record)
            });
        }
        if (onPrint && showPrint) {
            menuItems.push({
                key: "print",
                label: "Print",
                icon: <PrinterOutlined className="text-amber-500" />,
                onClick: () => onPrint(record)
            });
        }
        if (onDelete && showDelete) {
            menuItems.push({
                key: "delete",
                label: <span className="text-red-500">Delete</span>,
                icon: <DeleteOutlined className="text-red-500" />,
                onClick: () => onDelete(record)
            });
        }

        return (
            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                <Button 
                    type="text"
                    icon={<MoreOutlined style={{ fontSize: '18px' }} />} 
                    className="text-zinc-600 hover:text-white hover:bg-zinc-900 rounded-md h-8 w-8 p-0 flex items-center justify-center transition-all border border-zinc-200 hover:border-zinc-400 bg-white"
                />
            </Dropdown>
        );
    }

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
