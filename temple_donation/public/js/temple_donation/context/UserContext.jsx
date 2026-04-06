import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (typeof frappe !== 'undefined') {
                // In Frappe, session info is usually available globally
                const currentUser = frappe.session.user;
                const userRoles = frappe.user_roles || [];

                setUser({
                    name: frappe.session.user_fullname || currentUser,
                    email: currentUser,
                    image: frappe.boot.user_info[currentUser]?.image
                });
                setRoles(userRoles);

                // Logic to hide/show Frappe Header
                // Check if user has any of the specific roles
                const hasCustomRole = userRoles.some(role =>
                    ['Super Admin', 'Temple Admin', 'Cashier'].includes(role)
                );

                const isAdministrator = currentUser === 'Administrator' || userRoles.includes('Administrator') || userRoles.includes('System Manager');

                if (hasCustomRole && !isAdministrator) {
                    // Hide Frappe Navbar and Sidebar for custom roles
                    const navbar = document.querySelector('.navbar');
                    const sidebar = document.querySelector('.page-side-bar');
                    const container = document.querySelector('.page-container');
                    const wsHeader = document.querySelector('.standard-header-section');

                    if (navbar) navbar.style.display = 'none';
                    if (sidebar) sidebar.style.display = 'none';
                    if (container) {
                        container.style.paddingTop = '0px';
                        container.style.marginLeft = '0px';
                    }
                    if (wsHeader) wsHeader.style.display = 'none';
                } else {
                    // Explicitly show Frappe Header for Administrators
                    const navbar = document.querySelector('.navbar');
                    const sidebar = document.querySelector('.page-side-bar');
                    if (navbar) navbar.style.display = 'flex';
                    if (sidebar) sidebar.style.display = 'block';
                }
            }
            setLoading(false);
        };

        fetchUserData();
        console.log("UserContext.jsx: fetchUserData called in side effect");
    }, []);

    const logout = () => {
        if (typeof frappe !== 'undefined') {
            frappe.app.logout();
        }
    };

    console.log("user context run")

    const value = {
        user,
        roles,
        loading,
        logout,
        isSuperAdmin: roles.includes('Super Admin'),
        isTempleAdmin: roles.includes('Temple Admin'),
        isCashier: roles.includes('Cashier'),
        isAdmin: user?.email === 'Administrator' || roles.includes('Administrator') || roles.includes('System Manager'),
        hasRole: (roleList) => roleList.some(role => roles.includes(role))
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
