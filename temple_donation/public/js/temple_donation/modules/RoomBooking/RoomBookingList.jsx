import React from "react";
import ListingPage from "../../components/common/ListingPage";
import { DOCTYPE_ROOM_BOOKING } from "../../config/constants";
import { roomBookingColumns } from "../../tabelcolumn/roomBookingTable";

const RoomBookingList = () => {
    return (
        <ListingPage
            doctype={DOCTYPE_ROOM_BOOKING}
            title="Room Bookings"
            description="Manage guest check-ins and accommodation history"
            columns={roomBookingColumns}
            basePath="room-bookings"
            fields={["name", "donor", "temple", "room", "check_in", "check_out", "total_amount", "status"]}
        />
    );
};

export default RoomBookingList;
