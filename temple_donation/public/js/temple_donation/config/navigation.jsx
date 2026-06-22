import React from "react";
import {
    DashboardOutlined,
    UserOutlined,
    BankOutlined,
    HistoryOutlined,
    ShoppingCartOutlined,
    AppstoreOutlined,
    HomeOutlined,
    ScheduleOutlined
} from "@ant-design/icons";

import Dashboard from "../modules/Dashboard/Dashboard";
import DonationPOS from "../modules/Donation/Donation";
import {
    DOCTYPE_DONOR, DOCTYPE_TEMPLE, DOCTYPE_DONATION, DOCTYPE_DONATION_TYPE, DOCTYPE_USER,
    DOCTYPE_ITEM, DOCTYPE_INVENTORY_ENTRY, DOCTYPE_ROOM, DOCTYPE_ROOM_BOOKING
} from "./constants";

// Module Imports
import DonorList from "../modules/Donor/DonorList";
import DonorView from "../modules/Donor/DonorView";
import DonorForm from "../modules/Donor/DonorForm";

import TempleList from "../modules/Temple/TempleList";
import TempleView from "../modules/Temple/TempleView";
import TempleForm from "../modules/Temple/TempleForm";

import DonationList from "../modules/Donation/DonationList";
import DonationView from "../modules/Donation/DonationView";
import DonationForm from "../modules/Donation/DonationForm";

import DonationTypeList from "../modules/DonationType/DonationTypeList";
import DonationTypeView from "../modules/DonationType/DonationTypeView";
import DonationTypeForm from "../modules/DonationType/DonationTypeForm";

import UserList from "../modules/User/UserList";
import UserForm from "../modules/User/UserForm";
import UserView from "../modules/User/UserView";

import OpeningBalance from "../modules/Ledger/OpeningBalance";
import LedgerView from "../modules/Ledger/LedgerView";

import CommonView from "../components/common/CommonView";

// Inventory Management
import ItemList from "../modules/Item/ItemList";
import ItemForm from "../modules/Item/ItemForm";
import ItemView from "../modules/Item/ItemView";

import InventoryEntryList from "../modules/InventoryEntry/InventoryEntryList";
import InventoryEntryForm from "../modules/InventoryEntry/InventoryEntryForm";
import InventoryEntryView from "../modules/InventoryEntry/InventoryEntryView";

// Room Management
import RoomList from "../modules/Room/RoomList";
import RoomForm from "../modules/Room/RoomForm";
import RoomView from "../modules/Room/RoomView";

import RoomBookingList from "../modules/RoomBooking/RoomBookingList";
import RoomBookingForm from "../modules/RoomBooking/RoomBookingForm";
import RoomBookingView from "../modules/RoomBooking/RoomBookingView";


/**
 * Centralized navigation configuration.
 */
