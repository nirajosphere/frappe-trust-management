export const roomBookingFormFields = {
    title: "Room Booking",
    fields: [
        {
            name: "guest_name",
            label: "Guest Name",
            type: "text",
            placeholder: "Enter guest name",
            required: true
        },
        {
            name: "guest_id",
            label: "Guest ID (Aadhaar/PAN/Passport)",
            type: "text",
            placeholder: "Enter guest ID"
        },
        {
            name: "donor",
            label: "Donor",
            type: "link",
            placeholder: "Select Donor (optional)",
            doctype: "Donor",
            required: false
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
            label: "Check-in Date & Time",
            type: "datetime",
            placeholder: "Select check-in time",
            required: true
        },
        {
            name: "check_out",
            label: "Check-out Date & Time",
            type: "datetime",
            placeholder: "Select check-out time",
            required: true
        },
        {
            name: "number_of_guests",
            label: "Number of Guests",
            type: "number",
            placeholder: "1"
        },
        {
            name: "total_amount",
            label: "Total Amount (₹)",
            type: "number",
            placeholder: "Enter total amount"
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            placeholder: "Select Status",
            options: [
                { label: "Reserved", value: "Reserved" },
                { label: "Checked In", value: "Checked In" },
                { label: "Checked Out", value: "Checked Out" },
                { label: "Cancelled", value: "Cancelled" }
            ]
        },
        {
            name: "remarks",
            label: "Remarks",
            type: "textarea",
            placeholder: "Any special notes or instructions"
        }
    ]
};
