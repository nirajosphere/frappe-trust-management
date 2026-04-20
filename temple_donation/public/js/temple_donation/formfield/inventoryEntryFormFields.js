export const inventoryEntryFormFields = {
    title: "Inventory Entry",
    fields: [
        {
            name: "entry_type",
            label: "Entry Type",
            type: "select",
            placeholder: "Select Entry Type",
            required: true,
            options: [
                { label: "IN", value: "IN" },
                { label: "OUT", value: "OUT" }
            ]
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
            name: "posting_date",
            label: "Posting Date",
            type: "datetime",
            placeholder: "Select date and time"
        },
        {
            name: "reference_type",
            label: "Reference Type",
            type: "select",
            placeholder: "Select Reference Type",
            options: [
                { label: "Donation", value: "Donation" },
                { label: "Manual", value: "Manual" },
                { label: "Purchase", value: "Purchase" },
                { label: "Usage", value: "Usage" }
            ]
        },
        {
            name: "reference_name",
            label: "Reference Name",
            type: "text",
            placeholder: "Enter Reference ID"
        }
    ]
};
