import React from "react";
import CommonView from "../../components/common/CommonView";
import { DOCTYPE_ROOM_BOOKING } from "../../config/constants";

const RoomBookingView = ({ id, onBack, onEdit }) => {
    return (
        <CommonView
            doctype={DOCTYPE_ROOM_BOOKING}
            id={id}
            onBack={onBack}
            onEdit={onEdit}
        />
    );
};

export default RoomBookingView;
