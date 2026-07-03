import React from "react";
import { Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
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
            fields={["name", "item_name", "item_code", "unit", "temple", "total_stock", "item_category", "store_location", "minimum_stock", "status", "valuation_rate"]}
            dependentDocTypes={["Temple", "Item Category", "Store Location"]}
            extra={
                <Button
                    type="default"
                    icon={<UploadOutlined />}
                    onClick={() => {
                        if (typeof frappe !== "undefined") {
                            frappe.set_route("temple-donation", "items", "import");
                        }
                    }}
                    className="h-10 border-zinc-200 text-zinc-700 font-semibold"
                >
                    Bulk Import
                </Button>
            }
        />
    );
};

export default ItemList;
