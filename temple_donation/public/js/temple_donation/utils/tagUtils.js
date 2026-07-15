// export const TAG_CONFIG = {
//     "super admin": {
//         color: "red",
//         variant: "solid",
//     },

//     "temple admin": {
//         color: "blue",
//         variant: "solid",
//     },

//     manager: {
//         color: "green",
//         variant: "solid",
//     },

//     cashier: {
//         color: "cyan",
//         variant: "solid",
//     },

//     active: {
//         color: "success",
//         variant: "solid",
//     },

//     inactive: {
//         color: "error",
//         variant: "solid",
//     },

//     default: {
//         color: "default",
//         variant: "solid",
//     },
// };

// export const getTagConfig = (value = "") => {
//     const key = String(value).toLowerCase();

//     const matchedKey =
//         Object.keys(TAG_CONFIG).find((item) =>
//             key.includes(item)
//         ) || "default";

//     return {
//         ...TAG_CONFIG[matchedKey],
//         label: value || "Standard",
//     };
// };

export const TAG_CONFIG = {
    "super admin": {
        color: "magenta",
        glassClass: "tag-glass-magenta"
    },

    "trust admin": {
        color: "geekblue",
        glassClass: "tag-glass-geekblue"
    },

    manager: {
        color: "green",
        glassClass: "tag-glass-green"
    },

    cashier: {
        color: "cyan",
        glassClass: "tag-glass-cyan"
    },

    active: {
        color: "lime",
        glassClass: "tag-glass-green"
    },

    inactive: {
        color: "volcano",
        glassClass: "tag-glass-volcano"
    },

    default: {
        color: "default",
        glassClass: "tag-glass-gray"
    },
};

export const getTagConfig = (value = "") => {
    const key = String(value).toLowerCase();

    const matchedKey =
        Object.keys(TAG_CONFIG)
            .sort((a, b) => b.length - a.length)
            .find((item) => key.includes(item)) || "default";

    return {
        ...TAG_CONFIG[matchedKey],
        label: value || "Standard",
    };
};