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
    },

    "temple admin": {
        color: "geekblue",
    },

    manager: {
        color: "green",
    },

    cashier: {
        color: "cyan",
    },

    active: {
        color: "lime",
    },

    inactive: {
        color: "volcano",
    },

    default: {
        color: "default",
    },
};

export const getTagConfig = (value = "") => {
    const key = String(value).toLowerCase();

    console.log(key, 'key');

    const matchedKey =
        Object.keys(TAG_CONFIG)
            .sort((a, b) => b.length - a.length)
            .find((item) => key.includes(item)) || "default";

    return {
        ...TAG_CONFIG[matchedKey],
        label: value || "Standard",
    };
};