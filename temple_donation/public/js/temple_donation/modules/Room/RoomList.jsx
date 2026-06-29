import React, { useState } from "react";
import { Tabs } from "antd";
import { 
    UnorderedListOutlined, DashboardOutlined, CalendarOutlined, 
    BuildOutlined, ImportOutlined 
} from "@ant-design/icons";
import ListingPage from "../../components/common/ListingPage";
import { DOCTYPE_ROOM } from "../../config/constants";
import { roomColumns } from "../../tabelcolumn/roomTable";
import RoomDashboard from "./components/RoomDashboard";
import RoomCalendar from "./components/RoomCalendar";
import BulkRoomGenerator from "./components/BulkRoomGenerator";
import RoomImport from "./components/RoomImport";
import ViewContainer from "../../components/common/ViewContainer";

const RoomList = () => {
    const [activeTab, setActiveTab] = useState("list");

    const tabItems = [
        {
            key: "list",
            label: (
                <span>
                    <UnorderedListOutlined />
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
            key: "dashboard",
            label: (
                <span>
                    <DashboardOutlined />
                    Room Dashboard
                </span>
            ),
            children: <RoomDashboard />
        },
        {
            key: "calendar",
            label: (
                <span>
                    <CalendarOutlined />
                    Booking Calendar
                </span>
            ),
            children: <RoomCalendar />
        },
        {
            key: "generator",
            label: (
                <span>
                    <BuildOutlined />
                    Bulk Generator
                </span>
            ),
            children: <BulkRoomGenerator onComplete={() => setActiveTab("list")} />
        },
        {
            key: "import",
            label: (
                <span>
                    <ImportOutlined />
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
