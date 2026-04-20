import React from "react";
import CommonView from "../../components/common/CommonView";
import { DOCTYPE_INVENTORY_ENTRY } from "../../config/constants";

const InventoryEntryView = ({ id, onBack, onEdit }) => {
    return (
        <CommonView
            doctype={DOCTYPE_INVENTORY_ENTRY}
            id={id}
            onBack={onBack}
            onEdit={onEdit}
        />
    );
};

export default InventoryEntryView;
