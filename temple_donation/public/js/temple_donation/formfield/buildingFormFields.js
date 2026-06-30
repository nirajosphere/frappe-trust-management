export const buildingFormFields = {
    fields: [
        {
            name: "building_name",
            label: "Building Name",
            type: "data",
            required: true,
            placeholder: "Enter building name",
            message: "Building name is required"
        },
        {
            name: "building_code",
            label: "Building Code",
            type: "data",
            required: true,
            placeholder: "e.g. BLD001",
            message: "Building code is required"
        },
        {
            name: "temple",
            label: "Trust",
            type: "link",
            doctype: "Temple",
            required: true,
            placeholder: "Select Trust",
            message: "Trust is required"
        },
        {
            name: "total_floors",
            label: "Total Floors",
            type: "number",
            required: false,
            placeholder: "1",
            message: ""
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            placeholder: "Select status",
            options: [
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" }
            ],
            message: "Status is required"
        },
        {
            name: "description",
            label: "Description",
            type: "text",
            required: false,
            placeholder: "Enter description details",
            message: ""
        }
    ]
};
