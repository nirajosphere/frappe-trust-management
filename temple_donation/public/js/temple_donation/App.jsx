import React, { useState, useEffect } from "react";
import { Layout, Menu, ConfigProvider, Avatar, Dropdown, Space, Drawer, Button, Spin, App as AntApp } from "antd";
import { 
    DashboardOutlined, 
    UserOutlined, 
    LogoutOutlined, 
    MenuOutlined, 
    SettingOutlined,
    BankOutlined,
    SafetyCertificateOutlined,
    HomeOutlined,
    AppstoreOutlined,
    HeartOutlined,
    TeamOutlined,
    TagsOutlined,
    DatabaseOutlined,
    InboxOutlined,
    EnvironmentOutlined,
    ProfileOutlined,
    CalendarOutlined,
    BellOutlined,
    FileTextOutlined,
    FileProtectOutlined
} from "@ant-design/icons";
import { ChevronDown, X } from "lucide-react";

const getIconForNavItem = (key) => {
    switch (key) {
        case "dashboard":
            return <DashboardOutlined />;
        case "finance-group":
        case "ledger":
            return <BankOutlined />;
        case "user-management-group":
        case "users":
            return <UserOutlined />;
        case "role-permissions":
            return <SafetyCertificateOutlined />;
        case "trust-mgmt":
        case "temples":
            return <HomeOutlined />;
        case "rooms":
            return <AppstoreOutlined />;
        case "donations-group":
        case "donations":
            return <HeartOutlined />;
        case "donors":
            return <TeamOutlined />;
        case "donation-types":
            return <TagsOutlined />;
        case "inventory-group":
        case "inventory-dashboard":
            return <DatabaseOutlined />;
        case "items":
            return <InboxOutlined />;
        case "item-categories":
            return <AppstoreOutlined />;
        case "store-locations":
            return <EnvironmentOutlined />;
        case "inventory-entries":
            return <ProfileOutlined />;
        case "general-settings":
            return <SettingOutlined />;
        case "booking-settings":
            return <CalendarOutlined />;
        case "notification-settings":
            return <BellOutlined />;
        case "document-templates":
            return <FileTextOutlined />;
        case "receipt-settings":
            return <FileProtectOutlined />;
        default:
            return <SettingOutlined />;
    }
};

// Centralized Configs
import { themeConfig } from "./config/theme";
import { getFilteredMenuItems, getGroupedMenuItems, getComponentForRoute, getFilteredSettingsItems } from "./config/navigation";
import { useUser } from "./context/UserContext";
import TempleFlagLoader from "./components/common/TempleFlagLoader";
import NotificationDropdown from "./components/common/NotificationDropdown";

import "./styles.css";

// Configure default global loading indicator for all Ant Design Spin instances
Spin.setDefaultIndicator(<TempleFlagLoader size="small" />);

const { Header, Content } = Layout;

