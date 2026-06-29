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
            name: "building",
            label: "Building",
            type: "link",
            placeholder: "Select Building",
            doctype: "Building"
        },
        {
            name: "floor_number",
            label: "Floor Number",
            type: "number",
            placeholder: "Enter Floor Number"
        },
        {
            name: "room_type",
            label: "Room Category",
            type: "link",
            placeholder: "Select Room Category",
            doctype: "Room Type",
            required: true
        },
        {
            name: "capacity",
            label: "Capacity (Pax)",
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
                { label: "Reserved", value: "Reserved" },
                { label: "Occupied", value: "Occupied" },
                { label: "Cleaning", value: "Cleaning" },
                { label: "Maintenance", value: "Maintenance" }
            ]
        },
        {
            name: "description",
            label: "Description",
            type: "text",
            placeholder: "Enter Description"
        },
        {
            name: "notes",
            label: "Notes",
            type: "text",
            placeholder: "Enter Notes"
        }
    ]
};
