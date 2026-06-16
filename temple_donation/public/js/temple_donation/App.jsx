import React, { useState, useEffect } from "react";
import { Layout, Menu, ConfigProvider, Avatar, Dropdown, Space, Drawer, Button, Spin } from "antd";
import { DashboardOutlined, UserOutlined, LogoutOutlined, MenuOutlined } from "@ant-design/icons";

// Centralized Configs
import { themeConfig } from "./config/theme";
import { getFilteredMenuItems, getComponentForRoute } from "./config/navigation";
import { useUser } from "./context/UserContext";
import TempleFlagLoader from "./components/common/TempleFlagLoader";

import "./styles.css";

// Configure default global loading indicator for all Ant Design Spin instances
Spin.setDefaultIndicator(<TempleFlagLoader size="small" />);

const { Header, Content } = Layout;

const App = () => {
    const [currentRoute, setCurrentRoute] = useState("dashboard");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
    const { user, roles, logout, isAdmin, loading } = useUser();

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isMobile = windowWidth < 768;

    useEffect(() => {
        if (!loading) {
            // Remove the static initial loader from document.body if present
            const initLoader = document.getElementById("temple-initial-loader");
            if (initLoader) {
                initLoader.remove();
            }
        }
    }, [loading]);

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

    const headerStyle = {
        background: "#ffffff",
        borderBottom: "1px solid #e4e4e7",
        height: "70px",
        lineHeight: "70px",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)"
    };

    const headerInnerStyle = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        maxWidth: "1536px",
        marginLeft: "auto",
        marginRight: "auto"
    };

    const logoContainerStyle = {
        display: "flex",
        alignItems: "center",
        height: "70px",
        flexShrink: 0
    };

    const logoImgStyle = {
        height: "38px",
        width: "auto",
        objectFit: "contain",
        display: "block"
    };

    const rightContainerStyle = {
        display: "flex",
        alignItems: "center",
        gap: "24px"
    };

    const menuStyle = {
        border: "none",
        background: "transparent",
        lineHeight: "70px",
        minWidth: "400px"
    };

    const rightActionsStyle = {
        display: "flex",
        alignItems: "center",
        gap: "16px"
    };

    const userProfileStyle = {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        fontWeight: 500,
        color: "#18181b",
        padding: "4px 8px",
        borderRadius: "6px"
    };

    if (loading) {
        return null;
    }

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
                    <Header style={headerStyle}>
                        <div style={headerInnerStyle}>

                            <div style={logoContainerStyle}>
                                <img src="/assets/temple_donation/img/logo.svg" alt="Temple Donation" style={logoImgStyle} />
                            </div>

                            {/* CENTER & RIGHT - MENU */}
                            <div style={rightContainerStyle}>
                                {!isMobile && (
                                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                        {menuItems.map(item => {
                                            const isActive = currentRoute.split('/')[0] === item.key;
                                            return (
                                                <button
                                                    key={item.key}
                                                    onClick={() => handleMenuClick({ key: item.key })}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        borderBottom: isActive ? '3px solid #ca8a04' : '3px solid transparent',
                                                        padding: '8px 4px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        color: isActive ? '#18181b' : '#71717a',
                                                        transition: 'all 0.2s',
                                                        outline: 'none',
                                                        height: '70px',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    {item.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* RIGHT ACTIONS - USER / MOBILE */}
                                <div style={rightActionsStyle}>
                                    {!isAdmin && !isMobile && (
                                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                                            <div style={userProfileStyle}>
                                                <Avatar
                                                    src={user?.image}
                                                    icon={!user?.image && <UserOutlined />}
                                                />
                                                <span>{user?.name}</span>
                                            </div>
                                        </Dropdown>
                                    )}

                                    {/* Mobile Hamburger Button */}
                                    {isMobile && (
                                        <Button
                                            icon={<MenuOutlined />}
                                            onClick={() => setMobileOpen(true)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid #e4e4e7',
                                                background: '#ffffff',
                                                color: '#18181b',
                                                borderRadius: '6px',
                                                width: '40px',
                                                height: '40px'
                                            }}
                                        />
                                    )}
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
                        <div className="flex flex-col h-full" style={{ padding: '20px 0' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {menuItems.map(item => {
                                    const isActive = currentRoute.split('/')[0] === item.key;
                                    return (
                                        <button
                                            key={item.key}
                                            onClick={() => {
                                                handleMenuClick({ key: item.key });
                                                setMobileOpen(false);
                                            }}
                                            style={{
                                                background: isActive ? '#f4f4f5' : 'transparent',
                                                border: 'none',
                                                borderLeft: isActive ? '4px solid #ca8a04' : '4px solid transparent',
                                                padding: '12px 24px',
                                                cursor: 'pointer',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                                color: isActive ? '#18181b' : '#52525b',
                                                textAlign: 'left',
                                                transition: 'all 0.2s',
                                                outline: 'none',
                                                width: '100%'
                                            }}
                                        >
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {!isAdmin && (
                                <div className="mt-auto p-4 border-t border-zinc-100">
                                    <div className="flex items-center gap-3 px-3 py-2 mb-3">
                                        <Avatar src={user?.image} icon={<UserOutlined />} />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-zinc-900">{user?.name}</span>
                                            <span className="text-[10px] text-zinc-400 uppercase tracking-widest">{roles?.[0]}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={logout}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            width: '100%',
                                            background: 'none',
                                            border: 'none',
                                            padding: '10px 12px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            color: '#ef4444',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            textAlign: 'left',
                                            outline: 'none'
                                        }}
                                    >
                                        <LogoutOutlined />
                                        <span>Logout</span>
                                    </button>
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