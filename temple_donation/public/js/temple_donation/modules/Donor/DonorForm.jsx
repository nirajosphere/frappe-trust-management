import React from "react";
import CommonForm from "../../components/common/CommonForm";
import { DOCTYPE_DONOR } from "../../config/constants";

const DonorForm = ({ id, onBack }) => {
    return (
        <CommonForm
            doctype={DOCTYPE_DONOR}
            id={id}
            onBack={onBack}
        />
    );
};

export default DonorForm;
