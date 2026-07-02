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
            name: "item_category",
            label: "Category",
            type: "link",
            placeholder: "Select Category",
            doctype: "Item Category",
            required: true
        },
        {
            name: "store_location",
            label: "Store Location",
            type: "link",
            placeholder: "Select Store Location",
            doctype: "Store Location"
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
                { label: "Litre", value: "Litre" },
                { label: "Bag", value: "Bag" },
                { label: "Bottle", value: "Bottle" },
                { label: "Box", value: "Box" },
                { label: "Pack", value: "Pack" },
                { label: "Piece", value: "Piece" },
                { label: "Can", value: "Can" },
                { label: "Book", value: "Book" },
                { label: "Gram", value: "Gram" },
                { label: "Meter", value: "Meter" }
            ]
        },
        {
            name: "temple",
            label: "Temple",
            type: "link",
            placeholder: "Select Temple",
            doctype: "Temple",
            required: true
        },
        {
            name: "valuation_rate",
            label: "Valuation Rate (₹)",
            type: "number",
            placeholder: "0.00",
            min: 0
        },
        {
            name: "minimum_stock",
            label: "Minimum Stock",
            type: "number",
            placeholder: "0",
            min: 0
        },
        {
            name: "maximum_stock",
            label: "Maximum Stock",
            type: "number",
            placeholder: "0",
            min: 0
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Enter description"
        }
    ]
};
