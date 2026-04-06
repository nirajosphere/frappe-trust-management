export const donorFormFields = {
    title: "Donor",
    fields: [
        {
            name: "mobile_number",
            label: "Contact No",
            type: "text",
            placeholder: "Enter Contact Number",
            required: true,
            message: "Please enter contact number!",
            pattern: /^\d{10}$/,
            patternMessage: "Please enter a valid 10-digit number!"
        },
        {
            name: "donor_name",
            label: "Full Name",
            type: "text",
            placeholder: "Enter Donor Name",
            required: true,
            message: "Please enter the donor's full name!"
        },
        {
            name: "email",
            label: "Email Address",
            type: "text",
            placeholder: "Enter Email"
        },
        {
            name: "address",
            label: "Address Line 1",
            type: "text",
            placeholder: "Enter Address"
        },
        {
            name: "address_line_2",
            label: "Address Line 2",
            type: "text",
            placeholder: "Enter Address"
        },
        {
            name: "pan_card",
            label: "Pan Card",
            type: "text",
            placeholder: "Enter Pan Card Number",
            pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
            patternMessage: "Please enter a valid PAN (e.g. ABCDE1234F)"
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
            placeholder: "Enter Pincode"
        },
        {
            name: "native_place",
            label: "Native Place",
            type: "text",
            placeholder: "Enter Native Place"
        },
        {
            name: "date_of_birth",
            label: "Date of Birth",
            type: "text",
            placeholder: "DD-MM-YYYY"
        },
        {
            name: "marital_status",
            label: "Marital Status",
            type: "select",
            options: ["Unmarried", "Married"],
            defaultValue: "Unmarried"
        },
        {
            name: "anniversary_date",
            label: "Date of Anniversary",
            type: "text",
            placeholder: "DD-MM-YYYY"
        }
    ]
};
