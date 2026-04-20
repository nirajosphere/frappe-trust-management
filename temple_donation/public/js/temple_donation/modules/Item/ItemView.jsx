import React from "react";
import CommonView from "../../components/common/CommonView";
import { DOCTYPE_ITEM } from "../../config/constants";

const ItemView = ({ id, onBack, onEdit }) => {
    return (
        <CommonView
            doctype={DOCTYPE_ITEM}
            id={id}
            onBack={onBack}
            onEdit={onEdit}
        />
    );
};

export default ItemView;
