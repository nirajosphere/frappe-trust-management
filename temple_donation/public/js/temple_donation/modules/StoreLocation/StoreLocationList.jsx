import React from "react";
import ListingPage from "../../components/common/ListingPage";
import { DOCTYPE_STORE_LOCATION } from "../../config/constants";

const storeLocationColumns = [
    {
        title: "Location Name",
        dataIndex: "location_name",
        key: "location_name",
        sorter: (a, b) => (a.location_name || "").localeCompare(b.location_name || ""),
        render: (text) => <strong>{text}</strong>
    },
    {
        title: "Trust Name",
        dataIndex: "temple",
        key: "temple"
    },
    {
        title: "Description",
        dataIndex: "description",
        key: "description"
    }
];

const StoreLocationList = () => {
    return (
        <ListingPage
            doctype={DOCTYPE_STORE_LOCATION}
            title="Store Locations"
            description="Manage warehouse and storage locations for inventory items"
            columns={storeLocationColumns}
            basePath="store-locations"
            fields={["name", "location_name", "temple", "description"]}
            dependentDocTypes={["Temple"]}
        />
    );
};

export default StoreLocationList;
