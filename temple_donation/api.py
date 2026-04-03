import frappe
from frappe import _


@frappe.whitelist()
def create_donation(data):
    """
    Create a Donation record from the POS interface.
    Accepts a dict with: donor, donor_name, temple, payment_mode,
    total_amount, and items (list of donation_type + amount).
    """
    if isinstance(data, str):
        import json
        data = json.loads(data)

    if not data.get("donor"):
        frappe.throw(_("Donor is required"))

    if not data.get("items"):
        frappe.throw(_("At least one donation item is required"))

    # Create new Donation document
    doc = frappe.new_doc("Donation")
    doc.donor = data.get("donor")
    doc.donor_name = data.get("donor_name")
    doc.temple = data.get("temple")
    doc.payment_mode = data.get("payment_mode", "Cash")
    doc.total_amount = data.get("total_amount", 0)

    # Add child table items
    for item in data.get("items", []):
        doc.append("donation_items", {
            "donation_type": item.get("donation_type"),
            "amount": item.get("amount", 0),
        })

    doc.insert(ignore_permissions=True)
    frappe.db.commit()

    return {"name": doc.name, "message": "Donation created successfully"}
