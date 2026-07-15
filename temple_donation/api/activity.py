import frappe
from frappe import _

@frappe.whitelist()
def get_activity_log(doctype, docname, limit_start=0, limit_page_length=5):
    # Check permission on the parent document
    if not frappe.has_permission(doctype, "read", docname):
        frappe.throw(_("Not permitted to view this document's activity"), frappe.PermissionError)
    
    try:
        limit_start = int(limit_start)
    except (ValueError, TypeError):
        limit_start = 0

    try:
        limit_page_length = int(limit_page_length)
    except (ValueError, TypeError):
        limit_page_length = 5

    # Fetch Version records
    versions = frappe.get_all(
        "Version",
        filters={
            "ref_doctype": doctype,
            "docname": docname
        },
        fields=["name", "owner", "creation", "data", "ref_doctype", "docname"],
        order_by="creation desc",
        start=limit_start,
        page_length=limit_page_length
    )

    # Fetch Comment records
    comments = frappe.get_all(
        "Comment",
        filters={
            "reference_doctype": doctype,
            "reference_name": docname,
            "comment_type": "Comment"
        },
        fields=["name", "owner", "creation", "content", "subject", "reference_doctype", "reference_name", "comment_by"],
        order_by="creation desc"
    )

    return {
        "versions": versions,
        "comments": comments
    }
