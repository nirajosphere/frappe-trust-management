import React, { useState, useEffect } from "react";
import { Tabs } from "antd";
import { 
    UnorderedListOutlined, DashboardOutlined, CalendarOutlined, 
    BuildOutlined, CloudUploadOutlined, ScheduleOutlined, AppstoreOutlined, BankOutlined
} from "@ant-design/icons";
import ListingPage from "../../components/common/ListingPage";
import { DOCTYPE_ROOM, DOCTYPE_ROOM_BOOKING, DOCTYPE_BUILDING, DOCTYPE_ROOM_TYPE } from "../../config/constants";
import { roomColumns } from "../../tabelcolumn/roomTable";
import RoomDashboard from "./components/RoomDashboard";
import RoomCalendar from "./components/RoomCalendar";
import BulkRoomGenerator from "./components/BulkRoomGenerator";
import RoomImport from "./components/RoomImport";
import ViewContainer from "../../components/common/ViewContainer";
import { useUser } from "../../context/UserContext";

// Import other lists to render as tabs
import RoomBookingList from "../RoomBooking/RoomBookingList";
import RoomTypeList from "../RoomType/RoomTypeList";
import BuildingList from "../Building/BuildingList";

const RoomList = () => {
    const { permissions, isSystemManager, isSuperAdmin, isAdmin } = useUser();
    const hasFullAccess = isSystemManager || isSuperAdmin || isAdmin;

    const getPerm = (dt) => {
        if (hasFullAccess) return { read: true, write: true, create: true, delete: true };
        const p = permissions?.find(item => item.doctype === dt);
        return {
            read: p ? !!p.read : true,
            write: p ? !!p.write : true,
            create: p ? !!p.create : true,
            delete: p ? !!p.delete : true
        };
    };

    const roomPerm = getPerm(DOCTYPE_ROOM);
    const bookingPerm = getPerm(DOCTYPE_ROOM_BOOKING);
    const buildingPerm = getPerm(DOCTYPE_BUILDING);
    const roomTypePerm = getPerm(DOCTYPE_ROOM_TYPE);

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
        bookingPerm.read && {
            key: "calendar",
            label: (
                <span>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    Booking Calendar
                </span>
            ),
            children: <RoomCalendar />
        },
        bookingPerm.read && {
            key: "bookings",
            label: (
                <span>
                    <ScheduleOutlined style={{ marginRight: 8 }} />
                    Bookings
                </span>
            ),
            children: <RoomBookingList />
        },
        roomPerm.read && {
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
        buildingPerm.read && {
            key: "buildings",
            label: (
                <span>
                    <BankOutlined style={{ marginRight: 8 }} />
                    Buildings
                </span>
            ),
            children: <BuildingList />
        },
        roomTypePerm.read && {
            key: "room-types",
            label: (
                <span>
                    <AppstoreOutlined style={{ marginRight: 8 }} />
                    Room Categories
                </span>
            ),
            children: <RoomTypeList />
        },
        roomPerm.create && {
            key: "generator",
            label: (
                <span>
                    <BuildOutlined style={{ marginRight: 8 }} />
                    Bulk Generator
                </span>
            ),
            children: <BulkRoomGenerator onComplete={() => handleTabChange("list")} />
        },
        roomPerm.create && {
            key: "import",
            label: (
                <span>
                    <CloudUploadOutlined style={{ marginRight: 8 }} />
                    Bulk Room Import
                </span>
            ),
            children: <RoomImport />
        }
    ].filter(Boolean);

    useEffect(() => {
        if (tabItems.length > 0) {
            const hasActiveTab = tabItems.some(t => t.key === activeTab);
            if (!hasActiveTab) {
                setActiveTab(tabItems[0].key);
            }
        }
    }, [activeTab, tabItems.length]);

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
