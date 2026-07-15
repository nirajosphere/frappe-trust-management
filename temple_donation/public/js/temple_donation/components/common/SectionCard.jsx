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
      style={{ borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: 'none' }}
      headStyle={{ borderBottom: '1px solid #f3f4f6', padding: '12px 16px', background: '#f9fafb' }}
      bodyStyle={{ padding: '16px' }}
    >
      {children}
    </Card>
  );
};

export default SectionCard;


// import React from "react";
// import { Card, Space } from "antd";

// const SectionCard = ({ title, icon, right, children }) => {
//   return (
//     <Card
//       title={
//         title && (
//           <Space size={6}>
//             {icon}
//             <span style={{ color: '#1f2937', fontSize: '14px', fontWeight: 600 }}>{title}</span>
//           </Space>
//         )
//       }
//       extra={right}
//       size="small"
//       style={{ boxShadow: 'none' }}
//     >
//       {children}
//     </Card>
//   );
// };

// export default SectionCard;
