import frappe
from frappe import _
from frappe.utils import flt, nowdate, now_datetime

@frappe.whitelist()
def get_user_balances():
    """
    Fetch a list of active users and calculate their current cash sum from donations
    SINCE the last handover (recorded in Ledger).
    Excludes Administrator and Guest users.
    """
    users = frappe.get_all("User", 
        filters={
            "enabled": 1, 
            "name": ["not in", ["Administrator", "Guest"]]
        }, 
        fields=["name as user_name", "full_name", "custom_user_role", "user_image"])
    
    # For each user, find the last reset date/time from the 'Ledger' doctype
    for user in users:
        # Fetch assigned temples and enrich with names
        temples = frappe.get_all("Temple Details", 
            filters={"parent": user.user_name}, 
            fields=["temple"])
        
        for t in temples:
            t["temple_name"] = frappe.db.get_value("Temple", t.temple, "temple_name") or t.temple
            
        user["custom_select_temple"] = temples

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
def get_dashboard_stats(temple=None, user=None, from_date=None, to_date=None):
    """
    Returns core stats for the dashboard.
    Total Donation = (Sum of Handed-over Cash from Ledger) + (Sum of non-Cash donations).
    """
    filters = {}
    if temple:
        filters["temple"] = temple
    if user:
        filters["cashier"] = user
    if from_date and to_date:
        filters["creation"] = ["between", [from_date, to_date]]
    elif from_date:
        filters["creation"] = [">=", from_date]
    elif to_date:
        filters["creation"] = ["<=", to_date]

    # 1. Handed-over Cash from Ledger
    # Note: Ledger doesn't have 'temple' field directly usually, 
    # but let's assume we want to filter donations. 
    # If we filter by temple, we should probably look at tabDonation.
    
    # Let's simplify: Sum of total_amount from tabDonation with filters
    total_donation = frappe.db.get_value("Donation", 
                                          filters=filters, 
                                          fieldname="sum(total_amount)") or 0
    
    # 2. Top Category
    query = """
        SELECT dt.donation_type, SUM(di.amount) as total 
        FROM `tabDonation Item` di
        JOIN `tabDonation` d ON di.parent = d.name
        LEFT JOIN `tabDonation Type` dt ON di.donation_type = dt.name
        WHERE 1=1
    """
    params = []
    if temple:
        query += " AND d.temple = %s"
        params.append(temple)
    if user:
        query += " AND d.cashier = %s"
        params.append(user)
    if from_date and to_date:
        query += " AND d.creation BETWEEN %s AND %s"
        params.extend([from_date, to_date])
    
    query += " GROUP BY dt.donation_type ORDER BY total DESC LIMIT 1"
    
    top_cat_result = frappe.db.sql(query, tuple(params), as_dict=True)
    top_category = top_cat_result[0].donation_type if top_cat_result and top_cat_result[0].donation_type else "N/A"
    
    # 3. New Donors Today
    donor_filters = {}
    if from_date and to_date:
        donor_filters["creation"] = ["between", [from_date, to_date]]
    else:
        donor_filters["creation"] = (">=", nowdate())
        
    new_donors = frappe.db.count("Donor", filters=donor_filters)
    
    return {
        "total_donation": total_donation,
        "top_category": top_category,
        "new_donors": new_donors
    }

@frappe.whitelist()
def get_donations_by_type(temple=None, user=None, from_date=None, to_date=None):
    """
    Returns donation breakdown for pie chart.
    """
    query = """
        SELECT dt.donation_type as type, SUM(di.amount) as value 
        FROM `tabDonation Item` di
        JOIN `tabDonation` d ON di.parent = d.name
        LEFT JOIN `tabDonation Type` dt ON di.donation_type = dt.name
        WHERE 1=1
    """
    params = []
    if temple:
        query += " AND d.temple = %s"
        params.append(temple)
    if user:
        query += " AND d.cashier = %s"
        params.append(user)
    if from_date and to_date:
        query += " AND d.creation BETWEEN %s AND %s"
        params.extend([from_date, to_date])
        
    query += " GROUP BY dt.donation_type ORDER BY value DESC"
    
    return frappe.db.sql(query, tuple(params), as_dict=True)

