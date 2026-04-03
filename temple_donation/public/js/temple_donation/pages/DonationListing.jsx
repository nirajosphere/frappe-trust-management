import React from "react";
import ListingPage from "./ListingPage";
import { DOCTYPE_DONATION } from "../config/constants";
import { donationColumns } from "../config/tableConfig";

const DonationListing = () => {
    return (
        <ListingPage
            doctype={DOCTYPE_DONATION}
            title="Donation Records"
            description="View and track all donation transactions"
            columns={donationColumns}
            fields={["name", "donor_name", "temple", "total_amount", "payment_mode"]}
        />
    );
};

export default DonationListing;
