import React from "react";

const ViewContainer = ({ className, children }) => {
  return (
    <div className={`min-h-screen py-6 ${className || ""}`}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {children}
      </div>
    </div>
  );
};

export default ViewContainer;