const App = () => {
    const [currentRoute, setCurrentRoute] = useState("dashboard");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
    const { user, roles, permissions, logout, isSystemManager, loading } = useUser();

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isMobile = windowWidth < 1150;

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

        if (typeof frappe !== "undefined" && frappe.router) {
            frappe.router.on("change", handleRoute);
        }

        handleRoute();

        return () => {
            window.removeEventListener("hashchange", handleRoute);
            if (typeof frappe !== "undefined" && frappe.router && typeof frappe.router.off === "function") {
                frappe.router.off("change", handleRoute);
            }
            delete window.update_temple_donation_route;
        };
    }, []);

    const handleMenuClick = ({ key }) => {
        if (typeof frappe !== "undefined") {
            frappe.set_route("temple-donation", key === "dashboard" ? "" : key);
        }
        setMobileOpen(false);
    };

    const settingsItems = getFilteredSettingsItems(roles, permissions);

    const userMenuItems = [
        {
            key: 'profile',
            label: 'My Profile',
            icon: <UserOutlined />,
            onClick: () => {
                if (typeof window !== 'undefined') {
                    window.location.href = '/me';
                }
            }
        }
    ];



    userMenuItems.push(
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
    );

    // Navigation items filtered by role
    const menuItems = getFilteredMenuItems(roles, permissions);
    const groupedMenuItems = getGroupedMenuItems(roles, permissions);

    const menuItemsForDrawer = [
        {
            type: 'group',
            label: 'Platform',
            key: 'platform-group',
            children: groupedMenuItems.map(group => {
                const isSingle = group.isSingle || (group.children && group.children.length === 1);
                if (isSingle) {
                    const targetKey = group.isSingle ? group.key : group.children[0].key;
                    const label = group.isSingle ? group.label : group.children[0].label;
                    return {
                        key: targetKey,
                        icon: getIconForNavItem(targetKey),
                        label: label
                    };
                }
                return {
                    key: group.key,
                    icon: getIconForNavItem(group.key),
                    label: group.label,
                    children: group.children.map(child => ({
                        key: child.key,
                        icon: getIconForNavItem(child.key),
                        label: child.label
                    }))
                };
            })
        }
    ];

    if (settingsItems.length > 0) {
        menuItemsForDrawer.push({
            key: 'settings-collapsible',
            icon: <SettingOutlined />,
            label: 'Settings',
            children: settingsItems.map(item => ({
                key: item.key,
                icon: getIconForNavItem(item.key),
                label: item.label
            }))
        });
    }

    const headerStyle = {
        background: "#ffffff",
        height: "56px",
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        borderBottom: "1px solid #e4e4e7",
        position: "fixed",
        top: isSystemManager ? "48px" : 0,
        left: 0,
        zIndex: 50
    };

    const headerInnerStyle = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        height: "100%",
        padding: "0 1rem"
    };

    const logoContainerStyle = {
        display: "flex",
        alignItems: "center",
        height: "100%",
        flexShrink: 0
    };

    const logoImgStyle = {
        height: "56px",
        width: "auto",
        objectFit: "contain",
        display: "block"
    };

    const desktopGap = windowWidth < 1200 ? "12px" : "24px";

    const rightContainerStyle = {
        display: "flex",
        alignItems: "stretch",
        gap: desktopGap,
        height: "100%"
    };

    const menuStyle = {
        border: "none",
        background: "transparent",
        minWidth: "400px",
        height: "100%"
    };

    const rightActionsStyle = {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        height: "100%"
    };

    const userProfileStyle = {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        fontWeight: 500,
        color: "#18181b",
        padding: "4px 8px",
        borderRadius: "6px",
        height: "36px"
    };

    if (loading) {
        return null;
    }

    return (
        <ConfigProvider theme={themeConfig}>
            <AntApp>
                <div className={`temple-donation-app ${isSystemManager ? 'is-admin' : ''}`}>
                    <Layout className={`min-h-screen`} style={{ paddingTop: '64px' }}>
                        {/* Custom Top Navigation Bar */}
                        {/* <Header className={`aavatto-topbar p-0 ${isAdmin ? 'is-admin' : ''}`}>
                        <div className="flex items-center w-full">
                            <div className="aavatto-topbar-brand">
                                <span>Trust Management</span>
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
                            <div className="container" style={headerInnerStyle}>

                                <div style={logoContainerStyle}>
                                    <img src="/assets/temple_donation/img/logo.svg" alt="Trust Management" style={logoImgStyle} />
                                </div>

                                <div style={rightContainerStyle}>
                                    {!isMobile && (
                                        <div style={{ display: 'flex', gap: desktopGap, alignItems: 'stretch', height: '100%' }}>
                                            {groupedMenuItems.map(group => {
                                                const isSingle = group.isSingle || (group.children && group.children.length === 1);

                                                if (isSingle) {
                                                    const targetKey = group.isSingle ? group.key : group.children[0].key;
                                                    const label = group.isSingle ? group.label : group.children[0].label;
                                                    const isActive = currentRoute.split('/')[0] === targetKey;

                                                    return (
                                                        <button
                                                            key={targetKey}
                                                            onClick={() => handleMenuClick({ key: targetKey })}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                borderBottom: isActive ? '3px solid #18181b' : '3px solid transparent',
                                                                padding: '0 4px',
                                                                cursor: 'pointer',
                                                                fontSize: windowWidth < 1200 ? '13px' : '14px',
                                                                fontWeight: '600',
                                                                color: isActive ? '#18181b' : '#71717a',
                                                                transition: 'all 0.2s',
                                                                outline: 'none',
                                                                height: '100%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            {label}
                                                        </button>
                                                    );
                                                }

                                                const isGroupActive = group.children.some(child => currentRoute.split('/')[0] === child.key);
                                                const dropdownMenuProps = {
                                                    items: group.children.map(child => ({
                                                        key: child.key,
                                                        label: child.label
                                                    })),
                                                    onClick: handleMenuClick,
                                                    selectable: true,
                                                    selectedKeys: [currentRoute.split('/')[0]]
                                                };

                                                return (
                                                    <Dropdown key={group.key} menu={dropdownMenuProps} placement="bottomLeft">
                                                        <button
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                borderBottom: isGroupActive ? '3px solid #18181b' : '3px solid transparent',
                                                                padding: '0 4px',
                                                                cursor: 'pointer',
                                                                fontSize: windowWidth < 1200 ? '13px' : '14px',
                                                                fontWeight: '600',
                                                                color: isGroupActive ? '#18181b' : '#71717a',
                                                                transition: 'all 0.2s',
                                                                outline: 'none',
                                                                height: '100%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            <span>{group.label}</span>
                                                            <ChevronDown size={14} style={{ color: isGroupActive ? '#18181b' : '#71717a' }} />
                                                        </button>
                                                    </Dropdown>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div style={rightActionsStyle}>
                                        {user && (
                                            <NotificationDropdown currentUser={user.email || user.name} />
                                        )}
                                        {settingsItems.length > 0 && !isMobile && (
                                            <Dropdown
                                                menu={{
                                                    items: settingsItems.map(item => ({
                                                        key: item.key,
                                                        label: item.label
                                                    })),
                                                    onClick: handleMenuClick,
                                                    selectedKeys: [currentRoute.split('/')[0]],
                                                    selectable: true
                                                }}
                                                placement="bottomRight"
                                                arrow
                                            >
                                                <div 
                                                    style={{ 
                                                        cursor: "pointer", 
                                                        display: "flex", 
                                                        alignItems: "center", 
                                                        padding: "8px",
                                                        borderRadius: "8px"
                                                    }} 
                                                    className="hover:bg-zinc-50"
                                                >
                                                    <SettingOutlined style={{ fontSize: "20px", color: "#18181b" }} />
                                                </div>
                                            </Dropdown>
                                        )}
                                        {user && !isMobile && (
                                            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                                                <div style={userProfileStyle} className="hover:bg-zinc-50">
                                                    <Avatar
                                                        src={user?.image}
                                                        icon={!user?.image && <UserOutlined />}
                                                    />
                                                    <span style={{ fontSize: "14px", color: "#18181b", fontWeight: "600" }}>{user?.name}</span>
                                                    <ChevronDown size={14} style={{ color: "#71717a" }} />
                                                </div>
                                            </Dropdown>
                                        )}

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

                        <Drawer
                            placement="right"
                            onClose={() => setMobileOpen(false)}
                            open={mobileOpen}
                            width={270}
                            closable={false}
                            styles={{ 
                                body: { 
                                    padding: 0, 
                                    backgroundColor: '#ffffff',
                                    color: '#18181b'
                                } 
                            }}
                            className="temple-donation-drawer"
                        >
                            <div className="temple-donation-drawer-container" style={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                background: '#ffffff',
                                color: '#18181b',
                                fontFamily: 'Inter, sans-serif'
                            }}>
                                {/* Drawer Header */}
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between', 
                                    padding: '16px 12px 16px 16px', 
                                    borderBottom: '1px solid #f4f4f5',
                                    background: '#ffffff'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ 
                                            width: '32px', 
                                            height: '32px', 
                                            borderRadius: '8px', 
                                            background: '#f97316', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            color: '#ffffff',
                                            fontWeight: 'bold',
                                            fontSize: '15px'
                                        }}>
                                            T
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#18181b', lineHeight: '1.2' }}>Trust Management</span>
                                            <span style={{ fontSize: '11px', color: '#71717a', lineHeight: '1.2' }}>Enterprise</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setMobileOpen(false)}
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            cursor: 'pointer', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            padding: '6px', 
                                            borderRadius: '6px', 
                                            color: '#71717a' 
                                        }}
                                        className="drawer-close-btn"
                                    >
                                        <X size={16} style={{ color: '#71717a' }} />
                                    </button>
                                </div>

                                {/* Menu section */}
                                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }} className="drawer-menu-scrollable">
                                    <Menu
                                        mode="inline"
                                        theme="light"
                                        selectedKeys={[currentRoute.split('/')[0]]}
                                        defaultOpenKeys={[...groupedMenuItems.map(g => g.key), 'settings-collapsible']}
                                        onClick={({ key }) => {
                                            handleMenuClick({ key });
                                            setMobileOpen(false);
                                        }}
                                        style={{ 
                                            border: 'none',
                                            background: 'transparent'
                                        }}
                                        items={menuItemsForDrawer}
                                    />
                                </div>

                                {/* Drawer Footer */}
                                {user && (
                                    <div style={{ 
                                        padding: '16px 12px', 
                                        borderTop: '1px solid #f4f4f5', 
                                        background: '#ffffff', 
                                        flexShrink: 0 
                                    }}>
                                        <Dropdown 
                                            menu={{ 
                                                items: [
                                                    {
                                                        key: 'profile',
                                                        label: 'My Profile',
                                                        icon: <UserOutlined />,
                                                        onClick: () => {
                                                            if (typeof window !== 'undefined') {
                                                                window.location.href = '/me';
                                                            }
                                                        }
                                                    },
                                                    {
                                                        type: 'divider'
                                                    },
                                                    {
                                                        key: 'logout',
                                                        label: 'Log out',
                                                        icon: <LogoutOutlined />,
                                                        danger: true,
                                                        onClick: () => {
                                                            logout();
                                                            setMobileOpen(false);
                                                        }
                                                    }
                                                ]
                                            }} 
                                            placement="topLeft"
                                            trigger={['click']}
                                            overlayClassName="drawer-footer-dropdown"
                                        >
                                            <div 
                                                style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'space-between',
                                                    gap: '8px', 
                                                    cursor: 'pointer',
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    width: '100%',
                                                    textAlign: 'left'
                                                }}
                                                className="drawer-user-card"
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                                    <Avatar
                                                        src={user?.image}
                                                        icon={!user?.image && <UserOutlined />}
                                                        size={32}
                                                        style={{ flexShrink: 0 }}
                                                    />
                                                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#18181b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: '1.2' }}>
                                                            {user?.name || 'User'}
                                                        </span>
                                                        <span style={{ fontSize: '11px', color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: '1.2' }}>
                                                            {user?.email || ''}
                                                        </span>
                                                    </div>
                                                </div>
                                                <ChevronDown size={14} style={{ color: '#71717a', flexShrink: 0 }} />
                                            </div>
                                        </Dropdown>
                                    </div>
                                )}
                            </div>
                        </Drawer>

                        {/* Page Content */}
                        <Content className="bg-transparent py-8">
                            <div className="aavatto-content-wrapper">
                                {getComponentForRoute(currentRoute, roles, permissions)}
                            </div>
                        </Content>
                    </Layout>
                </div>
            </AntApp>
        </ConfigProvider>
    );
};


export default App;