import React from "react";
import {
    DashboardOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    DatabaseOutlined,
    BarChartOutlined,
    SettingOutlined,
} from "@ant-design/icons";

import Dashboard from "../pages/Dashboard";
import Donors from "../pages/Donors";
import Orders from "../pages/Orders";
import Donation from "../pages/Donation";

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
    },
    {
        key: "donation",
        icon: <ShoppingCartOutlined />,
        label: "Donation POS",
        component: <Donation />,
        hidden: true,
    },
    {
        key: "donors",
        icon: <UserOutlined />,
        label: "Donation List",
        component: <Donors />,
    },
    // {
    //     key: "orders",
    //     icon: <ShoppingCartOutlined />,
    //     label: "Orders",
    //     component: <Orders />,
    // },
    // {
    //     key: "inventory",
    //     icon: <DatabaseOutlined />,
    //     label: "Inventory",
    //     component: <Dashboard />, // Placeholder until Inventory page is created
    // },
    // {
    //     key: "analytics",
    //     icon: <BarChartOutlined />,
    //     label: "Analytics",
    //     component: <Dashboard />, // Placeholder until Analytics page is created
    // },
    // {
    //     key: "settings",
    //     icon: <SettingOutlined />,
    //     label: "Settings",
    //     component: <Dashboard />, // Placeholder until Settings page is created
    // },
];

export const getComponentForRoute = (currentRoute) => {
    const item = navigationItems.find(nav => nav.key === currentRoute);
    return item ? item.component : <Dashboard />;
};

export const menuItems = navigationItems
    .filter(item => !item.hidden)
    .map(({ key, icon, label }) => ({
        key,
        icon,
        label,
    }));
