export const storeLocationFormFields = {
    title: "Store Location",
    fields: [
        {
            name: "location_name",
            label: "Location Name",
            type: "text",
            placeholder: "Enter Location Name",
            required: true,
            message: "Please enter the location name!"
        },
        {
            name: "temple",
            label: "Trust Name",
            type: "link",
            placeholder: "Select Trust Name",
            doctype: "Temple",
            required: true
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Enter Location Description"
        }
    ]
};
