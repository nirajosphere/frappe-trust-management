export const itemFormFields = {
    title: "Item",
    fields: [
        {
            name: "item_name",
            label: "Item Name",
            type: "text",
            placeholder: "Enter Item Name",
            required: true,
            message: "Please enter the item name!"
        },
        {
            name: "item_code",
            label: "Item Code",
            type: "text",
            placeholder: "Enter Item Code"
        },
        {
            name: "unit",
            label: "Unit",
            type: "select",
            placeholder: "Select Unit",
            required: true,
            options: [
                { label: "Nos", value: "Nos" },
                { label: "Kg", value: "Kg" },
                { label: "Litre", value: "Litre" }
            ]
        },
        {
            name: "temple",
            label: "Temple",
            type: "link",
            placeholder: "Select Temple",
            doctype: "Temple",
            required: true
        }
    ]
};
