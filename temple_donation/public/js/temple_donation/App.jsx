import React, { useState, useEffect } from "react";
import { Layout, Menu, ConfigProvider, Avatar, Dropdown, Space } from "antd";
import { DashboardOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";

// Centralized Configs
import { themeConfig } from "./config/theme";
import { getFilteredMenuItems, getComponentForRoute } from "./config/navigation";
import { useUser } from "./context/UserContext";

import "./styles.css";

const { Header, Content } = Layout;

const App = () => {
    const [currentRoute, setCurrentRoute] = useState("dashboard");
    const { user, roles, logout, isAdmin } = useUser();

    console.log(isAdmin, "isAdmin");
    console.log("isAdmin");

    useEffect(() => {
        const handleRoute = () => {
            if (typeof frappe !== "undefined" && frappe.get_route) {
                const route = frappe.get_route();
                if (route[0] === "temple-donation") {
                    const subRoute = route.slice(1).join("/");
                    setCurrentRoute(subRoute || "dashboard");
                }
            }
        };

        window.update_temple_donation_route = handleRoute;
        window.addEventListener("hashchange", handleRoute);
        handleRoute();

        return () => {
            window.removeEventListener("hashchange", handleRoute);
            delete window.update_temple_donation_route;
        };
    }, []);

    const handleMenuClick = ({ key }) => {
        if (typeof frappe !== "undefined") {
            frappe.set_route("temple-donation", key === "dashboard" ? "" : key);
        }
    };

    const userMenuItems = [
        {
            key: 'profile',
            label: 'My Profile',
            icon: <UserOutlined />,
            onClick: () => {
                if (typeof frappe !== 'undefined') {
                    frappe.set_route('UserProfile', user?.email);
                }
            }
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            label: 'Logout',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: logout
        }
    ];

    // Navigation items filtered by role
    const menuItems = getFilteredMenuItems(roles);

    return (
        <ConfigProvider theme={themeConfig}>
            <div className={`temple-donation-app`}>
                <Layout className={`min-h-screen`}>
                    {/* Custom Top Navigation Bar */}
                    <Header className={`aavatto-topbar ${isAdmin ? 'is-admin' : ''}`}>
                        <div className="flex items-center">
                            {/* Brand / Logo */}
                            <div className="aavatto-topbar-brand">
                                {/* <DashboardOutlined className="text-2xl" /> */}
                                <span>Temple Donation</span>
                            </div>

                            {/* Horizontal Menu - Filtered by role */}
                            <Menu
                                mode="horizontal"
                                selectedKeys={[currentRoute.split('/')[0]]}
                                items={menuItems}
                                onClick={handleMenuClick}
                                className="aavatto-topbar-menu"
                                disabledOverflow={true}
                            />
                        </div>

                        {/* Right Section */}
                        {console.log(roles, "roles")}
                        {
                            !isAdmin && (
                                <div className="aavatto-topbar-right">
                                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                                        <Space className="aavatto-user-profile">
                                            <Avatar
                                                src={user?.image}
                                                icon={!user?.image && <UserOutlined />}
                                                className="bg-zinc-100 text-zinc-900"
                                            />
                                            <span className="user-name-text text-zinc-900">{user?.name}</span>
                                        </Space>
                                    </Dropdown>
                                </div>)
                        }
                    </Header>

                    {/* Page Content */}
                    <Content className="bg-transparent py-8">
                        <div className="aavatto-content-wrapper">
                            {getComponentForRoute(currentRoute, roles)}
                        </div>
                    </Content>
                </Layout>
            </div>
        </ConfigProvider>
    );
};


export default App;
export { App };
