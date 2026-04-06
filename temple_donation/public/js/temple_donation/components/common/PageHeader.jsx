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
        <div
            className="aavatto-page-header"
            style={{
                // padding: '0 24px', 
                marginBottom: '24px',
                background: 'transparent'
            }}
        >
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
                <Col flex="auto">
                    <Space size="middle" align="start">
                        {showBack && (
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={onBack}
                                shape="circle"
                                style={{ marginTop: '4px' }}
                            />
                        )}
                        <div>
                            <Title level={2} style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.025em' }}>
                                {title}
                            </Title>
                            {description && <Text type="secondary">{description}</Text>}
                        </div>
                    </Space>
                </Col>
                <Col>
                    <Space size="middle">
                        {onExport && (
                            <Button
                                icon={<ExportOutlined />}
                                onClick={onExport}
                                style={{ height: '40px', borderRadius: '8px', fontWeight: 500 }}
                            >
                                Export
                            </Button>
                        )}
                        {onAdd && (
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={onAdd}
                                style={{
                                    height: '40px',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 6px -1px rgb(79 70 229 / 0.2)'
                                }}
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
