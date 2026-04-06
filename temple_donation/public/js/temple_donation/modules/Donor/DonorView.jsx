import React from "react";
import CommonView from "../../components/common/CommonView";
import { DOCTYPE_DONOR } from "../../config/constants";

const DonorView = ({ id, onBack, onEdit }) => {
    return (
        <CommonView
            doctype={DOCTYPE_DONOR}
            id={id}
            onBack={onBack}
            onEdit={onEdit}
        />
    );
};

export default DonorView;
