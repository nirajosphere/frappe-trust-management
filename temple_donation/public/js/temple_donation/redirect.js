$(document).ready(() => {
    // Check if user is logged in

    console.log("Hello")

    if (frappe.session.user && frappe.session.user !== "Guest") {

        const check_and_redirect = () => {
            const roles = frappe.user_roles || [];
            const isAdmin = roles.includes("System Manager") || frappe.session.user === "Administrator";

            if (!isAdmin) {
                const current_route = frappe.get_route();
                const route_base = current_route ? current_route[0] : "";

                // Redirect if not on temple-donation or allowed system pages
                if (route_base !== "temple-donation" && route_base !== "login" && route_base !== "logout") {
                    console.log("Access Restricted: Redirecting to Application...");
                    frappe.set_route("temple-donation");
                }

                // Force Hide Frappe UI Elements
                setTimeout(() => {
                    const navbar = document.querySelector(".navbar");
                    const sidebar = document.querySelector(".layout-side-section, .page-side-bar");
                    const desk_container = document.querySelector(".desk-container");

                    if (navbar) navbar.style.setProperty('display', 'none', 'important');
                    if (sidebar) sidebar.style.setProperty('display', 'none', 'important');

                    // Add class to body for CSS-based hiding fallback
                    document.body.classList.add("non-admin-user");
                }, 100);
            }
        };

        // Initial check
        check_and_redirect();

        // Listen for internal Frappe route changes
        frappe.router.on("change", () => {
            check_and_redirect();
        });
    }
});
