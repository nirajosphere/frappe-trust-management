import React from "react";
import ListingPage from "../../components/common/ListingPage";
import { DOCTYPE_ROOM_TYPE } from "../../config/constants";
import { roomTypeColumns } from "../../tabelcolumn/roomTypeTable";

const RoomTypeList = () => {
    return (
        <ListingPage
            doctype={DOCTYPE_ROOM_TYPE}
            title="Room Categories"
            description="Define and manage pricing & capacity for room categories"
            columns={roomTypeColumns}
            basePath="room-types"
            fields={["name", "room_type_name", "default_capacity", "default_price_per_day", "active", "description"]}
        />
    );
};

export default RoomTypeList;
