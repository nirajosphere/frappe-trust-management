import React from "react";
import CommonView from "../../components/common/CommonView";
import { DOCTYPE_DONATION_TYPE } from "../../config/constants";

const DonationTypeView = ({ id, onBack, onEdit }) => {
    return (
        <CommonView
            doctype={DOCTYPE_DONATION_TYPE}
            id={id}
            onBack={onBack}
            onEdit={onEdit}
        />
    );
};

export default DonationTypeView;
