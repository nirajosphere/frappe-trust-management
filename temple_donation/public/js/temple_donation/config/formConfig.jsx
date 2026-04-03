import { DOCTYPE_DONOR, DOCTYPE_TEMPLE } from "./constants";

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
                name: "donor_name",
                label: "Full Name",
                type: "text",
                placeholder: "Enter donor's full name",
                required: true,
                message: "Please enter the donor's full name!"
            },
            {
                name: "mobile_number",
                label: "Mobile Number",
                type: "text",
                placeholder: "9876543210",
                required: true,
                message: "Please enter the mobile number!",
                pattern: /^\d{10}$/,
                patternMessage: "Please enter a valid 10-digit number!"
            },
            {
                name: "address",
                label: "Address (Optional)",
                type: "textarea",
                placeholder: "Enter full address",
                rows: 3
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
                placeholder: "Enter temple name",
                required: true,
                message: "Please enter the temple name!"
            },
            {
                name: "city",
                label: "City",
                type: "text",
                placeholder: "e.g. Ahmedabad"
            },
            {
                name: "state",
                label: "State",
                type: "text",
                placeholder: "e.g. Gujarat"
            },
            {
                name: "trust_registration_no",
                label: "Trust Registration No",
                type: "text",
                placeholder: "Reg No."
            },
            {
                name: "pincode",
                label: "Pincode",
                type: "text",
                placeholder: "e.g. 380001"
            },
            {
                name: "temple_address",
                label: "Temple Address",
                type: "textarea",
                placeholder: "Enter full temple address",
                rows: 3
            },
            {
                name: "note",
                label: "Note",
                type: "textarea",
                placeholder: "Additional notes...",
                rows: 2
            }
        ]
    }
};
