export const roomBookingFormFields = {
    title: "Room Booking",
    fields: [
        {
            name: "donor",
            label: "Donor",
            type: "link",
            placeholder: "Select Donor",
            doctype: "Donor",
            required: true
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
            name: "room",
            label: "Room",
            type: "link",
            placeholder: "Select Room",
            doctype: "Room",
            required: true
        },
        {
            name: "check_in",
            label: "Check-in Date/Time",
            type: "datetime",
            placeholder: "Select check-in time"
        },
        {
            name: "check_out",
            label: "Check-out Date/Time",
            type: "datetime",
            placeholder: "Select check-out time"
        },
        {
            name: "total_amount",
            label: "Total Amount (₹)",
            type: "number",
            placeholder: "Enter total amount",
            required: true
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            placeholder: "Select Status",
            options: [
                { label: "Booked", value: "Booked" },
                { label: "Checked In", value: "Checked In" },
                { label: "Checked Out", value: "Checked Out" },
                { label: "Cancelled", value: "Cancelled" }
            ]
        }
    ]
};
