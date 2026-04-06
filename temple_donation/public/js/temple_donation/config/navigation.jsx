import React from "react";
import {
    DashboardOutlined,
    UserOutlined,
    BankOutlined,
    HistoryOutlined,
    ShoppingCartOutlined,
} from "@ant-design/icons";

import Dashboard from "../modules/Dashboard/Dashboard";
import DonationPOS from "../modules/Donation/Donation";
import {
    DOCTYPE_DONOR, DOCTYPE_TEMPLE, DOCTYPE_DONATION, DOCTYPE_DONATION_TYPE
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

import OpeningBalance from "../modules/Ledger/OpeningBalance";

import CommonView from "../components/common/CommonView";


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
        component: <DonorList />,
        roles: ["Super Admin", "Temple Admin", "Cashier", "Administrator", "System Manager"]
    },
    {
        key: "temples",
        icon: <BankOutlined />,
        label: "Temples",
        component: <TempleList />,
        roles: ["Super Admin", "Temple Admin", "Administrator", "System Manager"]
    },
    {
        key: "ledger",
        icon: <BankOutlined />,
        label: "Ledger",
        component: <OpeningBalance />,
        roles: ["Super Admin", "Temple Admin", "Administrator", "System Manager"]
    },
    {
        key: "donations",
        icon: <HistoryOutlined />,
        label: "Donation List",
        component: <DonationList />,
        roles: ["Super Admin", "Temple Admin", "Cashier", "Administrator", "System Manager"]
    },
    {
        key: "donation-types",
        icon: <ShoppingCartOutlined />,
        label: "Donation Types",
        component: <DonationTypeList />,
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
            <div className="p-16 text-center bg-stone-50/50  border border-dashed border-stone-200 mt-12 animate-fadeIn">
                <div className="text-stone-300 mb-6">
                    <UserOutlined className="text-6xl" />
                </div>
                <h3 className="text-2xl font-black text-stone-800 mb-2 tracking-tight">Access Restricted</h3>
                <p className="text-stone-400 font-medium">You do not have the required permissions to access this specific module.</p>
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        onClick={() => navigate('dashboard')}
                        className="px-8 py-3 bg-zinc-900 text-white font-bold  shadow-lg transition-all"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }


    // Helper for route handling
    const navigate = (key, sub, id) => {
        if (typeof frappe !== "undefined") {
            frappe.set_route("temple-donation", key, sub, id);
        }
    };

    // Special handling for Ledger and other non-standard modules
    if (baseKey === "ledger") {
        return <OpeningBalance />;
    }

    // Handle View Details
    if (targetDoctype && subRoute === "view") {
        const viewProps = {
            id: dynamicId,
            onBack: () => navigate(baseKey),
            onEdit: (doc) => navigate(baseKey, "edit", doc.name)
        };

        switch (targetDoctype) {
            case DOCTYPE_DONOR: return <DonorView {...viewProps} />;
            case DOCTYPE_TEMPLE: return <TempleView {...viewProps} />;
            case DOCTYPE_DONATION: return <DonationView {...viewProps} />;
            case DOCTYPE_DONATION_TYPE: return <DonationTypeView {...viewProps} />;
            default: return <CommonView doctype={targetDoctype} {...viewProps} />;
        }
    }

    // Handle Forms (Add / Edit)
    if (targetDoctype && (subRoute === "new" || subRoute === "edit")) {
        // Special case for Donation POS
        if (targetDoctype === DOCTYPE_DONATION && subRoute === "new") {
            return <DonationPOS />;
        }

        const formProps = {
            id: dynamicId,
            onBack: () => navigate(baseKey)
        };

        switch (targetDoctype) {
            case DOCTYPE_DONOR: return <DonorForm {...formProps} />;
            case DOCTYPE_TEMPLE: return <TempleForm {...formProps} />;
            case DOCTYPE_DONATION: return <DonationForm {...formProps} />;
            case DOCTYPE_DONATION_TYPE: return <DonationTypeForm {...formProps} />;
            default: return null;
        }
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


