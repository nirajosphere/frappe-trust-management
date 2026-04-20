export const roomFormFields = {
    title: "Room",
    fields: [
        {
            name: "room_number",
            label: "Room Number",
            type: "text",
            placeholder: "Enter Room Number",
            required: true,
            message: "Please enter the room number!"
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
            name: "room_type",
            label: "Room Type",
            type: "select",
            placeholder: "Select Room Type",
            required: true,
            options: [
                { label: "AC", value: "AC" },
                { label: "Non-AC", value: "Non-AC" },
                { label: "Hall", value: "Hall" }
            ]
        },
        {
            name: "capacity",
            label: "Capacity",
            type: "number",
            placeholder: "Enter Capacity"
        },
        {
            name: "price_per_day",
            label: "Price Per Day (₹)",
            type: "number",
            placeholder: "Enter Price Per Day",
            required: true
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            placeholder: "Select Status",
            options: [
                { label: "Available", value: "Available" },
                { label: "Occupied", value: "Occupied" },
                { label: "Maintenance", value: "Maintenance" }
            ]
        }
    ]
};
