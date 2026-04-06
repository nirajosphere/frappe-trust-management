import React from "react";
import CommonView from "../../components/common/CommonView";
import { DOCTYPE_DONATION } from "../../config/constants";

const DonationView = ({ id, onBack, onEdit }) => {
    return (
        <CommonView
            doctype={DOCTYPE_DONATION}
            id={id}
            onBack={onBack}
            onEdit={onEdit}
        />
    );
};

export default DonationView;
