export const roomTypeFormFields = {
    fields: [
        {
            name: "room_type_name",
            label: "Category Name",
            type: "data",
            required: true,
            placeholder: "e.g. AC, Non AC, Deluxe",
            message: "Category name is required"
        },
        {
            name: "default_capacity",
            label: "Default Capacity",
            type: "number",
            required: true,
            placeholder: "2",
            message: "Default capacity is required"
        },
        {
            name: "default_price_per_day",
            label: "Default Price Per Day (₹)",
            type: "number",
            required: true,
            placeholder: "0.00",
            message: "Default price is required"
        },
        {
            name: "active",
            label: "Active",
            type: "select",
            required: true,
            placeholder: "Select status",
            options: [
                { label: "Active", value: 1 },
                { label: "Inactive", value: 0 }
            ],
            message: "Status is required"
        },
        {
            name: "description",
            label: "Description",
            type: "text",
            required: false,
            placeholder: "Enter details about the room category",
            message: ""
        }
    ]
};
