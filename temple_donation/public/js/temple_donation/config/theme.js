// import { DatePicker, theme } from "antd";

// export const themeConfig = {
//     algorithm: theme.defaultAlgorithm,
//     token: {
//         colorPrimary: "#18181b", // Monochrome Premium Black
//         colorSuccess: "#10b981",
//         colorWarning: "#faad14",
//         colorError: "#ef4444",
//         colorInfo: "#18181b",
//         colorLink: "#18181b",
//         borderRadius: 8,
//         fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
//         fontSize: 15,
//         wireframe: false,
//         colorBgContainer: "#ffffff",
//         colorBgLayout: "#ffffff",
//         controlOutline: "transparent",
//     },
//     components: {
//         Layout: {
//             headerBg: "#ffffff",
//             headerPadding: "0 24px",
//             headerHeight: 70,
//             bodyBg: "#ffffff",
//         },
//         Menu: {
//             itemBg: "transparent",
//             itemSelectedBg: "rgba(24, 24, 27, 0.05)",
//             itemSelectedColor: "#000000",
//             itemBorderRadius: 8,
//             itemMarginInline: 4,
//             horizontalItemHoverColor: "#18181b",
//         },
//         Card: {
//             // borderRadius: 8,
//             // // boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
//             // headerBg: '#f8f9fa',      // Header ka background grey ho jaayega
//             // headerBorderColor: 'transparent', // Header ke niche ki border gayab!

//             // // Card level structural configurations
//             // borderRadiusLG: 8,        // Border radius 8px
//             // colorBorderSecondary: '#e5e7eb', // Card ki main border light grey
//             // paddingSM: 12,


//             borderRadiusLG: 8,
//             headerBg: '#f4f4f5',
//             headerHeight: 48,
//             headerFontSize: 16,
//             headerFontSizeSM: 14,

//             colorBorderSecondary: '#e4e4e7',

//             bodyPadding: 16,
//             bodyPaddingSM: 12,
//         },
//         // Button: {
//         //     borderRadius: 6,
//         //     controlHeight: 38,
//         //     fontWeight: 600,
//         //     colorPrimaryHover: "#000000",
//         //     primaryShadow: "none"
//         // },
//         Button: {
//             borderRadius: 6,
//             controlHeight: 38,
//             controlHeightSM: 32,

//             fontWeight: 600,

//             primaryShadow: "none",

//             defaultBorderColor: "#d4d4d8",
//             defaultColor: "#27272a",
//             defaultHoverBorderColor: "#18181b",
//             defaultHoverColor: "#18181b",

//             colorPrimary: "#18181b",
//             colorPrimaryHover: "#27272a",
//             colorPrimaryActive: "#09090b",

//             dangerColor: "#dc2626",
//             colorError: "#dc2626",
//             colorErrorHover: "#b91c1c",
//             colorErrorActive: "#991b1b",
//         },
//         Input: {
//             borderRadius: 6,
//             controlHeight: 38,
//         },
//         InputNumber: {
//             borderRadius: 6,
//             controlHeight: 38,
//         },
//         Select: {
//             borderRadius: 6,
//             controlHeight: 38,
//             optionSelectedBg: "#18181b",
//             optionSelectedColor: "#ffffff",
//             optionActiveBg: "#f4f4f5",
//             selectorBg: "#ffffff",
//             activeBorderColor: "#18181b",
//             hoverBorderColor: "#18181b",
//         },
//         Table: {
//             borderRadius: 6,
//         },
//         DatePicker: {
//             controlHeight: 38,
//             borderRadius: 6,
//         },
//         Radio: {
//             controlHeight: 38,
//         },
//         // Alert: {
//         //     paddingInlineSM: 24,
//         //     paddingBlockSM: 12,
//         //     fontSizeSM: 14,
//         //     borderRadius: 6,

//         //     colorText: "rgba(0, 0, 0, 0.85)",
//         //     colorTextHeading: "rgba(0, 0, 0, 1)",
//         //     colorIcon: "rgba(0, 0, 0, 0.45)",
//         //     colorIconHover: "rgba(0, 0, 0, 0.6)",
//         // },
//         Alert: {
//             defaultPadding: 16,
//             withDescriptionPadding: "16px 20px",
//             borderRadiusLG: 10,

//             fontSize: 14,
//             fontSizeLG: 15,
//             lineHeight: 1.6,

//             colorText: "#334155",
//             colorTextHeading: "#0f172a",

//             colorIcon: "#1677ff",
//             colorIconHover: "#0958d9",

//             colorInfoBg: "#f6fbff",
//             colorInfoBorder: "#d6e4ff",

//             colorSuccessBg: "#f6ffed",
//             colorSuccessBorder: "#b7eb8f",

//             colorWarningBg: "#fffbe6",
//             colorWarningBorder: "#ffe58f",

//             colorErrorBg: "#fff2f0",
//             colorErrorBorder: "#ffccc7",
//         },
//     },
// };



import { theme } from "antd";

export const themeConfig = {
    algorithm: theme.defaultAlgorithm,

    token: {
        colorPrimary: "#18181b",
        colorSuccess: "#10b981",
        colorWarning: "#f59e0b",
        colorError: "#dc2626",
        colorInfo: "#18181b",
        colorLink: "#18181b",

        borderRadius: 8,

        fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",

        fontSize: 15,

        wireframe: false,

        colorBgLayout: "#ffffff",
        colorBgContainer: "#ffffff",

        colorBorder: "#e4e4e7",
        colorBorderSecondary: "#f1f5f9",

        controlOutline: "transparent",

        // Alert Colors
        colorInfoBg: "#f8fafc",
        colorInfoBorder: "#dbeafe",

        colorSuccessBg: "#f0fdf4",
        colorWarningBg: "#fffbeb",
        colorErrorBg: "#fef2f2",
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
            itemSelectedBg: "rgba(24,24,27,.06)",
            itemSelectedColor: "#18181b",
            itemBorderRadius: 8,
            itemMarginInline: 4,
            horizontalItemHoverColor: "#18181b",
        },

        Card: {
            borderRadiusLG: 10,

            headerBg: "#fafafa",
            headerHeight: 52,

            headerFontSize: 16,
            headerFontSizeSM: 15,
            headerFontWeight: 600,

            colorBorderSecondary: "#e4e4e7",

            bodyPadding: 20,
            bodyPaddingSM: 16,
        },

        Button: {
            borderRadius: 8,

            controlHeight: 38,
            controlHeightSM: 32,

            fontWeight: 600,

            primaryShadow: "none",

            defaultBg: "#ffffff",
            defaultBorderColor: "#d4d4d8",
            defaultColor: "#27272a",

            defaultHoverBg: "#fafafa",
            defaultHoverBorderColor: "#18181b",
            defaultHoverColor: "#18181b",

            colorPrimary: "#18181b",
            colorPrimaryHover: "#27272a",
            colorPrimaryActive: "#09090b",

            // dangerColor: "#dc2626",
            colorError: "#dc2626",
            colorErrorHover: "#b91c1c",
            colorErrorActive: "#991b1b",
        },

        Input: {
            borderRadius: 8,
            controlHeight: 38,
        },

        InputNumber: {
            borderRadius: 8,
            controlHeight: 38,
        },

        Select: {
            borderRadius: 8,
            controlHeight: 38,

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

        DatePicker: {
            borderRadius: 8,
            controlHeight: 38,
        },

        Radio: {
            controlHeight: 38,
        },

        Alert: {
            borderRadiusLG: 8,
        },
        Checkbox: {
            borderRadiusSM: 4,
        },
    },
};