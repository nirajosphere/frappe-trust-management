import { DatePicker, theme } from "antd";

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
            // borderRadius: 8,
            // // boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            // headerBg: '#f8f9fa',      // Header ka background grey ho jaayega
            // headerBorderColor: 'transparent', // Header ke niche ki border gayab!

            // // Card level structural configurations
            // borderRadiusLG: 8,        // Border radius 8px
            // colorBorderSecondary: '#e5e7eb', // Card ki main border light grey
            // paddingSM: 12,


            borderRadiusLG: 8,
            headerBg: '#f4f4f5',
            headerHeight: 48,
            headerFontSize: 16,
            headerFontSizeSM: 14,

            colorBorderSecondary: '#e4e4e7',

            bodyPadding: 16,
            bodyPaddingSM: 12,
        },
        Button: {
            borderRadius: 6,
            controlHeight: 38,
            fontWeight: 600,
            colorPrimaryHover: "#000000",
            primaryShadow: "none"
        },
        Input: {
            borderRadius: 6,
            controlHeight: 38,
        },
        InputNumber: {
            borderRadius: 6,
            controlHeight: 38,
        },
        Select: {
            borderRadius: 6,
            controlHeight: 38,
            optionSelectedBg: "#18181b",
            optionSelectedColor: "#ffffff",
            optionActiveBg: "#f4f4f5",
            selectorBg: "#ffffff",
            activeBorderColor: "#18181b",
            hoverBorderColor: "#18181b",
        },
        Table: {
            borderRadius: 6,
        },
        DatePicker: {
            controlHeight: 38,
            borderRadius: 6,
        },
        Radio: {
            controlHeight: 38,
        },
        Alert: {
            paddingInlineSM: 24,
            paddingBlockSM: 12,
            fontSizeSM: 14,
            borderRadius: 6,
            colorText: "rgba(0, 0, 0, 0.85)",
            colorIcon: "rgba(0, 0, 0, 0.45)",
            colorTextHeading: "rgba(0, 0, 0, 1)",
            colorIconHover: "rgba(0, 0, 0, 0.6)",
            colorErrorBg: 'rgba(0, 0, 0, 0.05)',
            colorWarningBg: 'rgba(0, 0, 0, 0.05)',
            colorSuccessBg: 'rgba(0, 0, 0, 0.05)',
            colorInfoBg: 'rgba(0, 0, 0, 0.05)',
            colorErrorBorderColor: '#000',
            colorErrorIcon: '#000',
            colorErrorIconHover: '#000',
            colorErrorBg: '#000',
            colorErrorTextHeading: '#000',
            colorErrorText: '#000',
            colorWarningBorderColor: '#000',
            colorWarningIcon: '#000',
            colorWarningIconHover: '#000',
            colorWarningBg: '#000',
            colorWarningTextHeading: '#000',
            colorWarningText: '#000',
            colorSuccessBorderColor: '#000',
            colorSuccessIcon: '#000',
            colorSuccessIconHover: '#000',
            colorSuccessBg: '#000',
            colorSuccessTextHeading: '#000',
            colorSuccessText: '#000',
            colorInfoBorderColor: '#000',
            colorInfoIcon: '#000',
            colorInfoIconHover: '#000',
            colorInfoTextHeading: '#000',
            colorInfoText: '#000',
        },
    },
};



