import React from "react";
import {
    DashboardOutlined,
    UserOutlined,
    BankOutlined,
    HistoryOutlined,
    ShoppingCartOutlined,
} from "@ant-design/icons";

import Dashboard from "../pages/Dashboard";
import ListingPage from "../pages/ListingPage";
import Donation from "../pages/Donation";
import CommonForm from "../components/common/CommonForm";
import CommonView from "../components/common/CommonView";
import { DOCTYPE_DONOR, DOCTYPE_TEMPLE, DOCTYPE_DONATION, DOCTYPE_DONATION_TYPE } from "./constants";
import { donorColumns, templeColumns, donationColumns, donationTypeColumns } from "./tableConfig";

/**
 * Centralized navigation configuration.
 * Defines the label, icon, and the React component associated with each route.
 */
export const navigationItems = [
    {
        key: "dashboard",
        icon: <DashboardOutlined />,
        label: "Dashboard",
        component: <Dashboard />,
        roles: ["Super Admin", "Temple Admin", "Cashier", "Administrator", "System Manager"]
    },
    {
        key: "donors",
        icon: <UserOutlined />,
        label: "Donors",
        component: (
            <ListingPage
                doctype={DOCTYPE_DONOR}
                title="Donors Management"
                description="View, add, edit or delete donor records"
                columns={donorColumns}
                basePath="donors"
                fields={["name", "donor_name", "mobile_number", "address", "city", "email"]}
            />
        ),
        roles: ["Super Admin", "Temple Admin", "Cashier", "Administrator", "System Manager"]
    },
    {
        key: "temples",
        icon: <BankOutlined />,
        label: "Temples",
        component: (
            <ListingPage
                doctype={DOCTYPE_TEMPLE}
                title="Temple Management"
                description="View, add, edit or delete temple records"
                columns={templeColumns}
                basePath="temples"
                fields={["name", "temple_name", "city", "state", "trust_registration_no"]}
            />
        ),
        roles: ["Super Admin", "Temple Admin", "Administrator", "System Manager"]
    },
    {
        key: "donations",
        icon: <HistoryOutlined />,
        label: "Donation List",
        component: (
            <ListingPage
                doctype={DOCTYPE_DONATION}
                title="Donation Records"
                description="View and track all donation transactions"
                columns={donationColumns}
                basePath="donations"
                fields={["name", "donor_name", "temple", "total_amount", "payment_mode"]}
            />
        ),
        roles: ["Super Admin", "Temple Admin", "Cashier", "Administrator", "System Manager"]
    },
    {
        key: "donation-types",
        icon: <ShoppingCartOutlined />,
        label: "Donation Types",
        component: (
            <ListingPage
                doctype={DOCTYPE_DONATION_TYPE}
                title="Donation Types"
                description="Manage available donation categories"
                columns={donationTypeColumns}
                basePath="donation-types"
                fields={["name", "donation_type", "donation_type_code", "donation_image"]}
            />
        ),
        roles: ["Super Admin", "Temple Admin", "Administrator", "System Manager"]
    },
];

/**
 * Enhanced route resolver with role-based access check.
 */
export const getComponentForRoute = (currentRoute, userRoles = []) => {
    const parts = currentRoute.split('/');
    const baseKey = parts[0];
    const subRoute = parts[1];
    const dynamicId = parts[2];

    // Determine target Doctype from baseKey
    const doctypeMap = {
        "donors": DOCTYPE_DONOR,
        "temples": DOCTYPE_TEMPLE,
        "donations": DOCTYPE_DONATION,
        "donation-types": DOCTYPE_DONATION_TYPE
    };

    const targetDoctype = doctypeMap[baseKey];

    // Check permissions for the base route
    const navItem = navigationItems.find(nav => nav.key === baseKey);
    const hasPermission = !navItem || navItem.roles.some(role => userRoles.includes(role));

    if (!hasPermission) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h3>Access Denied</h3>
                <p>You do not have permission to view this module.</p>
            </div>
        );
    }

    // Handle View Details
    if (targetDoctype && subRoute === "view") {
        return (
            <CommonView 
                doctype={targetDoctype} 
                id={dynamicId} 
                onBack={() => {
                    if (typeof frappe !== "undefined") {
                        frappe.set_route("temple-donation", baseKey);
                    }
                }}
                onEdit={(doc) => {
                    if (typeof frappe !== "undefined") {
                        frappe.set_route("temple-donation", baseKey, "edit", doc.name);
                    }
                }}
                onPrint={(doc) => {
                    window.print();
                }}
            />
        );
    }

    // Handle Forms (Add / Edit)
    if (targetDoctype && (subRoute === "new" || subRoute === "edit")) {
        // Intercept 'Add New' for Donations to show the POS interface
        if (targetDoctype === DOCTYPE_DONATION && subRoute === "new") {
            return <Donation />;
        }

        return (
            <CommonForm
                doctype={targetDoctype}
                id={dynamicId}
                onBack={() => {
                    if (typeof frappe !== "undefined") {
                        frappe.set_route("temple-donation", baseKey);
                    }
                }}
            />
        );
    }

    // Handle standard list views / other components
    if (navItem) return navItem.component;

    // Default to Dashboard
    return <Dashboard />;
};

/**
 * Get filtered menu items based on user roles.
 */
export const getFilteredMenuItems = (userRoles = []) => {
    return navigationItems
        .filter(item => !item.hidden && item.roles.some(role => userRoles.includes(role)))
        .map(({ key, icon, label }) => ({
            key,
            icon,
            label,
        }));
};


