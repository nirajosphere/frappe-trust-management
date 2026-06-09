import React from "react";
import { Spin } from "antd";

const PageLoader = ({ minHeight = "90vh", size = "medium", className = "" }) => {
    return (
        <div className={`flex justify-center items-center min-h-[${minHeight}] ${className}`}>
            <Spin size={size} />
        </div>
    );
};

export default PageLoader;
