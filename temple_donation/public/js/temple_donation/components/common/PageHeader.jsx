import React from "react";
import { Row, Col, Typography, Space, Button, Divider } from "antd";
import { ExportOutlined, PlusOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

/**
 * PageHeader Component
 * A common header for all listing and detail pages.
 */
const PageHeader = ({
    title,
    description,
    onAdd,
    onExport,
    addLabel = "Add New Record",
    showBack = false,
    onBack,
    extra
}) => {
    return (
        <div className="mb-10 animate-fadeIn">
            <Row justify="space-between" align="middle" gutter={[24, 24]}>
                <Col flex="auto">
                    <Space size="large" align="start">
                        {showBack && (
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={onBack}
                                shape="circle"
                                className="h-10 w-10 flex items-center justify-center shadow-md border-none bg-white text-zinc-900 hover:scale-110 transition-transform mt-1"
                            />
                        )}
                        <div>
                            <Title level={2} className="!m-0 font-black tracking-tight text-zinc-900 lg:text-3xl">
                                {title}
                            </Title>
                            {description && (
                                <Text className="text-zinc-500 font-medium text-base mt-2 block italic">
                                    {description}
                                </Text>
                            )}
                        </div>
                    </Space>
                </Col>
                <Col>
                    <Space size="middle">
                        {onExport && (
                            <Button
                                icon={<ExportOutlined />}
                                onClick={onExport}
                                className="h-11 px-6 font-semibold border-zinc-200 bg-white hover:border-black text-zinc-600"
                            >
                                Export Data
                            </Button>
                        )}
                        {onAdd && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={onAdd}
                                className="h-11 px-8  font-bold bg-black hover:bg-zinc-800 border-none shadow-lg shadow-zinc-900/10 flex items-center gap-2"
                            >
                                {addLabel}
                            </Button>
                        )}
                        {extra}
                    </Space>
                </Col>
            </Row>

        </div>
    );
};


export default PageHeader;
