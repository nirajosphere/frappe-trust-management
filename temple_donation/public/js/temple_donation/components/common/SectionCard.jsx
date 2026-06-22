import React from "react";
import { Card, Space } from "antd";

const SectionCard = ({ title, icon, right, children }) => {
  return (
    <Card
      title={
        title && (
          <Space size={6}>
            {icon}
            <span style={{ color: '#1f2937', fontSize: '14px', fontWeight: 600 }}>{title}</span>
          </Space>
        )
      }
      extra={right}
      size="small"
      style={{ boxShadow: 'none' }}
    >
      {children}
    </Card>
  );
};

export default SectionCard;
