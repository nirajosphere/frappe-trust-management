import { DOCTYPE_DONOR, DOCTYPE_TEMPLE, DOCTYPE_DONATION, DOCTYPE_DONATION_TYPE } from "./constants";

/**
 * Centralized form configuration for different Doctypes.
 * Each configuration defines:
 * - fields: Array of field settings (name, label, type, required, etc.)
 */
export const formConfigs = {
    [DOCTYPE_DONOR]: {
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
    },
    [DOCTYPE_TEMPLE]: {
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
    },
    [DOCTYPE_DONATION]: {
        title: "Donation",
        fields: [
            { name: "name", label: "Receipt Id", type: "text", readOnly: true },
            { name: "cashier", label: "Donation Receiver Name", type: "text", readOnly: true },
            { name: "temple", label: "Temple Name", type: "text", required: true },
            { name: "print_receipt_name", label: "Print Receipt Name", type: "text" },
            { name: "donor_name", label: "Donor Name", type: "text", required: true },
            { name: "email", label: "Email", type: "text" },
            { name: "address_line_1", label: "Address Line 1", type: "text" },
            { name: "address_line_2", label: "Address Line 2", type: "text" },
            { name: "country", label: "Country", type: "text" },
            { name: "state", label: "State", type: "text" },
            { name: "city", label: "City", type: "text" },
            { name: "pincode", label: "Pincode", type: "text" },
            { name: "contact_number", label: "Contact Number", type: "text" },
            { name: "native_place", label: "Native Place", type: "text" },
            { name: "date_of_birth", label: "Date of Birth", type: "text" },
            { name: "marital_status", label: "Marital Status", type: "text" },
            { name: "date_of_anniversary", label: "Date of Anniversary", type: "text" },
            { name: "note", label: "Note", type: "textarea" },
            { name: "payment_mode", label: "Payment Type", type: "text", required: true },
            { name: "total_amount", label: "Total Donation Amount", type: "text", required: true },
            { name: "device_name", label: "Device Name", type: "text" },
            { name: "transaction_ref_no", label: "Transaction Ref. No.", type: "text" },
        ]
    },
    [DOCTYPE_DONATION_TYPE]: {
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
    }
};

