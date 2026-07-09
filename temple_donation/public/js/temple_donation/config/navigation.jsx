import React from "react";
import {
    DashboardOutlined,
    UserOutlined,
    BankOutlined,
    HistoryOutlined,
    ShoppingCartOutlined,
    AppstoreOutlined,
    HomeOutlined,
    ScheduleOutlined,
    LayoutOutlined,
    SettingOutlined
} from "@ant-design/icons";

import Dashboard from "../modules/Dashboard/Dashboard";
import DonationPOS from "../modules/Donation/Donation";
import {
    DOCTYPE_DONOR, DOCTYPE_TEMPLE, DOCTYPE_DONATION, DOCTYPE_DONATION_TYPE, DOCTYPE_USER,
    DOCTYPE_ITEM, DOCTYPE_INVENTORY_ENTRY, DOCTYPE_ROOM, DOCTYPE_ROOM_BOOKING,
    DOCTYPE_BUILDING, DOCTYPE_ROOM_TYPE, DOCTYPE_ITEM_CATEGORY, DOCTYPE_STORE_LOCATION,
    DOCTYPE_DOCUMENT_TEMPLATE, DOCTYPE_RECEIPT_SETTINGS, DOCTYPE_GENERAL_SETTINGS,
    DOCTYPE_BOOKING_SETTINGS, DOCTYPE_NOTIFICATION_SETTINGS
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
import RolePermissions from "../modules/User/RolePermissions";

import OpeningBalance from "../modules/Ledger/OpeningBalance";
import LedgerView from "../modules/Ledger/LedgerView";

import CommonView from "../components/common/CommonView";

// Inventory Management
import InventoryDashboard from "../modules/InventoryDashboard/InventoryDashboard";

import ItemList from "../modules/Item/ItemList";
import ItemForm from "../modules/Item/ItemForm";
import ItemView from "../modules/Item/ItemView";
import ItemBulkImporter from "../modules/Item/ItemBulkImporter";

import ItemCategoryList from "../modules/ItemCategory/ItemCategoryList";
import ItemCategoryForm from "../modules/ItemCategory/ItemCategoryForm";
import ItemCategoryView from "../modules/ItemCategory/ItemCategoryView";

import StoreLocationList from "../modules/StoreLocation/StoreLocationList";
import StoreLocationForm from "../modules/StoreLocation/StoreLocationForm";
import StoreLocationView from "../modules/StoreLocation/StoreLocationView";

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

import BuildingList from "../modules/Building/BuildingList";
import BuildingForm from "../modules/Building/BuildingForm";

import RoomTypeList from "../modules/RoomType/RoomTypeList";
import RoomTypeForm from "../modules/RoomType/RoomTypeForm";

// Document & Receipt Management
import DocumentTemplateList from "../modules/DocumentReceipt/DocumentTemplateList";
import DocumentTemplateForm from "../modules/DocumentReceipt/DocumentTemplateForm";
import ReceiptSettingsForm from "../modules/DocumentReceipt/ReceiptSettingsForm";

// Settings Management
import GeneralSettingsForm from "../modules/Settings/GeneralSettingsForm";
import BookingSettingsForm from "../modules/Settings/BookingSettingsForm";
import NotificationSettingsForm from "../modules/Settings/NotificationSettingsForm";


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
        key: "inventory-dashboard",
        icon: <DashboardOutlined />,
        label: "Inventory Dashboard",
        component: <InventoryDashboard />,
        roles: ["Super Admin", "Temple Admin", "Administrator", "System Manager"]
    },
    {
        key: "items",
        icon: <AppstoreOutlined />,
        label: "Items",
        component: <ItemList />,
        roles: ["Super Admin", "Temple Admin", "Administrator", "System Manager"]
    },
    {
        key: "item-categories",
        icon: <AppstoreOutlined />,
        label: "Item Categories",
        component: <ItemCategoryList />,
        roles: ["Super Admin", "Temple Admin", "Administrator", "System Manager"]
    },
    {
        key: "store-locations",
        icon: <BankOutlined />,
        label: "Store Locations",
        component: <StoreLocationList />,
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
        key: "buildings",
        icon: <BankOutlined />,
        label: "Buildings",
        component: <BuildingList />,
        roles: ["Super Admin", "Temple Admin", "Administrator", "System Manager"]
    },
    {
        key: "room-types",
        icon: <AppstoreOutlined />,
        label: "Room Categories",
        component: <RoomTypeList />,
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
        key: "role-permissions",
        icon: <SettingOutlined />,
        label: "Role Permissions",
        component: <RolePermissions />,
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
    {
        key: "document-templates",
        icon: <LayoutOutlined />,
        label: "Document Templates",
        component: <DocumentTemplateList />,
        roles: ["Super Admin", "Temple Admin", "Cashier", "Administrator", "System Manager"]
    },
    {
        key: "receipt-settings",
        icon: <SettingOutlined />,
        label: "Receipt Settings",
        component: <ReceiptSettingsForm />,
        roles: ["Super Admin", "Temple Admin", "Administrator", "System Manager"]
    },
    {
        key: "general-settings",
        icon: <SettingOutlined />,
        label: "General Settings",
        component: <GeneralSettingsForm />,
        roles: ["Super Admin", "Temple Admin", "Administrator", "System Manager"]
    },
    {
        key: "booking-settings",
        icon: <SettingOutlined />,
        label: "Booking Settings",
        component: <BookingSettingsForm />,
        roles: ["Super Admin", "Temple Admin", "Administrator", "System Manager"]
    },
    {
        key: "notification-settings",
        icon: <SettingOutlined />,
        label: "Notification Settings",
        component: <NotificationSettingsForm />,
        roles: ["Super Admin", "Temple Admin", "Administrator", "System Manager"]
    }
];

