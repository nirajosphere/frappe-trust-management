import React from "react";
import { Card, Button, Typography } from "antd";
import { EyeOutlined, InfoCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

const LiveSandboxPreview = ({ getPreviewHtml, onFullscreen }) => {
    return (
        <Card
            title={<span><EyeOutlined /> Live Sandbox Preview</span>}
            extra={
                <Button
                    type="primary"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={onFullscreen}
                >
                    Fullscreen Preview
                </Button>
            }
            bordered={false}
            className="shadow-sm"
            bodyStyle={{ padding: "12px", background: "#e4e4e7", borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px" }}
        >
            <div style={{ border: "1px solid #d4d4d8", borderRadius: "6px", background: "#f4f4f5", overflow: "hidden" }}>
                <iframe
                    title="Live Output Sandbox"
                    srcDoc={getPreviewHtml()}
                    style={{
                        width: "100%",
                        height: "460px",
                        border: "none"
                    }}
                />
            </div>
            <div style={{ marginTop: "8px", textAlign: "center" }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                    <InfoCircleOutlined /> Live preview replaces standard template tags with mock data dynamically.
                </Text>
            </div>
        </Card>
    );
};

export default LiveSandboxPreview;
