import React from "react";
import { Card, List, Button, Tooltip, Space, Typography, Badge } from "antd";
import { CopyOutlined } from "@ant-design/icons";

const { Text } = Typography;

const DynamicVariableAssistant = ({ variablesList, copyToClipboard }) => {
    return (
        <Card
            title={<span><CopyOutlined /> Dynamic Variable Assistant</span>}
            bordered={false}
            className="shadow-sm"
            bodyStyle={{ padding: "0 16px 16px" }}
        >
            <div style={{ height: "230px", overflowY: "auto", marginTop: "8px" }}>
                <List
                    size="small"
                    dataSource={variablesList}
                    renderItem={item => (
                        <List.Item
                            actions={[
                                <Tooltip title="Copy placeholder" key="copy">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<CopyOutlined />}
                                        onClick={() => copyToClipboard(item.name)}
                                    />
                                </Tooltip>
                            ]}
                            style={{ padding: "6px 0" }}
                        >
                            <List.Item.Meta
                                title={
                                    <Space>
                                        <Text code style={{ cursor: "pointer", fontSize: "12px" }} onClick={() => copyToClipboard(item.name)}>
                                            {item.name}
                                        </Text>
                                        <Badge count={item.cat} style={{ backgroundColor: "#71717a", fontSize: "10px" }} />
                                    </Space>
                                }
                                description={<span style={{ fontSize: "11px" }}>{item.desc}</span>}
                            />
                        </List.Item>
                    )}
                />
            </div>
        </Card>
    );
};

export default DynamicVariableAssistant;