/**
 * Helper to check user permission including custom extra overrides
 */
export const checkUserPermission = (navKey, userRoles = [], userPermissions = []) => {
    // 1. If user is Super Admin, System Manager or Administrator, grant all permissions
    const isManager = userRoles.includes("System Manager") || userRoles.includes("Super Admin") || userRoles.includes("Administrator");
    if (isManager) return true;

    // 2. Find the navigation item configuration
    const navItem = navigationItems.find(item => item.key === navKey);
    if (!navItem) return false;

    // 3. Map the navigation key to the corresponding DocType
    const doctypeMap = {
        "donors": DOCTYPE_DONOR,
        "temples": DOCTYPE_TEMPLE,
        "donations": DOCTYPE_DONATION,
        "donation-types": DOCTYPE_DONATION_TYPE,
        "users": DOCTYPE_USER,
        "role-permissions": DOCTYPE_USER,
        "items": DOCTYPE_ITEM,
        "item-categories": DOCTYPE_ITEM_CATEGORY,
        "store-locations": DOCTYPE_STORE_LOCATION,
        "inventory-entries": DOCTYPE_INVENTORY_ENTRY,
        "rooms": DOCTYPE_ROOM,
        "room-bookings": DOCTYPE_ROOM_BOOKING,
        "buildings": DOCTYPE_BUILDING,
        "room-types": DOCTYPE_ROOM_TYPE,
        "document-templates": DOCTYPE_DOCUMENT_TEMPLATE,
        "receipt-settings": DOCTYPE_RECEIPT_SETTINGS,
        "general-settings": DOCTYPE_GENERAL_SETTINGS,
        "booking-settings": DOCTYPE_BOOKING_SETTINGS,
        "notification-settings": DOCTYPE_NOTIFICATION_SETTINGS,
        "inventory-dashboard": DOCTYPE_ITEM,
        "ledger": DOCTYPE_DONATION
    };

    const doctype = doctypeMap[navKey];
    if (doctype) {
        // If it is a doctype page, check user-specific permission override
        const perm = userPermissions.find(p => p.doctype === doctype);
        if (perm) {
            return !!perm.read;
        }
    }

    // 4. Fallback to default role check
    return navItem.roles.some(role => userRoles.includes(role));
};

/**
 * Enhanced route resolver.
 */
