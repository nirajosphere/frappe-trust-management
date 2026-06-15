import React from "react";
import TempleFlagLoader from "./TempleFlagLoader";

const PageLoader = ({ minHeight = "90vh", size = "medium", className = "", text = "", subtext = "" }) => {
    const flagSize = size === "large" ? "large" : size === "small" ? "small" : "medium";
    
    return (
        <div className={`flex justify-center items-center ${className}`} style={{ minHeight: minHeight, width: '100%' }}>
            <TempleFlagLoader fullScreen={false} size={flagSize} text={text} subtext={subtext} />
        </div>
    );
};

export default PageLoader;
