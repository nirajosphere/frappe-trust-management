export const templeFormFields = {
    title: "Temple",
    fields: [
        {
            name: "temple_name",
            label: "Temple Name",
            type: "text",
            placeholder: "Enter Temple Name",
            required: true,
            message: "Please enter the temple name!"
        },
        {
            name: "temple_id",
            label: "Temple Id",
            type: "text",
            placeholder: "Enter Temple Id",
            required: true,
            message: "Please enter the temple ID!"
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
            label: "Temple Address",
            type: "textarea",
            placeholder: "Enter Temple Address",
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
