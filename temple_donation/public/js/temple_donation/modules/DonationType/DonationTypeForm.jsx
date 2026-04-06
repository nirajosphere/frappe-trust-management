import React from "react";
import CommonForm from "../../components/common/CommonForm";
import { DOCTYPE_DONATION_TYPE } from "../../config/constants";

const DonationTypeForm = ({ id, onBack }) => {
    return (
        <CommonForm
            doctype={DOCTYPE_DONATION_TYPE}
            id={id}
            onBack={onBack}
        />
    );
};

export default DonationTypeForm;
