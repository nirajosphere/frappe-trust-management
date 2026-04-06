export const donationTypeFormFields = {
    title: "Donation Type",
    fields: [
        {
            name: "donation_type",
            label: "Donation Type",
            type: "text",
            placeholder: "Enter Donation type",
            required: true,
            message: "Please enter the donation type!"
        },
        {
            name: "donation_type_code",
            label: "Donation Type Code",
            type: "text",
            placeholder: "Enter Donation type code",
            required: true,
            message: "Please enter the donation type code!"
        },
        {
            name: "donation_image",
            label: "Donation Image",
            type: "image",
            required: true,
            message: "Please upload an image!"
        },
        {
            name: "temple",
            label: "Temple",
            type: "text",
            placeholder: "Select Temple",
        },
        {
            name: "default_amount",
            label: "Default Amount",
            type: "text",
            placeholder: "0.00",
        }
    ]
};
