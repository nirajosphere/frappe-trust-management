export const templeFormFields = {
    title: "Trust",
    fields: [
        {
            name: "temple_name",
            label: "Trust Name",
            type: "text",
            placeholder: "Enter Trust Name",
            required: true,
            message: "Please enter the trust name!"
        },
        {
            name: "temple_id",
            label: "Trust ID",
            type: "text",
            placeholder: "Enter Trust ID",
            required: true,
            message: "Please enter the trust ID!"
        },
        {
            name: "trust_registration_no",
            label: "Trust Registration No.",
            type: "text",
            placeholder: "Enter Trust Registration Number",
            required: true
        },
        {
            name: "temple_address",
            label: "Trust Address",
            type: "textarea",
            placeholder: "Enter Trust Address",
            required: true,
            rows: 2
        },
        {
            name: "country",
            label: "Country",
            type: "text",
            placeholder: "India",
            defaultValue: "India"
        },
        {
            name: "state",
            label: "State",
            type: "text",
            placeholder: "Gujarat",
            defaultValue: "Gujarat",
            required: true
        },
        {
            name: "city",
            label: "City",
            type: "text",
            placeholder: "Enter City",
            required: true
        },
        {
            name: "pincode",
            label: "Pincode",
            type: "text",
            placeholder: "Enter Pincode",
            required: true
        },
        {
            name: "note",
            label: "Note",
            type: "textarea",
            placeholder: "Add Note",
            rows: 2
        }
    ]
};
