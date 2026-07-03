import React from "react";
import ListingPage from "../../components/common/ListingPage";
import { DOCTYPE_INVENTORY_ENTRY } from "../../config/constants";
import { inventoryEntryColumns } from "../../tabelcolumn/inventoryEntryTable";

const InventoryEntryList = () => {
    return (
        <ListingPage
            doctype={DOCTYPE_INVENTORY_ENTRY}
            title="Stock Ledger"
            description="Track material movements and stock adjustments"
            columns={inventoryEntryColumns}
            basePath="inventory-entries"
            fields={["name", "entry_type", "reference_type", "reference_name", "temple", "posting_date", "source_location", "target_location"]}
            dependentDocTypes={["Temple", "Donation"]}
        />
    );
};

export default InventoryEntryList;
