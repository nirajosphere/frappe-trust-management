import React from "react";
import ListingPage from "../../pages/ListingPage";
import { DOCTYPE_DONATION_TYPE } from "../../config/constants";
import { donationTypeColumns } from "../../tabelcolumn/donationTypeTable";

const DonationTypeList = () => {
    return (
        <ListingPage
            doctype={DOCTYPE_DONATION_TYPE}
            title="Donation Types"
            description="Manage available donation categories"
            columns={donationTypeColumns}
            basePath="donation-types"
            fields={["name", "donation_type", "donation_type_code", "donation_image"]}
        />
    );
};

export default DonationTypeList;
