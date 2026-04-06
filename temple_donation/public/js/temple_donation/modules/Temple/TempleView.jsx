import React from "react";
import CommonView from "../../components/common/CommonView";
import { DOCTYPE_TEMPLE } from "../../config/constants";

const TempleView = ({ id, onBack, onEdit }) => {
    return (
        <CommonView
            doctype={DOCTYPE_TEMPLE}
            id={id}
            onBack={onBack}
            onEdit={onEdit}
        />
    );
};

export default TempleView;
