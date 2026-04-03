import React from "react";
import ListingPage from "./ListingPage";
import { DOCTYPE_TEMPLE } from "../config/constants";
import { templeColumns } from "../config/tableConfig";

const TempleListing = () => {
    return (
        <ListingPage
            doctype={DOCTYPE_TEMPLE}
            title="Temple Management"
            description="View, add, edit or delete temple records"
            columns={templeColumns}
            fields={["name", "temple_name", "city", "state", "trust_registration_no"]}
        />
    );
};

export default TempleListing;