export const navigationItems = [
    {
        key: "dashboard",
        // icon: <DashboardOutlined />,
        label: "Dashboard",
        component: <Dashboard />,
        roles: ["Super Admin", "Temple Admin", "Cashier", "Administrator", "System Manager"]
    },
    // {
    //     key: "donors",
    //     icon: <UserOutlined />,
    //     label: "Donors",
    //     component: <DonorList />,
    //     roles: ["Super Admin", "Temple Admin", "Cashier", "Administrator", "System Manager"]
    // },
    // {
    //     key: "donations",
    //     icon: <HistoryOutlined />,
    //     label: "Donation",
    //     component: <DonationList />,
    //     roles: ["Super Admin", "Temple Admin", "Cashier", "Administrator", "System Manager"]
    // },
    {
        key: "items",
        icon: <AppstoreOutlined />,
        label: "Items",
        component: <ItemList />,
        roles: ["Super Admin", "Temple Admin", "Administrator", "System Manager"]
    },
    {
        key: "inventory-entries",
        icon: <HistoryOutlined />,
        label: "Stock Entries",
        component: <InventoryEntryList />,
        roles: ["Super Admin", "Temple Admin", "Administrator", "System Manager"]
    },
    {
        key: "rooms",
        icon: <HomeOutlined />,
        label: "Rooms",
        component: <RoomList />,
        roles: ["Super Admin", "Temple Admin", "Administrator", "System Manager"]
    },
    {
        key: "room-bookings",
        icon: <ScheduleOutlined />,
        label: "Bookings",
        component: <RoomBookingList />,
        roles: ["Super Admin", "Temple Admin", "Cashier", "Administrator", "System Manager"]
    },
    {
        key: "ledger",
        // icon: <BankOutlined />,
        label: "Ledger",
        component: <OpeningBalance />,
        roles: ["Super Admin", "Temple Admin", "Administrator", "System Manager"]
    },
    {
        key: "users",
        // icon: <UserOutlined />,
        label: "Users",
        component: <UserList />,
        roles: ["Super Admin", "Temple Admin", "Administrator", "System Manager"]
    },
    {
        key: "temples",
        // icon: <BankOutlined />,
        label: "Trusts",
        component: <TempleList />,
        roles: ["Super Admin", "Temple Admin", "Administrator", "System Manager"]
    },
    {
        key: "donation-types",
        // icon: <ShoppingCartOutlined />,
        label: "Donation Types",
        component: <DonationTypeList />,
        roles: ["Super Admin", "Temple Admin", "Administrator", "System Manager"]
    },
    {
        key: "donors",
        // icon: <UserOutlined />,
        label: "Donors",
        component: <DonorList />,
        roles: ["Super Admin", "Temple Admin", "Cashier", "Administrator", "System Manager"]
    },
    {
        key: "donations",
        // icon: <HistoryOutlined />,
        label: "Donation",
        component: <DonationList />,
        roles: ["Super Admin", "Temple Admin", "Cashier", "Administrator", "System Manager"]
    },
];

/**
 * Enhanced route resolver.
 */
export const getComponentForRoute = (currentRoute, userRoles = []) => {
    const parts = currentRoute.split('/');
    const baseKey = parts[0];
    let subRoute = parts[1];
    let dynamicId = parts[2];

    if (subRoute === "undefined") subRoute = undefined;
    if (dynamicId === "undefined") dynamicId = undefined;

    const doctypeMap = {
        "donors": DOCTYPE_DONOR,
        "temples": DOCTYPE_TEMPLE,
        "donations": DOCTYPE_DONATION,
        "donation-types": DOCTYPE_DONATION_TYPE,
        "users": DOCTYPE_USER,
        "items": DOCTYPE_ITEM,
        "inventory-entries": DOCTYPE_INVENTORY_ENTRY,
        "rooms": DOCTYPE_ROOM,
        "room-bookings": DOCTYPE_ROOM_BOOKING
    };

    const targetDoctype = doctypeMap[baseKey];
    const navItem = navigationItems.find(nav => nav.key === baseKey);
    
    // Permission check
    const hasPermission = !navItem || navItem.roles.some(role => userRoles.includes(role));

    if (!hasPermission) {
        return (
            <div className="p-16 text-center">
                <h3 className="text-2xl font-bold">Access Restricted</h3>
                <button onClick={() => frappe.set_route("temple-donation")} className="mt-4 px-6 py-2 bg-black text-white">Return Home</button>
            </div>
        );
    }

    const navigate = (key, sub, id) => {
        if (typeof frappe !== "undefined") {
            const route = ["temple-donation", key];
            if (sub) route.push(sub);
            if (id) route.push(id);
            frappe.set_route(...route);
        }
    };

    // Special handling for Ledger and other non-standard modules
    if (baseKey === "ledger") {
        if (subRoute === "view") {
            return <LedgerView id={dynamicId} onBack={() => navigate(baseKey)} />;
        }
        return <OpeningBalance />;
    }

    if (targetDoctype && subRoute === "view") {
        const viewProps = { id: dynamicId, onBack: () => navigate(baseKey), onEdit: (doc) => navigate(baseKey, "edit", doc.name) };
        switch (targetDoctype) {
            case DOCTYPE_ITEM: return <ItemView {...viewProps} />;
            case DOCTYPE_INVENTORY_ENTRY: return <InventoryEntryView {...viewProps} />;
            case DOCTYPE_ROOM: return <RoomView {...viewProps} />;
            case DOCTYPE_ROOM_BOOKING: return <RoomBookingView {...viewProps} />;
            case DOCTYPE_DONOR: return <DonorView {...viewProps} />;
            case DOCTYPE_TEMPLE: return <TempleView {...viewProps} />;
            case DOCTYPE_DONATION: return <DonationView {...viewProps} />;
            case DOCTYPE_DONATION_TYPE: return <DonationTypeView {...viewProps} />;
            case DOCTYPE_USER: return <UserView {...viewProps} />;
            default: return <CommonView doctype={targetDoctype} {...viewProps} />;
        }
    }

    if (targetDoctype && (subRoute === "new" || subRoute === "edit")) {
        if (targetDoctype === DOCTYPE_DONATION && subRoute === "new") return <DonationPOS onBack={() => navigate(baseKey)} />;
        const formProps = { id: dynamicId, onBack: () => navigate(baseKey) };
        switch (targetDoctype) {
            case DOCTYPE_ITEM: return <ItemForm {...formProps} />;
            case DOCTYPE_INVENTORY_ENTRY: return <InventoryEntryForm {...formProps} />;
            case DOCTYPE_ROOM: return <RoomForm {...formProps} />;
            case DOCTYPE_ROOM_BOOKING: return <RoomBookingForm {...formProps} />;
            case DOCTYPE_DONOR: return <DonorForm {...formProps} />;
            case DOCTYPE_TEMPLE: return <TempleForm {...formProps} />;
            case DOCTYPE_DONATION: return <DonationForm {...formProps} />;
            case DOCTYPE_DONATION_TYPE: return <DonationTypeForm {...formProps} />;
            case DOCTYPE_USER: return <UserForm {...formProps} />;
            default: return null;
        }
    }

    if (navItem) return navItem.component;
    return <Dashboard />;
};

