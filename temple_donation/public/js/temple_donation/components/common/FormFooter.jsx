import React, { useState, useEffect, useRef } from "react";
import { Button } from "antd";
import { SaveOutlined } from "@ant-design/icons";

const FormFooter = ({
    onCancel,
    loading = false,
    isEdit = false,
    saveText,
    cancelText = "Cancel",
    onSubmit
}) => {
    const footerRef = useRef(null);
    const [bounds, setBounds] = useState(null);

    useEffect(() => {
        const updateBounds = () => {
            const pageContainer = document.querySelector(".donation-page > div") || document.querySelector(".aavatto-content-wrapper");
            if (pageContainer) {
                const rect = pageContainer.getBoundingClientRect();
                setBounds({
                    left: rect.left,
                    width: rect.width
                });
            }
        };

        updateBounds();

        // Observe size changes of the page container
        const pageContainer = document.querySelector(".donation-page > div") || document.querySelector(".aavatto-content-wrapper");
        let resizeObserver;
        if (pageContainer && typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(() => {
                updateBounds();
            });
            resizeObserver.observe(pageContainer);
        }

        window.addEventListener("resize", updateBounds);

        // A small timeout to capture late layout adjustments
        const timeout = setTimeout(updateBounds, 100);

        return () => {
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            window.removeEventListener("resize", updateBounds);
            clearTimeout(timeout);
        };
    }, []);

    const footerStyle = {
        position: "fixed",
        bottom: 0,
        left: bounds ? bounds.left : 0,
        width: bounds ? bounds.width : "100%",
        visibility: bounds ? "visible" : "hidden",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(228, 228, 231, 0.6)",
        paddingTop: "14px",
        paddingBottom: "14px",
        zIndex: 9999,
        boxShadow: "0 -4px 16px -6px rgba(0, 0, 0, 0.08)",
        transition: "opacity 0.15s ease-in-out"
    };

    const innerStyle = {
        width: "100%",
        display: "flex",
        justifyContent: "flex-end",
        gap: "12px"
    };

    const cancelButtonStyle = {
        height: "40px",
        paddingLeft: "24px",
        paddingRight: "24px",
        fontWeight: 500,
        color: "#52525b", // zinc-600
        borderColor: "#e4e4e7", // zinc-200
        borderRadius: "8px"
    };

    const saveButtonStyle = {
        height: "40px",
        paddingLeft: "24px",
        paddingRight: "24px",
        fontWeight: 500,
        backgroundColor: "#18181b", // zinc-900
        borderColor: "#18181b",
        color: "#ffffff",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
    };

    return (
        <div ref={footerRef} style={footerStyle}>
            <div style={innerStyle}>
                <Button 
                    onClick={onCancel} 
                    style={cancelButtonStyle}
                >
                    {cancelText}
                </Button>
                <Button
                    type="primary"
                    htmlType={onSubmit ? "button" : "submit"}
                    onClick={onSubmit}
                    loading={loading}
                    icon={<SaveOutlined />}
                    style={saveButtonStyle}
                >
                    {saveText || (isEdit ? "Update" : "Save")}
                </Button>
            </div>
        </div>
    );
};

export default FormFooter;
