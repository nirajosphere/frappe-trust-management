export const templeFormFields = {
    title: "Institution",
    fields: [
        {
            name: "temple_name",
            label: "Institution Name",
            type: "text",
            placeholder: "Enter Institution Name",
            required: true,
            message: "Please enter the institution name!"
        },
        {
            name: "temple_id",
            label: "Institution ID",
            type: "text",
            placeholder: "Enter Institution ID",
            required: true,
            message: "Please enter the institution ID!"
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
            label: "Institution Address",
            type: "textarea",
            placeholder: "Enter Institution Address",
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
