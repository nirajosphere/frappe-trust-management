import React from "react";
import CommonForm from "../../components/common/CommonForm";
import { DOCTYPE_TEMPLE } from "../../config/constants";

const TempleForm = ({ id, onBack }) => {
    return (
        <CommonForm
            doctype={DOCTYPE_TEMPLE}
            id={id}
            onBack={onBack}
        />
    );
};

export default TempleForm;
