import React from "react";
import ListingPage from "../../components/common/ListingPage";
import { DOCTYPE_USER } from "../../config/constants";
import { userColumns } from "../../tabelcolumn/userTable";

const UserList = () => {
    return (
        <ListingPage
            doctype={DOCTYPE_USER}
            title="Users Management"
            description="Manage temple admins, cashiers and system users."
            columns={userColumns}
            basePath="users"
            // fields={["*"]}
            fields={["name", "full_name", "first_name", "last_name", "email", "custom_test", "custom_user_role", "custom_status", "enabled","user_image"]}
            filters={{
                name: ["not in", ["Administrator", "Guest"]]
            }}
            childTable="custom_select_temple"
            childDocType="Temple Details"
            // addLabel="Add User"
        />
    );
};

export default UserList;
