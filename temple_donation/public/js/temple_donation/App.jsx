import React, { useState, useEffect } from "react";
import { Layout, Menu, ConfigProvider, Avatar, Dropdown, Space, Drawer, Button } from "antd";
import { DashboardOutlined, UserOutlined, LogoutOutlined, MenuOutlined } from "@ant-design/icons";

// Centralized Configs
import { themeConfig } from "./config/theme";
import { getFilteredMenuItems, getComponentForRoute } from "./config/navigation";
import { useUser } from "./context/UserContext";

import "./styles.css";

const { Header, Content } = Layout;

const App = () => {
    const [currentRoute, setCurrentRoute] = useState("dashboard");
    const [mobileOpen, setMobileOpen] = useState(false);
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
        setMobileOpen(false);
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
                    {/* <Header className={`aavatto-topbar p-0 ${isAdmin ? 'is-admin' : ''}`}>
                        <div className="flex items-center w-full">
                            <div className="aavatto-topbar-brand">
                                <span>Temple Donation</span>
                            </div>
                            <Menu
                                mode="horizontal"
                                selectedKeys={[currentRoute.split('/')[0]]}
                                items={menuItems}
                                onClick={handleMenuClick}
                                className="aavatto-topbar-menu hidden md:flex justify-end"
                                disabledOverflow={true}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            {!isAdmin && (
                                <div className="aavatto-topbar-right hidden md:flex">
                                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                                        <div className="aavatto-user-profile">
                                            <Avatar
                                                src={user?.image}
                                                icon={!user?.image && <UserOutlined />}
                                                className="bg-zinc-100 text-zinc-900"
                                            />
                                            <span className="user-name-text text-zinc-900">{user?.name}</span>
                                        </div>
                                    </Dropdown>
                                </div>
                            )}
                            <Button
                                className="md:hidden flex items-center justify-center border-none shadow-none bg-transparent"
                                icon={<MenuOutlined style={{ fontSize: '20px' }} />}
                                onClick={() => setMobileOpen(true)}
                            />
                        </div>
                    </Header> */}
                    <Header className={`aavatto-topbar ${isAdmin ? 'is-admin' : ''}`}>
                        <div className="aavatto-header-inner flex justify-between items-center w-full">

                            <div className="aavatto-logo">
                                <img src="/assets/temple_donation/img/logo.svg" alt="Temple Donation" />
                            </div>

                            {/* CENTER - MENU */}
                            <div className="flex items-center">
                                <Menu
                                    mode="horizontal"
                                    selectedKeys={[currentRoute.split('/')[0]]}
                                    items={menuItems}
                                    onClick={handleMenuClick}
                                    className="aavatto-menu hidden md:flex"
                                />

                                {/* RIGHT - USER */}
                                <div className="aavatto-right">
                                    {!isAdmin && (
                                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                                            <div className="aavatto-user">
                                                <Avatar
                                                    src={user?.image}
                                                    icon={!user?.image && <UserOutlined />}
                                                />
                                                <span>{user?.name}</span>
                                            </div>
                                        </Dropdown>
                                    )}

                                    {/* Mobile button */}
                                    <Button
                                        className="md:hidden"
                                        icon={<MenuOutlined />}
                                        onClick={() => setMobileOpen(true)}
                                    />
                                </div>
                            </div>
                        </div>
                    </Header>

                    {/* Mobile Drawer */}
                    <Drawer
                        title={<img src="/assets/temple_donation/img/logo.png" alt="Temple Donation" style={{ height: '40px', objectFit: 'contain' }} />}
                        placement="right"
                        onClose={() => setMobileOpen(false)}
                        open={mobileOpen}
                        width={280}
                        bodyStyle={{ padding: 0 }}
                    >
                        <div className="flex flex-col h-full">
                            <Menu
                                mode="inline"
                                selectedKeys={[currentRoute.split('/')[0]]}
                                items={menuItems}
                                onClick={handleMenuClick}
                                className="border-none"
                            />

                            {!isAdmin && (
                                <div className="mt-auto p-4 border-t border-zinc-100">
                                    <div className="flex items-center gap-3 px-3 py-2">
                                        <Avatar src={user?.image} icon={<UserOutlined />} />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-zinc-900">{user?.name}</span>
                                            <span className="text-[10px] text-zinc-400 uppercase tracking-widest">{roles?.[0]}</span>
                                        </div>
                                    </div>
                                    <Menu
                                        mode="inline"
                                        items={userMenuItems}
                                        className="border-none mt-2"
                                    />
                                </div>
                            )}
                        </div>
                    </Drawer>

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
// export { App };


// import React, { useState, useEffect } from "react";
// import {
//     Layout, Menu, ConfigProvider, Avatar, Dropdown,
//     Space, Drawer, Button
// } from "antd";
// import {
//     UserOutlined, LogoutOutlined, MenuOutlined
// } from "@ant-design/icons";

// import { themeConfig } from "./config/theme";
// import { getFilteredMenuItems, getComponentForRoute } from "./config/navigation";
// import { useUser } from "./context/UserContext";

// import "./styles.css";

// const { Header, Content } = Layout;

// const App = () => {
//     const [currentRoute, setCurrentRoute] = useState("dashboard");
//     const [mobileOpen, setMobileOpen] = useState(false);

//     const { user, roles, logout, isAdmin } = useUser();

//     useEffect(() => {
//         const handleRoute = () => {
//             if (typeof frappe !== "undefined" && frappe.get_route) {
//                 const route = frappe.get_route();
//                 if (route[0] === "temple-donation") {
//                     const subRoute = route.slice(1).join("/");
//                     setCurrentRoute(subRoute || "dashboard");
//                 }
//             }
//         };

//         window.update_temple_donation_route = handleRoute;
//         window.addEventListener("hashchange", handleRoute);
//         handleRoute();

//         return () => {
//             window.removeEventListener("hashchange", handleRoute);
//             delete window.update_temple_donation_route;
//         };
//     }, []);

//     const handleMenuClick = ({ key }) => {
//         if (typeof frappe !== "undefined") {
//             frappe.set_route("temple-donation", key === "dashboard" ? "" : key);
//         }
//         setMobileOpen(false);
//     };

//     const userMenuItems = [
//         {
//             key: "profile",
//             label: "My Profile",
//             icon: <UserOutlined />,
//             onClick: () => frappe?.set_route("UserProfile", user?.email)
//         },
//         { type: "divider" },
//         {
//             key: "logout",
//             label: "Logout",
//             icon: <LogoutOutlined />,
//             danger: true,
//             onClick: logout
//         }
//     ];

//     const menuItems = getFilteredMenuItems(roles);

//     return (
//         <ConfigProvider theme={themeConfig}>
//             <Layout className="min-h-screen">

//                 {/* 🔥 HEADER */}
//                 <Header className="flex items-center justify-between px-4 border-b bg-white">

//                     {/* LEFT */}
//                     <div className="flex items-center gap-4">
//                         <span className="font-bold text-lg">Temple Donation</span>
//                     </div>

//                     {/* 🔥 DESKTOP MENU (RIGHT SIDE) */}
//                     <div className="hidden md:flex items-center gap-6">

//                         <Menu
//                             mode="horizontal"
//                             selectedKeys={[currentRoute.split('/')[0]]}
//                             items={menuItems}
//                             onClick={handleMenuClick}
//                         />

//                         {!isAdmin && (
//                             <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
//                                 <Space className="cursor-pointer">
//                                     <Avatar
//                                         src={user?.image}
//                                         icon={<UserOutlined />}
//                                     />
//                                     <span>{user?.name}</span>
//                                 </Space>
//                             </Dropdown>
//                         )}
//                     </div>

//                     {/* 🔥 MOBILE MENU BUTTON */}
//                     <div className="md:hidden">
//                         <Button
//                             icon={<MenuOutlined />}
//                             onClick={() => setMobileOpen(true)}
//                         />
//                     </div>

//                 </Header>

//                 {/* 🔥 MOBILE DRAWER */}
//                 <Drawer
//                     title="Menu"
//                     placement="right"
//                     onClose={() => setMobileOpen(false)}
//                     open={mobileOpen}
//                 >
//                     <Menu
//                         mode="vertical"
//                         selectedKeys={[currentRoute.split('/')[0]]}
//                         items={menuItems}
//                         onClick={handleMenuClick}
//                     />

//                     {!isAdmin && (
//                         <div className="mt-6 border-t pt-4">
//                             <Dropdown menu={{ items: userMenuItems }}>
//                                 <Space>
//                                     <Avatar icon={<UserOutlined />} />
//                                     <span>{user?.name}</span>
//                                 </Space>
//                             </Dropdown>
//                         </div>
//                     )}
//                 </Drawer>

//                 {/* 🔥 CONTENT */}
//                 <Content className="p-4 md:p-6">
//                     {getComponentForRoute(currentRoute, roles)}
//                 </Content>

//             </Layout>
//         </ConfigProvider>
//     );
// };

// export default App;