import React from "react";
import ListingPage from "../../pages/ListingPage";
import { DOCTYPE_DONOR } from "../../config/constants";
import { donorColumns } from "../../config/tableConfig";

const DonorList = () => {
    return (
        <ListingPage
            doctype={DOCTYPE_DONOR}
            title="Donors Management"
            description="View, add, edit or delete donor records"
            columns={donorColumns}
            basePath="donors"
            fields={["name", "donor_name", "mobile_number", "address", "city", "email"]}
        />
    );
};

export default DonorList;
