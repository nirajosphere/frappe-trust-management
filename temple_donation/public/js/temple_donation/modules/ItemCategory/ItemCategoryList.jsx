import React from "react";
import ListingPage from "../../components/common/ListingPage";
import { DOCTYPE_ITEM_CATEGORY } from "../../config/constants";

const itemCategoryColumns = [
    {
        title: "Category Name",
        dataIndex: "category_name",
        key: "category_name",
        sorter: (a, b) => (a.category_name || "").localeCompare(b.category_name || ""),
        render: (text) => <strong>{text}</strong>
    },
    {
        title: "Description",
        dataIndex: "description",
        key: "description"
    }
];

const ItemCategoryList = () => {
    return (
        <ListingPage
            doctype={DOCTYPE_ITEM_CATEGORY}
            title="Item Categories"
            description="Manage categories for inventory items"
            columns={itemCategoryColumns}
            basePath="item-categories"
            fields={["name", "category_name", "description"]}
        />
    );
};

export default ItemCategoryList;
