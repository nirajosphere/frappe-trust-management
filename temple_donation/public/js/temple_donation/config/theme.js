import { theme } from "antd";

export const themeConfig = {
    algorithm: theme.defaultAlgorithm,
    token: {
        colorPrimary: "#18181b", // Monochrome Premium Black
        colorSuccess: "#10b981",
        colorWarning: "#faad14",
        colorError: "#ef4444",
        colorInfo: "#18181b",
        colorLink: "#18181b",
        borderRadius: 8,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        fontSize: 15,
        wireframe: false,
        colorBgContainer: "#ffffff",
        colorBgLayout: "#ffffff",
        controlOutline: "transparent",
    },
    components: {
        Layout: {
            headerBg: "#ffffff",
            headerPadding: "0 24px",
            headerHeight: 70,
            bodyBg: "#ffffff",
        },
        Menu: {
            itemBg: "transparent",
            itemSelectedBg: "rgba(24, 24, 27, 0.05)",
            itemSelectedColor: "#000000",
            itemBorderRadius: 8,
            itemMarginInline: 4,
            horizontalItemHoverColor: "#18181b",
        },
        Card: {
            borderRadiusLG: 8,
            borderRadius: 8,
            // boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        },
        Button: {
            borderRadius: 8,
            controlHeight: 40,
            fontWeight: 600,
            colorPrimaryHover: "#000000",
            primaryShadow: "none"
        },
        Input: {
            borderRadius: 8,
            controlHeight: 40,
        },
        Select: {
            borderRadius: 8,
            controlHeight: 40,
            optionSelectedBg: "#18181b",
            optionSelectedColor: "#ffffff",
            optionActiveBg: "#f4f4f5",
            selectorBg: "#ffffff",
            activeBorderColor: "#18181b",
            hoverBorderColor: "#18181b",
        },
        Table: {
            borderRadius: 8,

        },
    },
};



