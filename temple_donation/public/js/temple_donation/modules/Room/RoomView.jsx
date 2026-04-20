import React from "react";
import CommonView from "../../components/common/CommonView";
import { DOCTYPE_ROOM } from "../../config/constants";

const RoomView = ({ id, onBack, onEdit }) => {
    return (
        <CommonView
            doctype={DOCTYPE_ROOM}
            id={id}
            onBack={onBack}
            onEdit={onEdit}
        />
    );
};

export default RoomView;
