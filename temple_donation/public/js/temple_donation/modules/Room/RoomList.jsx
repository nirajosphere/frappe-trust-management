import React from "react";
import ListingPage from "../../components/common/ListingPage";
import { DOCTYPE_ROOM } from "../../config/constants";
import { roomColumns } from "../../tabelcolumn/roomTable";

const RoomList = () => {
    return (
        <ListingPage
            doctype={DOCTYPE_ROOM}
            title="Temple Accommodations"
            description="Manage rooms, halls, and guest house facilities"
            columns={roomColumns}
            basePath="rooms"
            fields={["name", "room_number", "temple", "room_type", "capacity", "price_per_day", "status"]}
        />
    );
};

export default RoomList;
