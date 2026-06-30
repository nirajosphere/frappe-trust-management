import React, { useState } from "react";
import { Tabs } from "antd";
import { 
    UnorderedListOutlined, DashboardOutlined, CalendarOutlined, 
    BuildOutlined, ImportOutlined, ScheduleOutlined, AppstoreOutlined, BankOutlined
} from "@ant-design/icons";
import ListingPage from "../../components/common/ListingPage";
import { DOCTYPE_ROOM } from "../../config/constants";
import { roomColumns } from "../../tabelcolumn/roomTable";
import RoomDashboard from "./components/RoomDashboard";
import RoomCalendar from "./components/RoomCalendar";
import BulkRoomGenerator from "./components/BulkRoomGenerator";
import RoomImport from "./components/RoomImport";
import ViewContainer from "../../components/common/ViewContainer";

// Import other lists to render as tabs
import RoomBookingList from "../RoomBooking/RoomBookingList";
import RoomTypeList from "../RoomType/RoomTypeList";
import BuildingList from "../Building/BuildingList";

const RoomList = () => {
    const [activeTab, setActiveTab] = useState("dashboard");

    const tabItems = [
        {
            key: "dashboard",
            label: (
                <span>
                    <DashboardOutlined style={{ marginRight: 8 }} />
                    Room Dashboard
                </span>
            ),
            children: <RoomDashboard />
        },
        {
            key: "calendar",
            label: (
                <span>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    Booking Calendar
                </span>
            ),
            children: <RoomCalendar />
        },
        {
            key: "bookings",
            label: (
                <span>
                    <ScheduleOutlined style={{ marginRight: 8 }} />
                    Bookings
                </span>
            ),
            children: <RoomBookingList />
        },
        {
            key: "list",
            label: (
                <span>
                    <UnorderedListOutlined style={{ marginRight: 8 }} />
                    Room Directory
                </span>
            ),
            children: (
                <ListingPage
                    doctype={DOCTYPE_ROOM}
                    title="Rooms"
                    description="Manage rooms, halls, and guest house facilities"
                    columns={roomColumns}
                    basePath="rooms"
                    fields={["name", "room_number", "temple", "building", "floor_number", "room_type", "capacity", "price_per_day", "status"]}
                />
            )
        },
        {
            key: "buildings",
            label: (
                <span>
                    <BankOutlined style={{ marginRight: 8 }} />
                    Buildings
                </span>
            ),
            children: <BuildingList />
        },
        {
            key: "room-types",
            label: (
                <span>
                    <AppstoreOutlined style={{ marginRight: 8 }} />
                    Room Categories
                </span>
            ),
            children: <RoomTypeList />
        },
        {
            key: "generator",
            label: (
                <span>
                    <BuildOutlined style={{ marginRight: 8 }} />
                    Bulk Generator
                </span>
            ),
            children: <BulkRoomGenerator onComplete={() => setActiveTab("list")} />
        },
        {
            key: "import",
            label: (
                <span>
                    <ImportOutlined style={{ marginRight: 8 }} />
                    CSV Import
                </span>
            ),
            children: <RoomImport />
        }
    ];

    return (
        <ViewContainer>
            <Tabs 
                activeKey={activeTab} 
                onChange={(key) => setActiveTab(key)} 
                items={tabItems}
                type="card"
                style={{ marginTop: "12px" }}
                className="room-management-tabs"
            />
        </ViewContainer>
    );
};

export default RoomList;
