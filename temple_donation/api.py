import frappe
from frappe import _

@frappe.whitelist()
def get_user_balances():
    """
    Fetch a list of active users and calculate their current cash sum from donations.
    """
    users = frappe.get_all("User", filters={"enabled": 1}, fields=["name as user_name", "full_name"])
    
    # Calculate the total cash amount for each user using SQL for better precision
    for user in users:
        result = frappe.db.sql("""
            SELECT SUM(total_amount) 
            FROM `tabDonation` 
            WHERE owner = %s AND payment_mode = 'Cash'
        """, (user.user_name,))
        
        user["opening_balance"] = result[0][0] if result and result[0][0] else 0
        
    return users

@frappe.whitelist()
def reset_user_balance(user_name):
    """
    Resets the cash balance for a specific user.
    Simulated implementation for the UI.
    """
    return {"status": "success", "message": f"Cash balance reset for {user_name}"}

@frappe.whitelist()
def create_donation(data):
    """
    Create a Donation record from the POS interface.
    """
    if isinstance(data, str):
        import json
        data = json.loads(data)

    if not data.get("donor"):
        frappe.throw(_("Donor is required"))

    if not data.get("items"):
        frappe.throw(_("At least one donation item is required"))

    doc = frappe.new_doc("Donation")
    doc.donor = data.get("donor")
    doc.donor_name = data.get("donor_name")
    doc.temple = data.get("temple")
    doc.payment_mode = data.get("payment_mode", "Cash")
    doc.total_amount = data.get("total_amount", 0)

    for item in data.get("items", []):
        doc.append("donation_items", {
            "donation_type": item.get("donation_type"),
            "amount": item.get("amount", 0),
        })

    doc.insert(ignore_permissions=True)
    frappe.db.commit()

    return {"name": doc.name, "message": "Donation created successfully"}
