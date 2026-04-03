import React, { useState, useEffect } from "react";
import { Layout, Menu, ConfigProvider } from "antd";
import { DashboardOutlined } from "@ant-design/icons";

// Centralized Configs
import { themeConfig } from "./config/theme";
import { menuItems, getComponentForRoute } from "./config/navigation";


import "./styles.css";

const { Header, Content } = Layout;

const App = () => {
    const [currentRoute, setCurrentRoute] = useState("dashboard");

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

    return (

            <ConfigProvider theme={themeConfig}>
                <Layout style={{ minHeight: "100vh", background: "#f9fafb" }}>
                    {/* Top Navigation Bar */}
                    <Header className="aavatto-topbar">
                        {/* Brand / Logo */}
                        <div className="aavatto-topbar-brand">
                            <DashboardOutlined style={{ fontSize: "22px", color: "#4f46e5" }} />
                            <span>Temple Donation</span>
                        </div>

                        {/* Horizontal Menu */}
                        <Menu
                            mode="horizontal"
                            selectedKeys={[currentRoute.split('/')[0]]}
                            items={menuItems}
                            onClick={handleMenuClick}
                            className="aavatto-topbar-menu"
                            disabledOverflow={true}
                        />

                        {/* Version badge */}
                        <div className="aavatto-topbar-version">v1.0.0</div>
                    </Header>

                    {/* Page Content */}
                    <Content style={{ padding: "24px 0px", background: "#f9fafb", minHeight: "calc(100vh - 64px)" }}>
                        <div className="aavatto-content-wrapper">
                            {getComponentForRoute(currentRoute)}
                        </div>
                    </Content>
                </Layout>
            </ConfigProvider>

    );
};

export default App;
export { App };