@frappe.whitelist()
def get_top_donors(temple=None, user=None, from_date=None, to_date=None):
    """
    Returns top 10 donors by total contribution.
    """
    query = "SELECT donor_name as name, SUM(total_amount) as total FROM `tabDonation` WHERE 1=1"
    params = []
    if temple:
        query += " AND temple = %s"
        params.append(temple)
    if user:
        query += " AND cashier = %s"
        params.append(user)
    if from_date and to_date:
        query += " AND creation BETWEEN %s AND %s"
        params.extend([from_date, to_date])
        
    query += " GROUP BY donor_name ORDER BY total DESC LIMIT 10"
    
    return frappe.db.sql(query, tuple(params), as_dict=True)

@frappe.whitelist()
def get_recent_donations(temple=None, user=None, limit=5):
    """
    Returns the most recent donations with their primary category tag.
    """
    filters = {}
    if temple:
        filters["temple"] = temple
    if user:
        filters["cashier"] = user

    donations = frappe.get_list("Donation", 
        filters=filters,
        fields=["name", "donor_name", "total_amount", "creation"],
        order_by="creation desc",
        limit=limit
    )
    
    for d in donations:
        # Get the first donation item's type name
        query = """
            SELECT dt.donation_type
            FROM `tabDonation Item` di
            LEFT JOIN `tabDonation Type` dt ON di.donation_type = dt.name
            WHERE di.parent = %s
            LIMIT 1
        """
        type_res = frappe.db.sql(query, (d.name,), as_dict=True)
        d["category"] = type_res[0].donation_type if type_res and type_res[0].donation_type else "General"
        
        # Get donor initials for avatar
        if d.donor_name:
            parts = d.donor_name.split()
            d["initials"] = "".join([p[0].upper() for p in parts[:2]])
        else:
            d["initials"] = "D"
            
    return donations

@frappe.whitelist()
def get_monthly_donations(temple=None, user=None):
    """
    Returns donation totals for the last 6 months for trend analysis.
    """
    from frappe.utils import add_months, getdate, formatdate
    
    data = []
    for i in range(5, -1, -1):
        target_date = add_months(nowdate(), -i)
        month_start = getdate(target_date).replace(day=1)
        next_month = add_months(month_start, 1)
        
        month_label = formatdate(month_start, "MMM")
        
        filters = {"creation": ["between", [month_start, next_month]]}
        if temple:
            filters["temple"] = temple
        if user:
            filters["cashier"] = user

        total = frappe.db.get_value("Donation", 
            filters=filters,
            fieldname="sum(total_amount)") or 0
            
        data.append({"month": month_label, "amount": flt(total)})
        
    return data

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
        "Super Admin": "Super Admin",
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

@frappe.whitelist()
def get_children(doctype, parent_names, parenttype, parentfield):
    """Fetches child table data for a list of parent names and enriches with temple names."""
    if isinstance(parent_names, str):
        import json
        parent_names = json.loads(parent_names)

    data = frappe.get_all(doctype, 
        filters={
            'parent': ['in', parent_names],
            'parenttype': parenttype,
            'parentfield': parentfield
        },
        fields=['*']
    )

    # Enrich with Temple names if applicable
    temple_ids = list(set([d.temple for d in data if d.get('temple')]))
    if temple_ids:
        temple_map = { t.name: t.temple_name for t in frappe.get_all('Temple', 
            filters={'name': ['in', temple_ids]}, 
            fields=['name', 'temple_name']) 
        }
        for d in data:
            if d.get('temple') in temple_map:
                d['temple_name'] = temple_map[d.temple]

    return data
