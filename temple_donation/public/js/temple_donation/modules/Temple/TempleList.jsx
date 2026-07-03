import React from "react";
import ListingPage from "../../components/common/ListingPage";
import { DOCTYPE_TEMPLE } from "../../config/constants";
import { templeColumns } from "../../tabelcolumn/templeTable";

const TempleList = () => {
    return (
        <ListingPage
            doctype={DOCTYPE_TEMPLE}
            title="Trusts Management"
            description="View, add, edit or delete trust records"
            columns={templeColumns}
            basePath="temples"
            fields={["name", "temple_name", "city", "state", "trust_registration_no"]}
            addLabel="Add Trust"
            dependentDocTypes={[]}
        />
    );
};

export default TempleList;
