import React from "react";
import ListingPage from "../../components/common/ListingPage";
import { DOCTYPE_BUILDING } from "../../config/constants";
import { buildingColumns } from "../../tabelcolumn/buildingTable";

const BuildingList = () => {
    return (
        <ListingPage
            doctype={DOCTYPE_BUILDING}
            title="Buildings"
            description="Manage buildings and floors across temples/trusts"
            columns={buildingColumns}
            basePath="buildings"
            fields={["name", "building_name", "building_code", "temple", "total_floors", "status", "description"]}
            dependentDocTypes={["Temple"]}
        />
    );
};

export default BuildingList;
