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
            <Layout style={{ minHeight: "100vh", background: "#f9fafb" }}>
                {/* Custom Top Navigation Bar - Now shown for ALL roles */}
                <Header className="aavatto-topbar">
                    {/* Brand / Logo */}
                    <div className="aavatto-topbar-brand">
                        <DashboardOutlined style={{ fontSize: "22px", color: "#4f46e5" }} />
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

                    {/* User Profile / Version section */}
                    <div className="aavatto-topbar-right">
                         <div className="aavatto-topbar-version" style={{ marginRight: '16px' }}>v1.0.0</div>
                         <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                            <Space className="aavatto-user-profile">
                                <Avatar 
                                    src={user?.image} 
                                    icon={!user?.image && <UserOutlined />} 
                                    style={{ backgroundColor: '#87d068' }}
                                />
                                <span className="user-name-text">{user?.name}</span>
                            </Space>
                         </Dropdown>
                    </div>
                </Header>

                {/* Page Content */}
                <Content style={{ 
                    padding: "24px 0px", 
                    background: "#f9fafb", 
                    minHeight: "calc(100vh - 64px)" 
                }}>
                    <div className="aavatto-content-wrapper">
                        {getComponentForRoute(currentRoute, roles)}
                    </div>
                </Content>
            </Layout>
        </ConfigProvider>
    );
};

export default App;
export { App };
