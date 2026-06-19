import React from "react";

const ViewContainer = ({ className, children }) => {
  return (
    <div className={`min-h-screen py-6 bg-[#f8f9fa] ${className || ""}`} style={{ padding: '24px 40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {children}
      </div>
    </div>
  );
};

export default ViewContainer;