export const getComponentForRoute = (currentRoute, userRoles = [], userPermissions = []) => {
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
        "item-categories": DOCTYPE_ITEM_CATEGORY,
        "store-locations": DOCTYPE_STORE_LOCATION,
        "inventory-entries": DOCTYPE_INVENTORY_ENTRY,
        "rooms": DOCTYPE_ROOM,
        "room-bookings": DOCTYPE_ROOM_BOOKING,
        "buildings": DOCTYPE_BUILDING,
        "room-types": DOCTYPE_ROOM_TYPE,
        "document-templates": DOCTYPE_DOCUMENT_TEMPLATE,
        "receipt-settings": DOCTYPE_RECEIPT_SETTINGS,
        "general-settings": DOCTYPE_GENERAL_SETTINGS,
        "booking-settings": DOCTYPE_BOOKING_SETTINGS,
        "notification-settings": DOCTYPE_NOTIFICATION_SETTINGS
    };

    const targetDoctype = doctypeMap[baseKey];
    const navItem = navigationItems.find(nav => nav.key === baseKey);
    
    // Redirect if it's an unrecognized sub-route
    if (baseKey && baseKey !== "dashboard" && !navItem) {
        if (typeof frappe !== "undefined" && frappe.set_route) {
            setTimeout(() => {
                frappe.set_route("temple-donation");
            }, 0);
        }
        return <Dashboard />;
    }

    // Permission check
    const hasPermission = !baseKey || baseKey === "dashboard" || checkUserPermission(baseKey, userRoles, userPermissions);

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

    if (baseKey === "items" && subRoute === "import") {
        return <ItemBulkImporter onBack={() => navigate("items")} />;
    }

    // Special handling for Ledger and other non-standard modules
    if (baseKey === "ledger") {
        if (subRoute === "view") {
            return <LedgerView id={dynamicId} onBack={() => navigate(baseKey)} />;
        }
        return <OpeningBalance />;
    }

    if (targetDoctype && subRoute === "view") {
        const isRoomRelated = [DOCTYPE_ROOM, DOCTYPE_ROOM_BOOKING, DOCTYPE_BUILDING, DOCTYPE_ROOM_TYPE].includes(targetDoctype);
        const backKey = isRoomRelated ? "rooms" : baseKey;
        const viewProps = { id: dynamicId, onBack: () => navigate(backKey), onEdit: (doc) => navigate(baseKey, "edit", doc.name) };
        switch (targetDoctype) {
            case DOCTYPE_ITEM: return <ItemView {...viewProps} />;
            case DOCTYPE_INVENTORY_ENTRY: return <InventoryEntryView {...viewProps} />;
            case DOCTYPE_ITEM_CATEGORY: return <ItemCategoryView {...viewProps} />;
            case DOCTYPE_STORE_LOCATION: return <StoreLocationView {...viewProps} />;
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
        const isRoomRelated = [DOCTYPE_ROOM, DOCTYPE_ROOM_BOOKING, DOCTYPE_BUILDING, DOCTYPE_ROOM_TYPE].includes(targetDoctype);
        const backKey = isRoomRelated ? "rooms" : baseKey;
        const formProps = { id: dynamicId, onBack: () => navigate(backKey) };
        switch (targetDoctype) {
            case DOCTYPE_ITEM: return <ItemForm {...formProps} />;
            case DOCTYPE_ITEM_CATEGORY: return <ItemCategoryForm {...formProps} />;
            case DOCTYPE_STORE_LOCATION: return <StoreLocationForm {...formProps} />;
            case DOCTYPE_INVENTORY_ENTRY: return <InventoryEntryForm {...formProps} />;
            case DOCTYPE_ROOM: return <RoomForm {...formProps} />;
            case DOCTYPE_ROOM_BOOKING: return <RoomBookingForm {...formProps} />;
            case DOCTYPE_BUILDING: return <BuildingForm {...formProps} />;
            case DOCTYPE_ROOM_TYPE: return <RoomTypeForm {...formProps} />;
            case DOCTYPE_DONOR: return <DonorForm {...formProps} />;
            case DOCTYPE_TEMPLE: return <TempleForm {...formProps} />;
            case DOCTYPE_DONATION: return <DonationForm {...formProps} />;
            case DOCTYPE_DONATION_TYPE: return <DonationTypeForm {...formProps} />;
            case DOCTYPE_USER: return <UserForm {...formProps} />;
            case DOCTYPE_DOCUMENT_TEMPLATE: return <DocumentTemplateForm {...formProps} />;
            case DOCTYPE_RECEIPT_SETTINGS: return <ReceiptSettingsForm {...formProps} />;
            default: return null;
        }
    }

    if (navItem) return navItem.component;
    return <Dashboard />;
};

export const getFilteredMenuItems = (userRoles = [], userPermissions = []) => {
    return navigationItems
        .filter(item => !item.hidden && checkUserPermission(item.key, userRoles, userPermissions))
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
        label: "User Management",
        key: "user-management-group",
        children: [
            { key: "users", label: "Users" },
            { key: "role-permissions", label: "Role Permissions" }
        ]
    },
    {
        label: "Trust Management",
        key: "trust-mgmt",
        children: [
            { key: "temples", label: "Trusts" },
            { key: "rooms", label: "Rooms" }
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
            { key: "inventory-dashboard", label: "Inventory Dashboard" },
            { key: "items", label: "Items" },
            { key: "item-categories", label: "Item Categories" },
            { key: "store-locations", label: "Store Locations" },
            { key: "inventory-entries", label: "Stock Entries" }
        ]
    }
];

export const settingsNavigationStructure = [
    { key: "general-settings", label: "General Settings" },
    { key: "booking-settings", label: "Booking Settings" },
    { key: "notification-settings", label: "Notification Settings" },
    { key: "document-templates", label: "Document Templates" },
    { key: "receipt-settings", label: "Receipt Settings" }
];

export const getFilteredSettingsItems = (userRoles = [], userPermissions = []) => {
    return settingsNavigationStructure
        .map(child => {
            const hasPermission = checkUserPermission(child.key, userRoles, userPermissions);
            if (!hasPermission) return null;
            return child;
        })
        .filter(Boolean);
};

export const getGroupedMenuItems = (userRoles = [], userPermissions = []) => {
    return groupedNavigationStructure
        .map(group => {
            if (group.isSingle) {
                const hasPermission = checkUserPermission(group.key, userRoles, userPermissions);
                if (!hasPermission) return null;
                return { ...group };
            }
            
            const filteredChildren = group.children.map(child => {
                const hasPermission = checkUserPermission(child.key, userRoles, userPermissions);
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


