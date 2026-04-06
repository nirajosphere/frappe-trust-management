import React from "react";
import ListingPage from "../../pages/ListingPage";
import { DOCTYPE_TEMPLE } from "../../config/constants";
import { templeColumns } from "../../config/tableConfig";

const TempleList = () => {
    return (
        <ListingPage
            doctype={DOCTYPE_TEMPLE}
            title="Temple Management"
            description="View, add, edit or delete temple records"
            columns={templeColumns}
            basePath="temples"
            fields={["name", "temple_name", "city", "state", "trust_registration_no"]}
        />
    );
};

export default TempleList;
