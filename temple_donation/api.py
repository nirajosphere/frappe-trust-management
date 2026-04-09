import frappe
from frappe import _
from frappe.utils import flt, nowdate, now_datetime

@frappe.whitelist()
def get_user_balances():
    """
    Fetch a list of active users and calculate their current cash sum from donations
    SINCE the last handover (recorded in Ledger).
    """
    users = frappe.get_all("User", filters={"enabled": 1}, fields=["name as user_name", "full_name"])
    
    # For each user, find the last reset date/time from the 'Ledger' doctype
    for user in users:
        last_reset = frappe.db.get_value("Ledger", 
                                        filters={"user": user.user_name}, 
                                        fieldname="max(reset_date)")
        
        # Calculate sum since last reset (using Datetime for 1-second precision)
        if last_reset:
            result = frappe.db.sql("""
                SELECT SUM(total_amount) 
                FROM `tabDonation` 
                WHERE owner = %s 
                  AND payment_mode = 'Cash' 
                  AND creation > %s
            """, (user.user_name, last_reset))
        else:
            # If no reset ever happened, fetch everything
            result = frappe.db.sql("""
                SELECT SUM(total_amount) 
                FROM `tabDonation` 
                WHERE owner = %s AND payment_mode = 'Cash'
            """, (user.user_name,))
        
        user["opening_balance"] = result[0][0] if result and result[0][0] else 0
        
    return users

@frappe.whitelist()
def reset_user_balance(user_name, amount):
    """
    Resets the cash balance for a specific user and records it in Ledger.
    """
    if not user_name:
        frappe.throw("User Name is required for reset")
        
    # Standardize amount
    f_amount = flt(amount)
        
    # Create the Ledger entry
    doc = frappe.get_doc({
        "doctype": "Ledger",
        "user": user_name,
        "user_name": frappe.db.get_value("User", user_name, "full_name"),
        "opening_balance": f_amount,
        "reset_date": frappe.utils.now_datetime()
    })
    doc.insert(ignore_permissions=True)
    frappe.db.commit()
    
    # Return success
    return {"status": "success", "message": f"Recorded handover of ₹{f_amount} for {user_name}"}

@frappe.whitelist()
def get_dashboard_stats():
    """
    Returns core stats for the dashboard.
    Total Donation = (Sum of Handed-over Cash from Ledger) + (Sum of non-Cash donations).
    """
    # 1. Handed-over Cash from Ledger
    handed_over_cash = frappe.db.get_value("Ledger", filters={}, fieldname="sum(opening_balance)") or 0
    
    # 2. Direct non-cash donations (Online/Bank/Card)
    direct_donations = frappe.db.get_value("Donation", 
                                          filters={"payment_mode": ["!=", "Cash"]}, 
                                          fieldname="sum(total_amount)") or 0
                                          
    total_donation = handed_over_cash + direct_donations
    
    # 2. Top Category
    top_cat_result = frappe.db.sql("""
        SELECT donation_type, SUM(amount) as total 
        FROM `tabDonation Item` 
        GROUP BY donation_type 
        ORDER BY total DESC 
        LIMIT 1
    """, as_dict=True)
    top_category = top_cat_result[0].donation_type if top_cat_result else "N/A"
    
    # 3. New Donors Today
    from frappe.utils import nowdate
    new_donors = frappe.db.count("Donor", filters={"creation": (">=", nowdate())})
    
    return {
        "total_donation": total_donation,
        "top_category": top_category,
        "new_donors": new_donors
    }

@frappe.whitelist()
def get_donations_by_type():
    """
    Returns donation breakdown for pie chart.
    """
    return frappe.db.sql("""
        SELECT donation_type as type, SUM(amount) as value 
        FROM `tabDonation Item` 
        GROUP BY donation_type 
        ORDER BY value DESC
    """, as_dict=True)

@frappe.whitelist()
def get_top_donors():
    """
    Returns top 10 donors by total contribution.
    """
    return frappe.db.sql("""
        SELECT donor_name as name, SUM(total_amount) as total 
        FROM `tabDonation` 
        GROUP BY donor_name 
        ORDER BY total DESC 
        LIMIT 10
    """, as_dict=True)

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

@frappe.whitelist()
def sync_user_roles(doc, method=None):
    """
    Automatically assigns Frappe Roles based on the custom_user_role field.
    Mapped to before_save hook in hooks.py.
    """
    if not doc.get("custom_user_role"):
        return
        
    role_map = {
        "Super Admin": "System Manager",
        "Temple Admin": "Temple Admin",
        "Cashier": "Cashier"
    }
    
    # Identify the target role from our custom field
    selected_role = doc.custom_user_role.strip()
    target_role = role_map.get(selected_role)
    
    if not target_role:
        return

    # List of roles we manage via this custom field
    managed_roles = list(role_map.values())
    
    # Get current roles set on the user
    current_roles = [r.role for r in doc.roles]
    
    # If the user doesn't have the target role, sync it
    if target_role not in current_roles:
        # 1. Remove other previously managed roles to keep it exclusive to the selection
        filtered_roles = [r for r in doc.roles if r.role not in managed_roles or r.role == target_role]
        doc.set("roles", filtered_roles)
        
        # 2. Add the target role
        doc.append("roles", {"role": target_role})
        
        # 3. Ensure user type is System User for desk access
        doc.user_type = "System User"
        
        # Note: No doc.save() here as this is a before_save hook. 
        # Modifications to the doc object will be persisted automatically.
