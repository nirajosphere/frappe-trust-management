import React from "react";
import { Button, Space, Typography } from "antd";
import {
    ArrowLeftOutlined,
    RedoOutlined,
    EditOutlined,
    PlusOutlined
} from "@ant-design/icons";

const { Text, Title } = Typography;

const AddPageHeader = ({
    title = "Page Title",
    subtitle,
    onBack,
    onReset,
    onEdit,
    onAdd,

    showBack = true,
    showReset = false,
    showEdit = false,
    showAdd = false,

    disableReset = false
}) => {
    return (
        <div className="flex items-center justify-between mb-6 border-b border-zinc-200 pb-4">

            {/* LEFT */}
            <div className="flex items-center gap-3">

                {showBack && (
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={onBack || (() => window.history.back())}
                        className="h-10 w-10 border border-zinc-200"
                    />
                )}

                <div>
                    <Title level={3} className="!m-0">
                        {title}
                    </Title>
                    {subtitle && (
                        <Text className="text-[10px] text-zinc-400 block">
                            {subtitle}
                        </Text>
                    )}
                </div>
            </div>

            {/* RIGHT */}
            <Space>

                {showAdd && (
                    <Button
                        icon={<PlusOutlined />}
                        onClick={onAdd}
                        className="h-10 border border-zinc-200"
                    >
                        Add
                    </Button>
                )}

                {showEdit && (
                    <Button
                        icon={<EditOutlined />}
                        onClick={onEdit}
                        className="h-10 border border-zinc-200"
                    >
                        Edit
                    </Button>
                )}

                {showReset && (
                    <Button
                        icon={<RedoOutlined />}
                        onClick={onReset}
                        disabled={disableReset}
                        className="h-10 border border-zinc-200"
                    >
                        Reset
                    </Button>
                )}

            </Space>
        </div>
    );
};

export default AddPageHeader;