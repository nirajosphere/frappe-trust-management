export const themeConfig = {
    token: {
        colorPrimary: "#4f46e5", // Indigo-600
        borderRadius: 12,
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    },
    components: {
        Layout: {
            siderBg: "#ffffff",
            headerBg: "#ffffff",
            bodyBg: "#f9fafb",
        },
        Menu: {
            itemSelectedBg: "#f3f4f6",
            itemSelectedColor: "#4f46e5",
            itemBorderRadius: 10,
            itemMarginInline: 8,
        },
        Card: {
            borderRadiusLG: 16,
        },
        Button: {
            borderRadius: 8,
            controlHeight: 40,
        },
    },
};
