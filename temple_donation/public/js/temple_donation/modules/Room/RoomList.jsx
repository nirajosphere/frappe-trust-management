import React, { useState } from "react";
import { Tabs } from "antd";
import { 
    UnorderedListOutlined, DashboardOutlined, CalendarOutlined, 
    BuildOutlined, CloudUploadOutlined, ScheduleOutlined, AppstoreOutlined, BankOutlined
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
    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem("activeRoomTab") || "dashboard";
    });

    const handleTabChange = (key) => {
        setActiveTab(key);
        localStorage.setItem("activeRoomTab", key);
    };

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
                    dependentDocTypes={["Temple", "Building", "Room Type"]}
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
            children: <BulkRoomGenerator onComplete={() => handleTabChange("list")} />
        },
        {
            key: "import",
            label: (
                <span>
                    <CloudUploadOutlined style={{ marginRight: 8 }} />
                    Bulk Room Import
                </span>
            ),
            children: <RoomImport />
        }
    ];

    return (
        <ViewContainer>
            <Tabs 
                activeKey={activeTab} 
                onChange={handleTabChange} 
                items={tabItems}
                type="card"
                style={{ marginTop: "12px" }}
                className="room-management-tabs"
            />
        </ViewContainer>
    );
};

export default RoomList;
