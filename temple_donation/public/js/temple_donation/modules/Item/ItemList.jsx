import React from "react";
import ListingPage from "../../components/common/ListingPage";
import { DOCTYPE_ITEM } from "../../config/constants";
import { itemColumns } from "../../tabelcolumn/itemTable";

const ItemList = () => {
    return (
        <ListingPage
            doctype={DOCTYPE_ITEM}
            title="Inventory Items"
            description="Manage trust assets and consumable items"
            columns={itemColumns}
            basePath="items"
            fields={["name", "item_name", "item_code", "unit", "temple", "total_stock"]}
        />
    );
};

export default ItemList;