export const getFilteredMenuItems = (userRoles = []) => {
    return navigationItems
        .filter(item => !item.hidden && item.roles.some(role => userRoles.includes(role)))
        .map(({ key, icon, label }) => ({ key, icon, label }));
};

export const groupedNavigationStructure = [
    {
        label: "Dashboard",
        key: "dashboard",
        isSingle: true
    },
    {
        label: "Finance",
        key: "finance-group",
        children: [
            { key: "ledger", label: "Ledger" }
        ]
    },
    {
        label: "Administration",
        key: "admin-group",
        children: [
            { key: "users", label: "Users" }
        ]
    },
    {
        label: "Trust Management",
        key: "trust-mgmt",
        children: [
            { key: "temples", label: "Trusts" },
            { key: "rooms", label: "Rooms" },
            { key: "room-bookings", label: "Bookings" }
        ]
    },
    {
        label: "Donations",
        key: "donations-group",
        children: [
            { key: "donations", label: "Donation" },
            { key: "donors", label: "Donors" },
            { key: "donation-types", label: "Donation Types" }
        ]
    },
    {
        label: "Inventory",
        key: "inventory-group",
        children: [
            { key: "items", label: "Items" },
            { key: "inventory-entries", label: "Stock Entries" }
        ]
    },
];

export const getGroupedMenuItems = (userRoles = []) => {
    return groupedNavigationStructure
        .map(group => {
            if (group.isSingle) {
                const navItem = navigationItems.find(item => item.key === group.key);
                const hasPermission = !navItem || navItem.roles.some(role => userRoles.includes(role));
                if (!hasPermission) return null;
                return { ...group };
            }
            
            const filteredChildren = group.children.map(child => {
                const navItem = navigationItems.find(item => item.key === child.key);
                const hasPermission = !navItem || navItem.roles.some(role => userRoles.includes(role));
                if (!hasPermission) return null;
                return child;
            }).filter(Boolean);

            if (filteredChildren.length === 0) return null;

            return {
                ...group,
                children: filteredChildren
            };
        })
        .filter(Boolean);
};

