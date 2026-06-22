export const userFormFields = {
    title: "User",
    fields: [
        {
            name: "email",
            label: "Email Address",
            type: "text",
            placeholder: "Enter Email Address",
            required: true,
            message: "Please enter email address!",
            pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            patternMessage: "Please enter a valid email address!"
        },
        {
            name: "first_name",
            label: "First Name",
            type: "text",
            placeholder: "Enter First Name",
            required: true,
            message: "Please enter first name!"
        },
        {
            name: "last_name",
            label: "Last Name",
            type: "text",
            placeholder: "Enter Last Name",
        },
        {
            name: "custom_test",
            label: "Contact Number",
            type: "text",
            placeholder: "Enter Contact Number",
            required: true,
            message: "Please enter contact number!",
            pattern: /^\d{10}$/,
            patternMessage: "Please enter a valid 10-digit number!"
        },
        // {
        //     name: "new_password",
        //     label: "Password",
        //     type: "password",
        //     placeholder: "Enter Password",
        //     required: true,
        //     message: "Please enter password!",
        //     pattern: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/,
        //     patternMessage: "Password must be at least 8 characters long and include at least one number and one special character."
        // },
        // {
        //     name: "confirm_password",
        //     label: "Confirm Password",
        //     type: "password",
        //     placeholder: "Enter Confirm Password",
        //     required: true,
        //     message: "Please confirm password!"
        // },
        {
            name: "custom_user_role",
            label: "User Role",
            type: "select",
            placeholder: "Select Role",
            options: ["Super Admin", "Temple Admin", "Cashier"],
            required: true
        },
        {
            name: "custom_select_temple",
            label: "Select Temples",
            type: "select",
            placeholder: "Select Temples",
            options: [], // To be fetched dynamically
            required: true
        },
        {
            name: "enabled",
            label: "Account Status",
            type: "select",
            placeholder: "Select Status",
            options: ["Active", "Inactive"],
            defaultValue: "Active",
            required: true
        },
        {
            name: "custom_status",
            label: "Status",
            type: "select",
            placeholder: "Select Status",
            options: ["Active", "Inactive"],
            defaultValue: "Active",
            required: true
        },
        {
            name: "custom_opening_balance",
            label: "Opening Balance",
            type: "text",
            placeholder: "Add Opening Balance"
        },
        {
            name: "custom_internal_notes",
            label: "Internal Notes",
            type: "textarea",
            placeholder: "Add Note"
        }
    ]
};
