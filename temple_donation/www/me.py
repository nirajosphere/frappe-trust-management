import frappe

def get_context(context):
    """Context for custom profile page."""
    if frappe.session.user == "Guest":
        frappe.throw("Please login to access this page", frappe.PermissionError)

    user = frappe.get_doc("User", frappe.session.user)
    context.user_doc = user
    context.no_cache = 1
    context.show_sidebar = False
