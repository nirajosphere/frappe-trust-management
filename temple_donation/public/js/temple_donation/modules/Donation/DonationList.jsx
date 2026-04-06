import React from "react";
import ListingPage from "../../pages/ListingPage";
import { DOCTYPE_DONATION } from "../../config/constants";
import { donationColumns } from "../../config/tableConfig";

const DonationList = () => {
    return (
        <ListingPage
            doctype={DOCTYPE_DONATION}
            title="Donation Records"
            description="View and track all donation transactions"
            columns={donationColumns}
            basePath="donations"
            fields={["name", "donor_name", "temple", "total_amount", "payment_mode"]}
        />
    );
};

export default DonationList;
