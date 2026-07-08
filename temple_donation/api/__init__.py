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
def get_handover_logs():
    """
    Fetch consolidated Handover logs grouped by user.
    Each user has only one row in the table.
    """
    logs = frappe.db.sql("""
        SELECT 
            MIN(name) as name,
            user,
            user_name,
            SUM(opening_balance) as opening_balance,
            MAX(reset_date) as reset_date
        FROM `tabLedger`
        GROUP BY user, user_name
        ORDER BY reset_date DESC
    """, as_dict=True)
    
    for log in logs:
        # Get collector's full name (from the last Ledger entry for this user)
        last_owner = frappe.db.get_value("Ledger", 
            filters={"user": log.user}, 
            fieldname="owner", 
            order_by="reset_date desc"
        )
        log["owner"] = last_owner or "Administrator"
        log["collector_name"] = frappe.db.get_value("User", log["owner"], "full_name") or log["owner"]
        # Get cashier's avatar
        log["user_image"] = frappe.db.get_value("User", log.user, "user_image")
    return logs

@frappe.whitelist()
def get_user_handover_details(user_id):
    """
    Get all handover history and associated cash donations for a specific user.
    """
    # Fetch user info
    user_doc = frappe.db.get_value("User", user_id, 
        ["name", "full_name", "user_image", "email"], as_dict=True)
    
    if not user_doc:
        frappe.throw(f"User {user_id} not found")
        
    # Fetch all past Ledger entries (handovers) for this user
    handovers = frappe.get_all("Ledger",
        filters={"user": user_id},
        fields=["name", "opening_balance", "reset_date", "owner"],
        order_by="reset_date desc"
    )
    for h in handovers:
        h["collector_name"] = frappe.db.get_value("User", h.owner, "full_name") or h.owner
        
    # Total amount collected by this user across all handovers
    total_collected = sum(flt(h.opening_balance) for h in handovers)
    
    # Fetch all Cash donations collected by this user that are handed over
    donations = []
    if handovers:
        latest_reset = max(h.reset_date for h in handovers)
        donations = frappe.get_all("Donation",
            filters={
                "owner": user_id,
                "payment_mode": "Cash",
                "creation": ["<=", latest_reset]
            },
            fields=["name", "donor_name", "total_amount", "creation", "temple"],
            order_by="creation desc"
        )
        for d in donations:
            d["temple_name"] = frappe.db.get_value("Temple", d.temple, "temple_name") or d.temple
            
    return {
        "user": user_doc,
        "handovers": handovers,
        "total_collected": total_collected,
        "donations": donations
    }

@frappe.whitelist()
def get_ledger_donations(ledger_id):
    """
    Get all Cash donations collected by a cashier that belong to a specific Ledger handover.
    """
    ledger = frappe.get_doc("Ledger", ledger_id)
    cashier = ledger.user
    reset_date = ledger.reset_date
    
    # Find the latest Ledger reset date for this cashier before this reset_date
    prev_reset = frappe.db.get_value("Ledger", 
        filters={
            "user": cashier,
            "reset_date": ["<", reset_date]
        },
        fieldname="max(reset_date)"
    )
    
    # Query all donations by this cashier (owner) with payment_mode 'Cash'
    if prev_reset:
        donations = frappe.get_all("Donation",
            filters={
                "owner": cashier,
                "payment_mode": "Cash",
                "creation": ["between", [prev_reset, reset_date]]
            },
            fields=["name", "donor_name", "total_amount", "creation", "temple"],
            order_by="creation desc"
        )
    else:
        donations = frappe.get_all("Donation",
            filters={
                "owner": cashier,
                "payment_mode": "Cash",
                "creation": ["<=", reset_date]
            },
            fields=["name", "donor_name", "total_amount", "creation", "temple"],
            order_by="creation desc"
        )
        
    for d in donations:
        d["temple_name"] = frappe.db.get_value("Temple", d.temple, "temple_name") or d.temple
        
    return {
        "ledger": ledger,
        "donations": donations
    }

@frappe.whitelist()
def get_active_user_donations(user):
    """
    Get all active (un-reset/pending handover) Cash donations collected by a cashier.
    """
    last_reset = frappe.db.get_value("Ledger", 
                                    filters={"user": user}, 
                                    fieldname="max(reset_date)")
    
    if last_reset:
        donations = frappe.get_all("Donation",
            filters={
                "owner": user,
                "payment_mode": "Cash",
                "creation": [">", last_reset]
            },
            fields=["name", "donor_name", "total_amount", "creation", "temple"],
            order_by="creation desc"
        )
    else:
        donations = frappe.get_all("Donation",
            filters={
                "owner": user,
                "payment_mode": "Cash"
            },
            fields=["name", "donor_name", "total_amount", "creation", "temple"],
            order_by="creation desc"
        )
        
    for d in donations:
        d["temple_name"] = frappe.db.get_value("Temple", d.temple, "temple_name") or d.temple
        
    return donations

@frappe.whitelist()
def get_users_assigned_to_temples(temples):
    """
    Returns a list of users who are assigned to the specified temples.
    """
    temples = _parse_json_arg(temples)
    if not temples:
        return []
        
    details = frappe.db.get_all(
        "Temple Details",
        filters={"temple": ["in", temples], "parenttype": "User"},
        fields=["parent"]
    )
    return list(set(d.parent for d in details))

def _get_user_assignment_filters(temple=None, user=None):
    """
    Returns a dict containing:
      - 'temple_filter': None, a single temple name, or a list of temple names.
      - 'user_filter': None, a single user name, or a list of user names.
      - 'assigned_temples': list of temple names.
      - 'allowed_users': list of user names.
    Enforces permissions.
    """
    current_user = frappe.session.user
    user_roles = frappe.get_roles(current_user)
    
    # If the user is Administrator, Super Admin, or System Manager, they have no restrictions
    if "System Manager" in user_roles or "Super Admin" in user_roles or current_user == "Administrator":
        return {
            "temple_filter": temple,
            "user_filter": user,
            "assigned_temples": [],
            "allowed_users": []
        }
        
    # Get assigned temples for the current user
    assigned_temples = [
        t.temple for t in frappe.get_all(
            "Temple Details", 
            filters={"parent": current_user}, 
            fields=["temple"]
        )
    ]
    
    # If they are restricted but have no assigned temples, they can see nothing!
    if not assigned_temples:
        frappe.throw(_("You are not assigned to any temples."))
        
    # Validate requested temple
    if temple:
        if temple not in assigned_temples:
            frappe.throw(_("Not permitted to access data for temple {0}").format(temple))
        temple_filter = temple
    else:
        temple_filter = ["in", assigned_temples]
        
    # Get allowed users (users assigned to the same temples)
    allowed_users = [
        d.parent for d in frappe.get_all(
            "Temple Details", 
            filters={"temple": ["in", assigned_temples], "parenttype": "User"}, 
            fields=["parent"]
        )
    ]
    if current_user not in allowed_users:
        allowed_users.append(current_user)
        
    # Validate requested user
    if user:
        if user not in allowed_users:
            frappe.throw(_("Not permitted to access data for user {0}").format(user))
        user_filter = user
    else:
        user_filter = ["in", allowed_users]
        
    return {
        "temple_filter": temple_filter,
        "user_filter": user_filter,
        "assigned_temples": assigned_temples,
        "allowed_users": allowed_users
    }

@frappe.whitelist()
def get_dashboard_stats(temple=None, user=None, from_date=None, to_date=None):
    """
    Returns core stats for the dashboard.
    Total Donation = (Sum of Handed-over Cash from Ledger) + (Sum of non-Cash donations).
    """
    assign = _get_user_assignment_filters(temple, user)
    
    filters = {}
    if assign["temple_filter"]:
        filters["temple"] = assign["temple_filter"]
    if assign["user_filter"]:
        filters["cashier"] = assign["user_filter"]
    if from_date and to_date:
        filters["creation"] = ["between", [from_date, to_date]]
    elif from_date:
        filters["creation"] = [">=", from_date]
    elif to_date:
        filters["creation"] = ["<=", to_date]

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
    
    if assign["temple_filter"]:
        if isinstance(assign["temple_filter"], list) and assign["temple_filter"][0] == "in":
            temples_list = assign["temple_filter"][1]
            query += " AND d.temple IN ({})".format(", ".join(["%s"] * len(temples_list)))
            params.extend(temples_list)
        else:
            query += " AND d.temple = %s"
            params.append(assign["temple_filter"])
            
    if assign["user_filter"]:
        if isinstance(assign["user_filter"], list) and assign["user_filter"][0] == "in":
            users_list = assign["user_filter"][1]
            query += " AND d.cashier IN ({})".format(", ".join(["%s"] * len(users_list)))
            params.extend(users_list)
        else:
            query += " AND d.cashier = %s"
            params.append(assign["user_filter"])
            
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
        
    if assign["assigned_temples"]:
        donors_in_temples = frappe.get_all("Donation", 
            filters={
                "temple": ["in", assign["assigned_temples"]],
                "creation": donor_filters["creation"]
            },
            fields=["donor"]
        )
        new_donors = len(set(d.donor for d in donors_in_temples if d.get("donor")))
    else:
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
    assign = _get_user_assignment_filters(temple, user)
    query = """
        SELECT dt.donation_type as type, SUM(di.amount) as value 
        FROM `tabDonation Item` di
        JOIN `tabDonation` d ON di.parent = d.name
        LEFT JOIN `tabDonation Type` dt ON di.donation_type = dt.name
        WHERE 1=1
    """
    params = []
    
    if assign["temple_filter"]:
        if isinstance(assign["temple_filter"], list) and assign["temple_filter"][0] == "in":
            temples_list = assign["temple_filter"][1]
            query += " AND d.temple IN ({})".format(", ".join(["%s"] * len(temples_list)))
            params.extend(temples_list)
        else:
            query += " AND d.temple = %s"
            params.append(assign["temple_filter"])
            
    if assign["user_filter"]:
        if isinstance(assign["user_filter"], list) and assign["user_filter"][0] == "in":
            users_list = assign["user_filter"][1]
            query += " AND d.cashier IN ({})".format(", ".join(["%s"] * len(users_list)))
            params.extend(users_list)
        else:
            query += " AND d.cashier = %s"
            params.append(assign["user_filter"])
            
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
    assign = _get_user_assignment_filters(temple, user)
    query = "SELECT donor_name as name, SUM(total_amount) as total FROM `tabDonation` WHERE 1=1"
    params = []
    
    if assign["temple_filter"]:
        if isinstance(assign["temple_filter"], list) and assign["temple_filter"][0] == "in":
            temples_list = assign["temple_filter"][1]
            query += " AND temple IN ({})".format(", ".join(["%s"] * len(temples_list)))
            params.extend(temples_list)
        else:
            query += " AND temple = %s"
            params.append(assign["temple_filter"])
            
    if assign["user_filter"]:
        if isinstance(assign["user_filter"], list) and assign["user_filter"][0] == "in":
            users_list = assign["user_filter"][1]
            query += " AND cashier IN ({})".format(", ".join(["%s"] * len(users_list)))
            params.extend(users_list)
        else:
            query += " AND cashier = %s"
            params.append(assign["user_filter"])
            
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
    assign = _get_user_assignment_filters(temple, user)
    filters = {}
    if assign["temple_filter"]:
        filters["temple"] = assign["temple_filter"]
    if assign["user_filter"]:
        filters["cashier"] = assign["user_filter"]

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
    
    assign = _get_user_assignment_filters(temple, user)
    
    data = []
    for i in range(5, -1, -1):
        target_date = add_months(nowdate(), -i)
        month_start = getdate(target_date).replace(day=1)
        next_month = add_months(month_start, 1)
        
        month_label = formatdate(month_start, "MMM")
        
        filters = {"creation": ["between", [month_start, next_month]]}
        if assign["temple_filter"]:
            filters["temple"] = assign["temple_filter"]
        if assign["user_filter"]:
            filters["cashier"] = assign["user_filter"]

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

    selected_role = doc.custom_user_role.strip()
    assignable_roles = _get_assignable_role_names()

    if selected_role not in assignable_roles:
        return

    current_roles = [r.role for r in doc.roles]

    if selected_role not in current_roles:
        filtered_roles = [
            r for r in doc.roles
            if r.role not in assignable_roles or r.role == selected_role
        ]
        doc.set("roles", filtered_roles)
        doc.append("roles", {"role": selected_role})
        doc.user_type = "System User"

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

@frappe.whitelist()
def save_filter_view(view_name, reference_doctype, filters_json):
    """
    Saves or updates a user-specific filter view.
    """
    user = frappe.session.user
    
    # Check if view already exists for this user and doctype
    existing = frappe.db.exists("Saved Filter View", {
        "view_name": view_name,
        "reference_doctype": reference_doctype,
        "user": user
    })
    
    if existing:
        doc = frappe.get_doc("Saved Filter View", existing)
        doc.filters_json = filters_json
        doc.save(ignore_permissions=True)
    else:
        doc = frappe.get_doc({
            "doctype": "Saved Filter View",
            "view_name": view_name,
            "reference_doctype": reference_doctype,
            "user": user,
            "filters_json": filters_json
        })
        doc.insert(ignore_permissions=True)
        
    frappe.db.commit()
    return doc.name

@frappe.whitelist()
def delete_filter_view(view_name, reference_doctype):
    """
    Deletes a specific user filter view.
    """
    user = frappe.session.user
    existing = frappe.db.exists("Saved Filter View", {
        "view_name": view_name,
        "reference_doctype": reference_doctype,
        "user": user
    })
    
    if existing:
        frappe.delete_doc("Saved Filter View", existing, ignore_permissions=True)
        frappe.db.commit()
        return True
    return False

@frappe.whitelist()
def get_filter_views(reference_doctype):
    """
    Fetches all saved views for the current user and doctype.
    """
    user = frappe.session.user
    return frappe.get_all(
        "Saved Filter View",
        filters={
            "reference_doctype": reference_doctype,
            "user": user
        },
        fields=["view_name", "filters_json"]
    )

@frappe.whitelist()
def update_filter_view(old_view_name, new_view_name, reference_doctype, filters_json=None):
    """
    Updates a user-specific filter view (renames and/or updates filters).
    """
    user = frappe.session.user
    existing = frappe.db.exists("Saved Filter View", {
        "view_name": old_view_name,
        "reference_doctype": reference_doctype,
        "user": user
    })
    
    if not existing:
        frappe.throw(_("View not found"))
        
    if old_view_name != new_view_name:
        conflict = frappe.db.exists("Saved Filter View", {
            "view_name": new_view_name,
            "reference_doctype": reference_doctype,
            "user": user
        })
        if conflict:
            frappe.throw(_("A view named '{0}' already exists").format(new_view_name))
            
    doc = frappe.get_doc("Saved Filter View", existing)
    doc.view_name = new_view_name
    if filters_json:
        doc.filters_json = filters_json
    doc.save(ignore_permissions=True)
    frappe.db.commit()
    return True

@frappe.whitelist()
def save_column_order(reference_doctype, columns_json):
    """
    Saves the column order and visibility for a specific user and reference_doctype in User Column Preference doctype.
    """
    user = frappe.session.user
    
    # Check if a preference already exists
    existing = frappe.db.exists("User Column Preference", {
        "user": user,
        "reference_doctype": reference_doctype
    })
    
    if existing:
        frappe.db.set_value("User Column Preference", existing, "columns_json", columns_json)
    else:
        doc = frappe.get_doc({
            "doctype": "User Column Preference",
            "user": user,
            "reference_doctype": reference_doctype,
            "columns_json": columns_json
        })
        doc.insert(ignore_permissions=True)
        
    frappe.db.commit()
    return True

@frappe.whitelist()
def get_column_order(reference_doctype):
    """
    Retrieves the column order and visibility for the current user and reference_doctype from User Column Preference doctype.
    """
    import json
    user = frappe.session.user
    
    preference = frappe.db.get_value("User Column Preference", 
        {"user": user, "reference_doctype": reference_doctype}, 
        "columns_json"
    )
    
    if preference:
        try:
            return json.loads(preference)
        except Exception:
            return []
    return []

@frappe.whitelist()
def get_inventory_dashboard(temple=None):
    """
    Returns inventory stats, chart data, and recent activities.
    """
    # Filters
    item_filters = {"status": "Active"}
    entry_filters = {"docstatus": 1}
    if temple:
        item_filters["temple"] = temple
        entry_filters["temple"] = temple

    # Total Items
    total_items = frappe.db.count("Item", item_filters)

    # Total Stock Qty
    items = frappe.get_all("Item", filters=item_filters, fields=["name", "current_stock", "minimum_stock"])
    total_stock_qty = sum(float(i.current_stock or 0) for i in items)

    # Low Stock / Out of Stock
    low_stock_count = 0
    out_of_stock_count = 0
    for i in items:
        curr = float(i.current_stock or 0)
        min_s = float(i.minimum_stock or 0)
        if curr <= 0:
            out_of_stock_count += 1
        elif curr < min_s:
            low_stock_count += 1

    # Current Stock Value
    current_stock_value = 0
    for i in items:
        curr = float(i.current_stock or 0)
        if curr > 0:
            latest_rate = frappe.db.sql("""
                SELECT child.rate FROM `tabInventory Item` child
                JOIN `tabInventory Entry` parent ON child.parent = parent.name
                WHERE child.item = %s AND parent.docstatus = 1
                ORDER BY parent.posting_date DESC, parent.creation DESC LIMIT 1
            """, (i.name,))
            rate = float(latest_rate[0][0] or 0) if latest_rate else 0
            current_stock_value += curr * rate

    # Today's Stock In / Out
    today = frappe.utils.today()
    today_start = today + " 00:00:00"
    today_end = today + " 23:59:59"
    
    today_entries = frappe.db.sql("""
        SELECT parent.entry_type, SUM(child.qty) as total_qty
        FROM `tabInventory Item` child
        JOIN `tabInventory Entry` parent ON child.parent = parent.name
        WHERE parent.docstatus = 1
            AND parent.posting_date BETWEEN %s AND %s
            {temple_cond}
        GROUP BY parent.entry_type
    """.format(temple_cond="AND parent.temple = '{}'".format(temple) if temple else ""), (today_start, today_end), as_dict=True)

    today_stock_in = 0
    today_stock_out = 0
    for entry in today_entries:
        if entry.entry_type in ["IN", "Stock In"]:
            today_stock_in += float(entry.total_qty or 0)
        elif entry.entry_type in ["OUT", "Stock Out"]:
            today_stock_out += float(entry.total_qty or 0)

    # Charts Data:
    # 1. Monthly Stock In/Out (last 6 months)
    monthly_data = frappe.db.sql("""
        SELECT 
            DATE_FORMAT(parent.posting_date, '%%Y-%%m') as month,
            parent.entry_type,
            SUM(child.qty) as total_qty
        FROM `tabInventory Item` child
        JOIN `tabInventory Entry` parent ON child.parent = parent.name
        WHERE parent.docstatus = 1
            AND parent.posting_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            {temple_cond}
        GROUP BY DATE_FORMAT(parent.posting_date, '%%Y-%%m'), parent.entry_type
        ORDER BY month ASC
    """.format(temple_cond="AND parent.temple = '{}'".format(temple) if temple else ""), as_dict=True)

    monthly_map = {}
    from frappe.utils import add_months, formatdate
    for offset in range(5, -1, -1):
        m_start = add_months(today, -offset)
        m_key = formatdate(m_start, "yyyy-MM")
        m_label = formatdate(m_start, "MMM YYYY")
        monthly_map[m_key] = {"month": m_label, "stock_in": 0, "stock_out": 0}

    for d in monthly_data:
        m = d.month
        if m in monthly_map:
            qty = float(d.total_qty or 0)
            if d.entry_type in ["IN", "Stock In"]:
                monthly_map[m]["stock_in"] += qty
            elif d.entry_type in ["OUT", "Stock Out"]:
                monthly_map[m]["stock_out"] += qty

    monthly_stock_in_out = sorted(list(monthly_map.values()), key=lambda x: x["month"])

    # 2. Category Wise Stock Distribution
    category_dist = frappe.db.sql("""
        SELECT cat.category_name as category, SUM(i.current_stock) as value
        FROM `tabItem` i
        JOIN `tabItem Category` cat ON i.item_category = cat.name
        WHERE i.status = 'Active' {temple_cond}
        GROUP BY cat.category_name
        HAVING value > 0
    """.format(temple_cond="AND i.temple = '{}'".format(temple) if temple else ""), as_dict=True)

    # 3. Top Consumed Items
    top_consumed = frappe.db.sql("""
        SELECT i.item_name as name, SUM(child.qty) as value
        FROM `tabInventory Item` child
        JOIN `tabInventory Entry` parent ON child.parent = parent.name
        JOIN `tabItem` i ON child.item = i.name
        WHERE parent.docstatus = 1 AND parent.entry_type in ('OUT', 'Stock Out')
            {temple_cond}
        GROUP BY child.item
        ORDER BY value DESC
        LIMIT 5
    """.format(temple_cond="AND parent.temple = '{}'".format(temple) if temple else ""), as_dict=True)

    # Recent Activities
    latest_entries = frappe.get_all("Inventory Entry",
        filters=entry_filters,
        fields=["name", "entry_type", "posting_date", "temple", "remarks"],
        order_by="posting_date desc, creation desc",
        limit=5
    )
    for l in latest_entries:
        l["temple_name"] = frappe.db.get_value("Temple", l.temple, "temple_name") or l.temple
    
    issue_filters = entry_filters.copy()
    issue_filters["entry_type"] = ["in", ["OUT", "Stock Out"]]
    latest_issues = frappe.get_all("Inventory Entry",
        filters=issue_filters,
        fields=["name", "posting_date", "temple", "remarks"],
        order_by="posting_date desc, creation desc",
        limit=5
    )
    for l in latest_issues:
        l["temple_name"] = frappe.db.get_value("Temple", l.temple, "temple_name") or l.temple

    donation_filters = entry_filters.copy()
    donation_filters["reference_type"] = "Donation"
    latest_donations = frappe.get_all("Inventory Entry",
        filters=donation_filters,
        fields=["name", "reference_name", "posting_date", "remarks"],
        order_by="posting_date desc, creation desc",
        limit=5
    )

    return {
        "stats": {
            "total_items": total_items,
            "total_stock_qty": total_stock_qty,
            "current_stock_value": current_stock_value,
            "low_stock_items": low_stock_count,
            "out_of_stock_items": out_of_stock_count,
            "today_stock_in": today_stock_in,
            "today_stock_out": today_stock_out
        },
        "charts": {
            "monthly_stock_in_out": monthly_stock_in_out,
            "category_distribution": category_dist,
            "top_consumed": top_consumed
        },
        "recent_activities": {
            "latest_entries": latest_entries,
            "latest_issues": latest_issues,
            "latest_donations": latest_donations
        }
    }

@frappe.whitelist()
def get_item_history(item):
    """
    Returns running stock history for a specific item.
    """
    if not item:
        return []

    # Get item info
    item_doc = frappe.db.get_value("Item", item, ["item_name", "unit"], as_dict=True)
    if not item_doc:
        return []

    # Get all submitted stock transactions for this item
    entries = frappe.db.sql("""
        SELECT 
            parent.name as reference,
            parent.entry_type,
            parent.posting_date,
            parent.owner as user,
            child.qty,
            parent.reference_type,
            parent.reference_name
        FROM `tabInventory Item` child
        JOIN `tabInventory Entry` parent ON child.parent = parent.name
        WHERE child.item = %s AND parent.docstatus = 1
        ORDER BY parent.posting_date ASC, parent.creation ASC
    """, (item,), as_dict=True)

    remaining = 0
    history = []
    for e in entries:
        qty = float(e.qty or 0)
        is_out = e.entry_type in ["OUT", "Stock Out"]
        is_in = e.entry_type in ["IN", "Stock In"]
        
        if is_out:
            change = -qty
        elif is_in:
            change = qty
        else:
            change = qty

        remaining += change
        
        history.append({
            "date": e.posting_date,
            "transaction_type": e.entry_type,
            "quantity": qty,
            "reference": e.reference,
            "reference_type": e.reference_type,
            "reference_name": e.reference_name,
            "user": frappe.db.get_value("User", e.user, "full_name") or e.user,
            "remaining_stock": remaining
        })

    history.reverse()
    return history

@frappe.whitelist()
def get_inventory_report(report_type, temple=None, category=None):
    """
    Generates structured reports for inventory module.
    """
    from frappe.utils import flt
    # Base item filter
    item_filters = {"status": "Active"}
    if temple:
        item_filters["temple"] = temple
    if category:
        item_filters["item_category"] = category

    if report_type == "Current Stock Report":
        items = frappe.get_all("Item", 
            filters=item_filters,
            fields=["name", "item_name", "item_code", "item_category", "store_location", "minimum_stock", "maximum_stock", "current_stock", "unit", "temple"]
        )
        for i in items:
            i["category_name"] = frappe.db.get_value("Item Category", i.item_category, "category_name") if i.item_category else "—"
            i["location_name"] = frappe.db.get_value("Store Location", i.store_location, "location_name") if i.store_location else "—"
            i["temple_name"] = frappe.db.get_value("Temple", i.temple, "temple_name") if i.temple else "Global"
            # Get latest rate
            latest_rate = frappe.db.sql("""
                SELECT child.rate FROM `tabInventory Item` child
                JOIN `tabInventory Entry` parent ON child.parent = parent.name
                WHERE child.item = %s AND parent.docstatus = 1
                ORDER BY parent.posting_date DESC, parent.creation DESC LIMIT 1
            """, (i.name,))
            rate = float(latest_rate[0][0] or 0) if latest_rate else 0
            i["rate"] = rate
            i["stock_value"] = float(i.current_stock or 0) * rate
        return items

    elif report_type == "Low Stock Report":
        items = frappe.get_all("Item",
            filters=item_filters,
            fields=["name", "item_name", "item_code", "item_category", "minimum_stock", "current_stock", "unit", "temple"]
        )
        low_stock = []
        for i in items:
            curr = float(i.current_stock or 0)
            min_s = float(i.minimum_stock or 0)
            if curr < min_s:
                i["category_name"] = frappe.db.get_value("Item Category", i.item_category, "category_name") if i.item_category else "—"
                i["temple_name"] = frappe.db.get_value("Temple", i.temple, "temple_name") if i.temple else "Global"
                low_stock.append(i)
        return low_stock

    elif report_type == "Stock Ledger":
        query = """
            SELECT 
                parent.posting_date as date,
                parent.name as reference,
                parent.entry_type,
                parent.reference_type,
                parent.reference_name,
                child.item as item_code,
                i.item_name,
                child.qty as quantity,
                child.unit,
                child.rate,
                child.total_amount,
                parent.owner as user
            FROM `tabInventory Item` child
            JOIN `tabInventory Entry` parent ON child.parent = parent.name
            JOIN `tabItem` i ON child.item = i.name
            WHERE parent.docstatus = 1
        """
        params = []
        if temple:
            query += " AND parent.temple = %s"
            params.append(temple)
        if category:
            query += " AND i.item_category = %s"
            params.append(category)
        
        query += " ORDER BY parent.posting_date DESC, parent.creation DESC"
        
        ledger = frappe.db.sql(query, tuple(params), as_dict=True)
        for l in ledger:
            l["user"] = frappe.db.get_value("User", l.user, "full_name") or l.user
        return ledger

    elif report_type == "Category Wise Stock":
        query = """
            SELECT 
                cat.category_name as category,
                COUNT(i.name) as total_items,
                SUM(i.current_stock) as total_stock
            FROM `tabItem` i
            JOIN `tabItem Category` cat ON i.item_category = cat.name
            WHERE i.status = 'Active'
        """
        params = []
        if temple:
            query += " AND i.temple = %s"
            params.append(temple)
        if category:
            query += " AND i.item_category = %s"
            params.append(category)

        query += " GROUP BY cat.name"
        return frappe.db.sql(query, tuple(params), as_dict=True)

    elif report_type == "Temple Wise Stock":
        query = """
            SELECT 
                t.temple_name as temple,
                COUNT(i.name) as total_items,
                SUM(i.current_stock) as total_stock
            FROM `tabItem` i
            JOIN `tabTemple` t ON i.temple = t.name
            WHERE i.status = 'Active'
        """
        params = []
        if category:
            query += " AND i.item_category = %s"
            params.append(category)
        if temple:
            query += " AND i.temple = %s"
            params.append(temple)

        query += " GROUP BY t.name"
        return frappe.db.sql(query, tuple(params), as_dict=True)

    elif report_type == "Monthly Consumption":
        query = """
            SELECT 
                DATE_FORMAT(parent.posting_date, '%%Y-%%m') as month,
                i.item_name,
                SUM(child.qty) as quantity,
                child.unit
            FROM `tabInventory Item` child
            JOIN `tabInventory Entry` parent ON child.parent = parent.name
            JOIN `tabItem` i ON child.item = i.name
            WHERE parent.docstatus = 1 AND parent.entry_type in ('OUT', 'Stock Out')
        """
        params = []
        if temple:
            query += " AND parent.temple = %s"
            params.append(temple)
        if category:
            query += " AND i.item_category = %s"
            params.append(category)

        query += " GROUP BY DATE_FORMAT(parent.posting_date, '%%Y-%%m'), child.item ORDER BY month DESC"
        return frappe.db.sql(query, tuple(params), as_dict=True)

    elif report_type == "Monthly Stock In/Out":
        query = """
            SELECT 
                DATE_FORMAT(parent.posting_date, '%%Y-%%m') as month,
                parent.entry_type,
                SUM(child.qty) as quantity
            FROM `tabInventory Item` child
            JOIN `tabInventory Entry` parent ON child.parent = parent.name
            WHERE parent.docstatus = 1
        """
        params = []
        if temple:
            query += " AND parent.temple = %s"
            params.append(temple)

        query += " GROUP BY DATE_FORMAT(parent.posting_date, '%%Y-%%m'), parent.entry_type ORDER BY month DESC"
        return frappe.db.sql(query, tuple(params), as_dict=True)

    return []

@frappe.whitelist()
def import_inventory_items(items_list):
    """
    Parses, validates, and imports items from frontend bulk upload.
    """
    import json
    from frappe.utils import flt
    if isinstance(items_list, str):
        items_list = json.loads(items_list)

    summary = {
        "created": 0,
        "skipped": 0,
        "failed": 0,
        "logs": []
    }

    for idx, row in enumerate(items_list):
        row_num = idx + 1
        item_name = row.get("item_name")
        item_code = row.get("item_code")
        category = row.get("category")
        location = row.get("store_location")
        unit = row.get("unit")
        temple = row.get("temple")
        min_stock = flt(row.get("minimum_stock", 0))
        max_stock = flt(row.get("maximum_stock", 0))
        description = row.get("description")

        if not item_name:
            summary["failed"] += 1
            summary["logs"].append(f"Row {row_num}: Item Name is required.")
            continue

        item_exists = frappe.db.exists("Item", {"item_name": item_name})
        if not item_exists and item_code:
            item_exists = frappe.db.exists("Item", {"item_code": item_code})
        
        if item_exists:
            summary["skipped"] += 1
            summary["logs"].append(f"Row {row_num}: Item '{item_name}' (or Code '{item_code}') already exists. Skipped.")
            continue

        category_id = None
        if category:
            category_id = frappe.db.exists("Item Category", {"category_name": category})
            if not category_id:
                try:
                    new_cat = frappe.get_doc({
                        "doctype": "Item Category",
                        "category_name": category
                    })
                    new_cat.insert(ignore_permissions=True)
                    category_id = new_cat.name
                    summary["logs"].append(f"Row {row_num}: Created Category '{category}' as it did not exist.")
                except Exception as e:
                    summary["failed"] += 1
                    summary["logs"].append(f"Row {row_num}: Failed to create Category '{category}': {str(e)}")
                    continue

        resolved_temple = None
        if temple:
            if frappe.db.exists("Temple", temple):
                resolved_temple = temple
            else:
                resolved_temple = frappe.db.get_value("Temple", {"temple_name": temple})
            
            if not resolved_temple:
                summary["failed"] += 1
                summary["logs"].append(f"Row {row_num}: Trust '{temple}' does not exist.")
                continue

        location_id = None
        if location:
            loc_filters = {"location_name": location}
            if resolved_temple:
                loc_filters["temple"] = resolved_temple
            location_id = frappe.db.exists("Store Location", loc_filters)
            if not location_id:
                try:
                    new_loc = frappe.get_doc({
                        "doctype": "Store Location",
                        "location_name": location,
                        "temple": resolved_temple
                    })
                    new_loc.insert(ignore_permissions=True)
                    location_id = new_loc.name
                    summary["logs"].append(f"Row {row_num}: Created Store Location '{location}' under Trust '{resolved_temple}' as it did not exist.")
                except Exception as e:
                    summary["failed"] += 1
                    summary["logs"].append(f"Row {row_num}: Failed to create Store Location '{location}': {str(e)}")
                    continue

        allowed_units = ["Nos", "Kg", "Litre", "Bag", "Bottle", "Box", "Pack", "Piece", "Can", "Book", "Gram", "Meter"]
        if unit not in allowed_units:
            summary["failed"] += 1
            summary["logs"].append(f"Row {row_num}: Unit '{unit}' is invalid. Allowed: {', '.join(allowed_units)}")
            continue

        try:
            item_doc = frappe.get_doc({
                "doctype": "Item",
                "item_name": item_name,
                "item_code": item_code,
                "unit": unit,
                "temple": resolved_temple,
                "item_category": category_id,
                "store_location": location_id,
                "minimum_stock": min_stock,
                "maximum_stock": max_stock,
                "description": description,
				"status": "Active"
            })
            item_doc.insert(ignore_permissions=True)
            summary["created"] += 1
        except Exception as e:
            summary["failed"] += 1
            summary["logs"].append(f"Row {row_num}: Error creating item. {str(e)}")

    frappe.db.commit()
    return summary


@frappe.whitelist()
def get_inventory_dashboard_data(temple=None, from_date=None, to_date=None):
    """
    Computes all dashboard statistics, charts data, and activity feeds for the Inventory dashboard.
    Supports filtering by Temple (Trust) and Date Range.
    """
    item_filters = {}
    if temple:
        item_filters["temple"] = temple
        
    items = frappe.get_all("Item", filters=item_filters, fields=["name", "total_stock", "minimum_stock", "item_category","item_category"])
    
    total_items = len(items)
    total_stock_qty = sum(flt(i.total_stock) for i in items)
    
    current_stock_value = 0.0
    low_stock_items = 0
    out_of_stock_items = 0
    
    for i in items:
        # Get latest rate
        latest_rate = frappe.db.sql("""
            SELECT child.rate FROM `tabInventory Item` child
            JOIN `tabInventory Entry` parent ON child.parent = parent.name
            WHERE child.item = %s
            ORDER BY parent.posting_date DESC, parent.creation DESC LIMIT 1
        """, (i.name,))
        rate = float(latest_rate[0][0] or 0) if latest_rate else 0.0
        
        stock = flt(i.total_stock)
        current_stock_value += stock * rate
        
        threshold = flt(i.minimum_stock) if i.minimum_stock is not None else 0.0
        if stock <= 0:
            out_of_stock_items += 1
        elif stock < threshold:
            low_stock_items += 1

    # Date range for selected period
    period_start = (from_date + " 00:00:00") if from_date else (nowdate() + " 00:00:00")
    period_end = (to_date + " 23:59:59") if to_date else (nowdate() + " 23:59:59")

    # Selected period's stock in
    query_args_in = {"period_start": period_start, "period_end": period_end}
    temple_cond_in = ""
    if temple:
        temple_cond_in = "AND parent.temple = %(temple)s"
        query_args_in["temple"] = temple

    period_in_qty = frappe.db.sql(f"""
        SELECT SUM(child.qty)
        FROM `tabInventory Item` child
        JOIN `tabInventory Entry` parent ON child.parent = parent.name
        WHERE parent.posting_date BETWEEN %(period_start)s AND %(period_end)s
          AND parent.entry_type IN ('Stock In', 'IN')
          {temple_cond_in}
    """, query_args_in)[0][0] or 0.0

    # Selected period's stock out
    query_args_out = {"period_start": period_start, "period_end": period_end}
    temple_cond_out = ""
    if temple:
        temple_cond_out = "AND parent.temple = %(temple)s"
        query_args_out["temple"] = temple

    period_out_qty = frappe.db.sql(f"""
        SELECT SUM(child.qty)
        FROM `tabInventory Item` child
        JOIN `tabInventory Entry` parent ON child.parent = parent.name
        WHERE parent.posting_date BETWEEN %(period_start)s AND %(period_end)s
          AND parent.entry_type IN ('Stock Out', 'OUT')
          {temple_cond_out}
    """, query_args_out)[0][0] or 0.0

    # Monthly Stock In/Out (last 6 months) - remains historical trend
    query_args_months = {}
    temple_cond_months = ""
    if temple:
        temple_cond_months = "AND parent.temple = %(temple)s"
        query_args_months["temple"] = temple

    months_query = frappe.db.sql(f"""
        SELECT 
            DATE_FORMAT(parent.posting_date, '%%b %%y') as month_name,
            DATE_FORMAT(parent.posting_date, '%%Y-%%m') as month_val,
            SUM(CASE WHEN parent.entry_type IN ('Stock In', 'IN') THEN child.qty ELSE 0 END) as stock_in,
            SUM(CASE WHEN parent.entry_type IN ('Stock Out', 'OUT') THEN child.qty ELSE 0 END) as stock_out
        FROM `tabInventory Item` child
        JOIN `tabInventory Entry` parent ON child.parent = parent.name
        WHERE parent.posting_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
          {temple_cond_months}
        GROUP BY month_val, month_name
        ORDER BY month_val ASC
    """, query_args_months, as_dict=True)
    
    # Category wise distribution
    query_args_cat = {}
    temple_cond_cat = ""
    if temple:
        temple_cond_cat = "WHERE i.temple = %(temple)s"
        query_args_cat["temple"] = temple

    category_data = frappe.db.sql(f"""
        SELECT 
            IFNULL(cat.category_name, 'Uncategorized') as name,
            SUM(i.total_stock) as value
        FROM `tabItem` i
        LEFT JOIN `tabItem Category` cat ON i.item_category = cat.name
        {temple_cond_cat}
        GROUP BY cat.category_name
        ORDER BY value DESC
    """, query_args_cat, as_dict=True)

    # Top consumed items in selected period
    query_args_top = {"period_start": period_start, "period_end": period_end}
    temple_cond_top = ""
    if temple:
        temple_cond_top = "AND parent.temple = %(temple)s"
        query_args_top["temple"] = temple

    top_consumed = frappe.db.sql(f"""
        SELECT 
            item.item_name as name,
            SUM(child.qty) as value
        FROM `tabInventory Item` child
        JOIN `tabInventory Entry` parent ON child.parent = parent.name
        JOIN `tabItem` item ON child.item = item.name
        WHERE parent.entry_type IN ('Stock Out', 'OUT')
          AND parent.posting_date BETWEEN %(period_start)s AND %(period_end)s
          {temple_cond_top}
        GROUP BY child.item, item.item_name
        ORDER BY value DESC
        LIMIT 5
    """, query_args_top, as_dict=True)

    # Recent Activities within selected period
    activities_filters = {}
    if temple:
        activities_filters["temple"] = temple
    if from_date and to_date:
        activities_filters["posting_date"] = ["between", [from_date, to_date]]

    latest_entries = frappe.get_all("Inventory Entry",
        filters=activities_filters,
        fields=["name", "entry_type", "posting_date", "temple", "owner"],
        order_by="posting_date desc",
        limit=5
    )
    for entry in latest_entries:
        entry["purpose"] = "Receipt" if entry.entry_type in ["Stock In", "IN"] else ("Issue" if entry.entry_type in ["Stock Out", "OUT"] else "Adjustment")
        entry["owner_name"] = frappe.db.get_value("User", entry.owner, "full_name") or entry.owner
        entry["temple_name"] = frappe.db.get_value("Temple", entry.temple, "temple_name") or entry.temple
        
    latest_issues = frappe.get_all("Inventory Entry",
        filters={**activities_filters, "entry_type": ["in", ["Stock Out", "OUT"]]},
        fields=["name", "entry_type", "posting_date", "temple", "owner"],
        order_by="posting_date desc",
        limit=5
    )
    for issue in latest_issues:
        issue["purpose"] = "Issue"
        issue["owner_name"] = frappe.db.get_value("User", issue.owner, "full_name") or issue.owner
        issue["temple_name"] = frappe.db.get_value("Temple", issue.temple, "temple_name") or issue.temple

    latest_donations = frappe.get_all("Inventory Entry",
        filters={**activities_filters, "reference_type": "Donation"},
        fields=["name", "reference_name", "posting_date", "temple"],
        order_by="posting_date desc",
        limit=5
    )
    for d in latest_donations:
        donor_name, amount = frappe.db.get_value("Donation", d.reference_name, ["donor_name", "total_amount"]) or ("Anonymous", 0)
        d["donor_name"] = donor_name
        d["amount"] = amount
        d["temple_name"] = frappe.db.get_value("Temple", d.temple, "temple_name") or d.temple

    # Top most stocked items (highest current stock)
    temple_cond_stock = ""
    query_args_stock = {}
    if temple:
        temple_cond_stock = "AND temple = %(temple)s"
        query_args_stock["temple"] = temple

    top_most_stock = frappe.db.sql(f"""
    SELECT
        i.item_name AS name,
        i.total_stock AS qty,
        i.unit,
        IFNULL(c.category_name, 'Uncategorized') AS category
    FROM `tabItem` i
    LEFT JOIN `tabItem Category` c
        ON i.item_category = c.name
    WHERE i.status = 'Active' {temple_cond_stock}
    ORDER BY i.total_stock DESC
    LIMIT 10
""", query_args_stock, as_dict=True)

    return {
        "summary": {
            "total_items": total_items,
            "total_stock_qty": total_stock_qty,
            "current_stock_value": current_stock_value,
            "low_stock_items": low_stock_items,
            "out_of_stock_items": out_of_stock_items,
            "today_stock_in": period_in_qty,
            "today_stock_out": period_out_qty
        },
        "charts": {
            "monthly_stock_in_out": months_query,
            "category_wise_stock": category_data,
            "top_consumed_items": top_consumed
        },
        "activities": {
            "latest_stock_entries": latest_entries,
            "latest_stock_issues": latest_issues,
            "latest_donations": latest_donations
        },
        "top_most_stock": top_most_stock
    }


@frappe.whitelist()
def seed_inventory_demo_data():
    # 1. Create Temple if none exists
    temple = None
    temples = frappe.get_all("Temple", limit=1)
    if temples:
        temple = temples[0].name
    else:
        t_doc = frappe.get_doc({
            "doctype": "Temple",
            "temple_name": "Main Temple Trust",
            "city": "Mumbai",
            "state": "Maharashtra"
        })
        t_doc.insert(ignore_permissions=True)
        temple = t_doc.name

    # 2. Create Item Categories
    categories = ["Pooja Items", "Prasad Ingredients", "Cleaning & Maintenance", "Assets"]
    cat_map = {}
    for cat in categories:
        exists = frappe.db.exists("Item Category", {"category_name": cat})
        if not exists:
            c_doc = frappe.get_doc({
                "doctype": "Item Category",
                "category_name": cat,
                "description": f"Category for {cat}"
            })
            c_doc.insert(ignore_permissions=True)
            cat_map[cat] = c_doc.name
        else:
            cat_map[cat] = exists

    # 3. Create Store Locations
    locations = ["Main Store", "Kitchen Warehouse", "Temple Office"]
    loc_map = {}
    for loc in locations:
        exists = frappe.db.exists("Store Location", {"location_name": loc})
        if not exists:
            l_doc = frappe.get_doc({
                "doctype": "Store Location",
                "location_name": loc,
                "description": f"Storage area: {loc}",
                "temple": temple
            })
            l_doc.insert(ignore_permissions=True)
            loc_map[loc] = l_doc.name
        else:
            loc_map[loc] = exists

    # 4. Create Items
    items_to_create = [
        {"item_name": "Rice", "unit": "Kg", "category": "Prasad Ingredients", "location": "Kitchen Warehouse", "min": 50, "max": 500, "code": "ITM-RIC-001"},
        {"item_name": "Ghee", "unit": "Litre", "category": "Prasad Ingredients", "location": "Kitchen Warehouse", "min": 10, "max": 100, "code": "ITM-GHE-002"},
        {"item_name": "Incense Sticks", "unit": "Nos", "category": "Pooja Items", "location": "Main Store", "min": 20, "max": 200, "code": "ITM-INC-003"},
        {"item_name": "Camphor", "unit": "Kg", "category": "Pooja Items", "location": "Main Store", "min": 5, "max": 50, "code": "ITM-CAM-004"},
        {"item_name": "Coconut", "unit": "Nos", "category": "Pooja Items", "location": "Kitchen Warehouse", "min": 100, "max": 1000, "code": "ITM-COC-005"},
        {"item_name": "Cleaning Liquid", "unit": "Litre", "category": "Cleaning & Maintenance", "location": "Main Store", "min": 15, "max": 80, "code": "ITM-CLN-006"}
    ]
    item_map = {}
    for itm in items_to_create:
        exists = frappe.db.exists("Item", {"item_name": itm["item_name"]})
        if not exists:
            i_doc = frappe.get_doc({
                "doctype": "Item",
                "item_name": itm["item_name"],
                "item_code": itm["code"],
                "item_category": cat_map[itm["category"]],
                "store_location": loc_map[itm["location"]],
                "unit": itm["unit"],
                "minimum_stock": itm["min"],
                "maximum_stock": itm["max"],
                "status": "Active",
                "temple": temple
            })
            i_doc.insert(ignore_permissions=True)
            item_map[itm["item_name"]] = i_doc.name
        else:
            item_map[itm["item_name"]] = exists

    # 5. Create past stock entries to build beautiful stats
    existing_entries = frappe.get_all("Inventory Entry", limit=1)
    if not existing_entries:
        import datetime
        base_date = datetime.datetime.now()

        # Entry 1: Stock In (5 months ago)
        e1 = frappe.get_doc({
            "doctype": "Inventory Entry",
            "entry_type": "Stock In",
            "posting_date": (base_date - datetime.timedelta(days=150)).strftime("%Y-%m-%d %H:%M:%S"),
            "temple": temple,
            "remarks": "Initial stock receipt",
            "items": [
                {"item": item_map["Rice"], "qty": 300.0, "unit": "Kg", "rate": 60.0, "total_amount": 18000.0},
                {"item": item_map["Ghee"], "qty": 60.0, "unit": "Litre", "rate": 650.0, "total_amount": 39000.0},
                {"item": item_map["Incense Sticks"], "qty": 150.0, "unit": "Nos", "rate": 45.0, "total_amount": 6750.0}
            ]
        })
        e1.insert(ignore_permissions=True)
        e1.submit()

        # Entry 2: Stock Out (4 months ago)
        e2 = frappe.get_doc({
            "doctype": "Inventory Entry",
            "entry_type": "Stock Out",
            "posting_date": (base_date - datetime.timedelta(days=120)).strftime("%Y-%m-%d %H:%M:%S"),
            "temple": temple,
            "remarks": "Prasad distribution and daily Pooja consumption",
            "items": [
                {"item": item_map["Rice"], "qty": 120.0, "unit": "Kg", "rate": 60.0, "total_amount": 7200.0},
                {"item": item_map["Ghee"], "qty": 25.0, "unit": "Litre", "rate": 650.0, "total_amount": 16250.0},
                {"item": item_map["Incense Sticks"], "qty": 50.0, "unit": "Nos", "rate": 45.0, "total_amount": 2250.0}
            ]
        })
        e2.insert(ignore_permissions=True)
        e2.submit()

        # Entry 3: Stock In (3 months ago)
        e3 = frappe.get_doc({
            "doctype": "Inventory Entry",
            "entry_type": "Stock In",
            "posting_date": (base_date - datetime.timedelta(days=90)).strftime("%Y-%m-%d %H:%M:%S"),
            "temple": temple,
            "remarks": "Festival supply receipt",
            "items": [
                {"item": item_map["Rice"], "qty": 400.0, "unit": "Kg", "rate": 62.0, "total_amount": 24800.0},
                {"item": item_map["Coconut"], "qty": 800.0, "unit": "Nos", "rate": 20.0, "total_amount": 16000.0},
                {"item": item_map["Camphor"], "qty": 40.0, "unit": "Kg", "rate": 400.0, "total_amount": 16000.0}
            ]
        })
        e3.insert(ignore_permissions=True)
        e3.submit()

        # Entry 4: Stock Out (2 months ago)
        e4 = frappe.get_doc({
            "doctype": "Inventory Entry",
            "entry_type": "Stock Out",
            "posting_date": (base_date - datetime.timedelta(days=60)).strftime("%Y-%m-%d %H:%M:%S"),
            "temple": temple,
            "remarks": "Maha Pooja consumption",
            "items": [
                {"item": item_map["Rice"], "qty": 200.0, "unit": "Kg", "rate": 62.0, "total_amount": 12400.0},
                {"item": item_map["Ghee"], "qty": 20.0, "unit": "Litre", "rate": 650.0, "total_amount": 13000.0},
                {"item": item_map["Coconut"], "qty": 500.0, "unit": "Nos", "rate": 20.0, "total_amount": 10000.0},
                {"item": item_map["Camphor"], "qty": 15.0, "unit": "Kg", "rate": 400.0, "total_amount": 6000.0}
            ]
        })
        e4.insert(ignore_permissions=True)
        e4.submit()

        # Entry 5: Stock In (15 days ago)
        e5 = frappe.get_doc({
            "doctype": "Inventory Entry",
            "entry_type": "Stock In",
            "posting_date": (base_date - datetime.timedelta(days=15)).strftime("%Y-%m-%d %H:%M:%S"),
            "temple": temple,
            "remarks": "Monthly refill",
            "items": [
                {"item": item_map["Rice"], "qty": 150.0, "unit": "Kg", "rate": 62.0, "total_amount": 9300.0},
                {"item": item_map["Ghee"], "qty": 30.0, "unit": "Litre", "rate": 680.0, "total_amount": 20400.0},
                {"item": item_map["Cleaning Liquid"], "qty": 50.0, "unit": "Litre", "rate": 90.0, "total_amount": 4500.0}
            ]
        })
        e5.insert(ignore_permissions=True)
        e5.submit()

        # Entry 6: Stock Out (2 days ago)
        e6 = frappe.get_doc({
            "doctype": "Inventory Entry",
            "entry_type": "Stock Out",
            "posting_date": (base_date - datetime.timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S"),
            "temple": temple,
            "remarks": "Weekly consumption",
            "items": [
                {"item": item_map["Rice"], "qty": 490.0, "unit": "Kg", "rate": 62.0, "total_amount": 30380.0},
                {"item": item_map["Ghee"], "qty": 40.0, "unit": "Litre", "rate": 680.0, "total_amount": 27200.0},
                {"item": item_map["Coconut"], "qty": 300.0, "unit": "Nos", "rate": 20.0, "total_amount": 6000.0}
            ]
        })
        e6.insert(ignore_permissions=True)
        e6.submit()

    return {"status": "success", "message": "Demo data populated successfully!"}


@frappe.whitelist()
def get_latest_item_rate(item):
    """
    Get the latest transaction rate for a given item bypassing direct child table restrictions.
    """
    if not item:
        return 0.0
    try:
        rates = frappe.get_all(
            "Inventory Item",
            filters={"item": item},
            fields=["rate"],
            order_by="creation desc",
            limit=1,
            ignore_permissions=True
        )
        if rates:
            return float(rates[0].get("rate") or 0.0)
    except Exception as e:
        frappe.log_error(f"Error fetching latest item rate: {str(e)}")
    return 0.0


# ---------------------------------------------------------------------------
# Role & Permission Management (scoped to app Role Profile)
# ---------------------------------------------------------------------------

SYSTEM_PROTECTED_ROLES = {"Administrator", "System Manager", "All", "Guest"}
APP_STATIC_ROLES = {"Super Admin", "Temple Admin", "Cashier"}
ROLE_ADMIN_ROLES = {"Administrator", "System Manager", "Super Admin", "Temple Admin"}
APP_ROLE_PROFILE_NAME = "Trust Management Roles"

PERMISSION_DOCTYPES = [
    "Donor", "Temple", "Donation", "Donation Type", "User", "Item",
    "Inventory Entry", "Room", "Room Booking", "Building", "Room Type",
    "Item Category", "Store Location", "Document Template", "Receipt Settings",
    "Temple General Settings", "Temple Booking Settings", "Temple Notification Settings",
]

ROLE_DISPLAY_LABELS = {
    "Temple Admin": "Trust Admin",
}


def _ensure_role_admin():
    if not any(role in ROLE_ADMIN_ROLES for role in frappe.get_roles()):
        frappe.throw(_("Not permitted to manage roles"), frappe.PermissionError)


def _ensure_app_role_profile():
    """Ensure the app Role Profile exists with default static roles."""
    if frappe.db.exists("Role Profile", APP_ROLE_PROFILE_NAME):
        return APP_ROLE_PROFILE_NAME

    profile = frappe.new_doc("Role Profile")
    profile.role_profile = APP_ROLE_PROFILE_NAME
    for role_name in sorted(APP_STATIC_ROLES):
        if frappe.db.exists("Role", role_name):
            profile.append("roles", {"role": role_name})
    profile.insert(ignore_permissions=True)
    frappe.db.commit()
    return APP_ROLE_PROFILE_NAME


def _get_app_role_profile_doc():
    _ensure_app_role_profile()
    return frappe.get_doc("Role Profile", APP_ROLE_PROFILE_NAME)


def _get_profile_role_names():
    _ensure_app_role_profile()
    return frappe.get_all(
        "Has Role",
        filters={"parenttype": "Role Profile", "parent": APP_ROLE_PROFILE_NAME},
        pluck="role",
        order_by="idx asc",
    )


def _add_role_to_profile(role_name):
    profile = _get_app_role_profile_doc()
    if any(row.role == role_name for row in profile.roles):
        return
    profile.append("roles", {"role": role_name})
    profile.save(ignore_permissions=True)


def _remove_role_from_profile(role_name):
    profile = _get_app_role_profile_doc()
    profile.roles = [row for row in profile.roles if row.role != role_name]
    profile.save(ignore_permissions=True)


def _ensure_role_in_profile(role_name):
    if role_name not in _get_profile_role_names():
        frappe.throw(_("Role '{0}' is not part of the app role profile.").format(role_name))


def _get_protected_role_names():
    return APP_STATIC_ROLES


def _get_assignable_role_names():
    return sorted(_get_profile_role_names())


def _parse_json_arg(value, default=None):
    import json

    if value is None:
        return default if default is not None else []
    if isinstance(value, str):
        return json.loads(value)
    return value


def _upsert_custom_docperm(role_name, doctype, read=0, write=0, create=0, delete=0):
    existing = frappe.db.exists("Custom DocPerm", {
        "role": role_name,
        "parent": doctype,
        "permlevel": 0,
    })

    if existing:
        doc = frappe.get_doc("Custom DocPerm", existing)
        doc.read = read
        doc.write = write
        doc.create = create
        doc.delete = delete
        doc.save(ignore_permissions=True)
        return doc.name

    doc = frappe.new_doc("Custom DocPerm")
    doc.parent = doctype
    doc.parenttype = "DocType"
    doc.parentfield = "permissions"
    doc.role = role_name
    doc.permlevel = 0
    doc.read = read
    doc.write = write
    doc.create = create
    doc.delete = delete
    doc.insert(ignore_permissions=True)
    return doc.name


def _get_role_permission_doctypes(role_name):
    if role_name in APP_STATIC_ROLES:
        return list(PERMISSION_DOCTYPES)

    configured = frappe.get_all(
        "Custom DocPerm",
        filters={"role": role_name, "parent": ["in", PERMISSION_DOCTYPES], "permlevel": 0},
        pluck="parent",
    )
    configured = list(dict.fromkeys(configured))

    if configured:
        return [dt for dt in PERMISSION_DOCTYPES if dt in configured]

    return []


def _get_doctypes_with_custom_docperms():
    """DocTypes that have any Custom DocPerm — standard DocPerm is ignored for these."""
    return set(
        frappe.get_all(
            "Custom DocPerm",
            filters={"parent": ["in", PERMISSION_DOCTYPES], "permlevel": 0},
            pluck="parent",
            distinct=1,
        )
    )


def _build_effective_permission_row(role_name, doctype):
    """Return runtime-effective permissions (matches Frappe's get_valid_perms logic)."""
    if role_name in ("Super Admin", "Administrator", "System Manager"):
        return {
            "doctype": doctype,
            "read": 1,
            "write": 1,
            "create": 1,
            "delete": 1,
            "source": "standard",
        }

    doctypes_with_custom = _get_doctypes_with_custom_docperms()

    if doctype in doctypes_with_custom:
        custom_perm = frappe.get_all(
            "Custom DocPerm",
            filters={"role": role_name, "parent": doctype, "permlevel": 0},
            fields=["read", "write", "create", "delete"],
            limit=1,
        )
        if custom_perm:
            perm = custom_perm[0]
            return {
                "doctype": doctype,
                "read": perm.read or 0,
                "write": perm.write or 0,
                "create": perm.create or 0,
                "delete": perm.delete or 0,
                "source": "custom",
            }
        return {
            "doctype": doctype,
            "read": 0,
            "write": 0,
            "create": 0,
            "delete": 0,
            "source": "none",
        }

    std_perm = frappe.get_all(
        "DocPerm",
        filters={"role": role_name, "parent": doctype, "permlevel": 0},
        fields=["read", "write", "create", "delete"],
        limit=1,
    )
    if std_perm:
        perm = std_perm[0]
        return {
            "doctype": doctype,
            "read": perm.read or 0,
            "write": perm.write or 0,
            "create": perm.create or 0,
            "delete": perm.delete or 0,
            "source": "standard",
        }

    return {
        "doctype": doctype,
        "read": 0,
        "write": 0,
        "create": 0,
        "delete": 0,
        "source": "none",
    }


def _build_permission_row(role_name, doctype):
    row = _build_effective_permission_row(role_name, doctype)
    return {
        "doctype": row["doctype"],
        "read": row["read"],
        "write": row["write"],
        "create": row["create"],
        "delete": row["delete"],
        "is_custom": row["source"] == "custom",
    }


def _summarize_permissions(permissions):
    accessible = [p for p in permissions if p["read"] or p["write"] or p["create"] or p["delete"]]
    full_access = [
        p for p in permissions
        if p["read"] and p["write"] and p["create"] and p["delete"]
    ]
    read_only = [
        p for p in permissions
        if p["read"] and not p["write"] and not p["create"] and not p["delete"]
    ]
    no_access = [
        p for p in permissions
        if not p["read"] and not p["write"] and not p["create"] and not p["delete"]
    ]

    return {
        "total_modules": len(permissions),
        "accessible_modules": len(accessible),
        "full_access_modules": len(full_access),
        "read_only_modules": len(read_only),
        "no_access_modules": len(no_access),
    }


def _ensure_user_view_access(user_name):
    current_user = frappe.session.user
    if current_user == user_name:
        return
    if not any(role in ROLE_ADMIN_ROLES for role in frappe.get_roles()):
        frappe.throw(_("Not permitted to view this user"), frappe.PermissionError)
    if not frappe.has_permission("User", "read", user_name):
        frappe.throw(_("Not permitted to view this user"), frappe.PermissionError)


def _permission_access_level(perm):
    if perm["read"] and perm["write"] and perm["create"] and perm["delete"]:
        return "full"
    if perm["read"] and not perm["write"] and not perm["create"] and not perm["delete"]:
        return "read_only"
    if perm["read"] or perm["write"] or perm["create"] or perm["delete"]:
        return "partial"
    return "none"


def _serialize_user_module_permissions(role_name, permissions):
    serialized = []
    for perm in permissions:
        serialized.append({
            "doctype": perm["doctype"],
            "read": perm["read"],
            "write": perm["write"],
            "create": perm["create"],
            "delete": perm["delete"],
            "access_level": _permission_access_level(perm),
            "source": perm.get("source", "standard"),
        })
    return {
        "role": role_name,
        "role_label": ROLE_DISPLAY_LABELS.get(role_name, role_name),
        "permissions": serialized,
        "summary": _summarize_permissions(serialized),
    }


@frappe.whitelist()
def get_user_module_permissions(user_name):
    """Return effective module permissions for a user based on their assigned role and overrides."""
    user_name = (user_name or "").strip()
    if not user_name:
        frappe.throw(_("User is required."))

    _ensure_user_view_access(user_name)

    role_name = frappe.db.get_value("User", user_name, "custom_user_role")
    if not role_name:
        return _serialize_user_module_permissions(None, [])

    # Get user extra permissions override
    extra_perms = {
        p.doctype_name: p
        for p in frappe.get_all(
            "User Extra Permission",
            filters={"user": user_name},
            fields=["doctype_name", "read", "write", "create", "delete"]
        )
    }

    permissions = []
    for doctype in PERMISSION_DOCTYPES:
        role_row = _build_effective_permission_row(role_name, doctype)
        if doctype in extra_perms:
            p = extra_perms[doctype]
            
            combined_read = role_row["read"] or (p.read or 0)
            combined_write = role_row["write"] or (p.write or 0)
            combined_create = role_row["create"] or (p.create or 0)
            combined_delete = role_row["delete"] or (p.delete or 0)
            
            has_upgrade = (
                (p.read and not role_row["read"]) or
                (p.write and not role_row["write"]) or
                (p.create and not role_row["create"]) or
                (p.delete and not role_row["delete"])
            )
            
            permissions.append({
                "doctype": doctype,
                "read": combined_read,
                "write": combined_write,
                "create": combined_create,
                "delete": combined_delete,
                "source": "extra" if has_upgrade else role_row.get("source", "standard"),
            })
        else:
            permissions.append(role_row)

    return _serialize_user_module_permissions(role_name, permissions)


@frappe.whitelist()
def get_permission_doctypes():
    """Return all app doctypes available for role permission configuration."""
    _ensure_role_admin()
    return PERMISSION_DOCTYPES


@frappe.whitelist()
def get_role_profile_info():
    """Return the app Role Profile used to scope role management."""
    _ensure_role_admin()
    _ensure_app_role_profile()
    role_names = _get_profile_role_names()
    return {
        "name": APP_ROLE_PROFILE_NAME,
        "role_count": len(role_names),
    }


@frappe.whitelist()
def get_assignable_roles():
    """Return roles from the app Role Profile for the User form."""
    roles = []
    for role_name in _get_assignable_role_names():
        roles.append({
            "name": role_name,
            "label": ROLE_DISPLAY_LABELS.get(role_name, role_name),
            "is_static": role_name in APP_STATIC_ROLES,
        })
    return roles


@frappe.whitelist()
def get_custom_roles():
    """Fetch only roles inside the app Role Profile."""
    _ensure_role_admin()
    protected = _get_protected_role_names()
    result = []

    for role_name in _get_profile_role_names():
        if not frappe.db.exists("Role", role_name):
            continue
        disabled = frappe.db.get_value("Role", role_name, "disabled") or 0
        user_count = frappe.db.count("User", {"custom_user_role": role_name})
        result.append({
            "name": role_name,
            "disabled": disabled,
            "is_protected": role_name in protected,
            "is_static": role_name in APP_STATIC_ROLES,
            "user_count": user_count,
        })
    return result


@frappe.whitelist()
def create_custom_role(role_name, doctypes=None):
    """Create a new custom role with optional initial doctype permissions."""
    _ensure_role_admin()
    role_name = (role_name or "").strip()
    if not role_name:
        frappe.throw(_("Role name is required."))

    if frappe.db.exists("Role", role_name):
        frappe.throw(_("Role '{0}' already exists.").format(role_name))

    if role_name in SYSTEM_PROTECTED_ROLES:
        frappe.throw(_("Role '{0}' is reserved and cannot be created.").format(role_name))

    role = frappe.new_doc("Role")
    role.role_name = role_name
    role.insert(ignore_permissions=True)
    _add_role_to_profile(role_name)

    selected_doctypes = _parse_json_arg(doctypes, [])
    allowed = set(PERMISSION_DOCTYPES)
    for doctype in selected_doctypes:
        if doctype in allowed:
            _upsert_custom_docperm(role_name, doctype)

    frappe.clear_cache(doctype="DocType")
    frappe.db.commit()
    return {"name": role.name}


@frappe.whitelist()
def update_custom_role(role_name, new_role_name=None):
    """Rename a custom role."""
    _ensure_role_admin()
    role_name = (role_name or "").strip()
    new_role_name = (new_role_name or "").strip()

    if role_name in _get_protected_role_names():
        frappe.throw(_("Role '{0}' cannot be renamed.").format(role_name))

    _ensure_role_in_profile(role_name)

    if not frappe.db.exists("Role", role_name):
        frappe.throw(_("Role '{0}' does not exist.").format(role_name))

    if not new_role_name or new_role_name == role_name:
        return {"name": role_name}

    if frappe.db.exists("Role", new_role_name):
        frappe.throw(_("Role '{0}' already exists.").format(new_role_name))

    frappe.rename_doc("Role", role_name, new_role_name, force=True, ignore_permissions=True)
    frappe.db.sql(
        "UPDATE `tabUser` SET custom_user_role = %s WHERE custom_user_role = %s",
        (new_role_name, role_name),
    )
    frappe.db.sql(
        """
        UPDATE `tabHas Role`
        SET role = %s
        WHERE parenttype = 'Role Profile' AND parent = %s AND role = %s
        """,
        (new_role_name, APP_ROLE_PROFILE_NAME, role_name),
    )
    frappe.db.commit()
    return {"name": new_role_name}


@frappe.whitelist()
def delete_custom_role(role_name):
    """Delete a custom role and its permission configuration."""
    _ensure_role_admin()

    if role_name in _get_protected_role_names():
        frappe.throw(_("Role '{0}' is a system-protected role and cannot be deleted.").format(role_name))

    _ensure_role_in_profile(role_name)

    if not frappe.db.exists("Role", role_name):
        frappe.throw(_("Role '{0}' does not exist.").format(role_name))

    assigned_users = frappe.db.count("User", {"custom_user_role": role_name})
    if assigned_users:
        frappe.throw(
            _("Role '{0}' is assigned to {1} user(s). Reassign them before deleting.").format(
                role_name, assigned_users
            )
        )

    for perm in frappe.get_all("Custom DocPerm", filters={"role": role_name}, pluck="name"):
        frappe.delete_doc("Custom DocPerm", perm, ignore_permissions=True)

    _remove_role_from_profile(role_name)
    frappe.delete_doc("Role", role_name, ignore_permissions=True)
    frappe.clear_cache(doctype="DocType")
    frappe.db.commit()
    return True


@frappe.whitelist()
def get_role_permissions(role_name):
    """Fetch read/write/create/delete permissions for configured doctypes."""
    _ensure_role_admin()
    _ensure_role_in_profile(role_name)
    doctypes = _get_role_permission_doctypes(role_name)
    return [_build_permission_row(role_name, doctype) for doctype in doctypes]


@frappe.whitelist()
def add_role_doctypes(role_name, doctypes):
    """Add doctypes to a role permission matrix."""
    _ensure_role_admin()
    _ensure_role_in_profile(role_name)
    selected = _parse_json_arg(doctypes, [])
    allowed = set(PERMISSION_DOCTYPES)

    for doctype in selected:
        if doctype not in allowed:
            continue
        _upsert_custom_docperm(role_name, doctype)

    frappe.clear_cache(doctype="DocType")
    frappe.db.commit()
    return get_role_permissions(role_name)


@frappe.whitelist()
def remove_role_doctype(role_name, doctype):
    """Remove a doctype from a role permission matrix."""
    _ensure_role_admin()
    _ensure_role_in_profile(role_name)

    if role_name in APP_STATIC_ROLES:
        frappe.throw(_("Cannot remove doctypes from static app roles."))

    existing = frappe.db.exists("Custom DocPerm", {
        "role": role_name,
        "parent": doctype,
        "permlevel": 0,
    })
    if existing:
        frappe.delete_doc("Custom DocPerm", existing, ignore_permissions=True)

    frappe.clear_cache(doctype="DocType")
    frappe.db.commit()
    return True


@frappe.whitelist()
def save_role_permissions(role_name, permissions):
    """Save custom role permissions for selected doctypes."""
    _ensure_role_admin()
    _ensure_role_in_profile(role_name)
    permissions = _parse_json_arg(permissions, [])

    for perm in permissions:
        doctype = perm.get("doctype")
        if doctype not in PERMISSION_DOCTYPES:
            continue
        _upsert_custom_docperm(
            role_name,
            doctype,
            read=int(perm.get("read", 0)),
            write=int(perm.get("write", 0)),
            create=int(perm.get("create", 0)),
            delete=int(perm.get("delete", 0)),
        )

    frappe.clear_cache(doctype="DocType")
    frappe.db.commit()
    return True


@frappe.whitelist()
def get_user_extra_permissions(user_name=None, role_name=None):
    """Fetch user-specific permission matrix alongside role defaults."""
    _ensure_role_admin()
    user_name = (user_name or "").strip()
    
    if not role_name and user_name:
        role_name = frappe.db.get_value("User", user_name, "custom_user_role")

    if not role_name:
        return []

    # Get existing overrides if user_name is provided
    extra_perms = {}
    if user_name:
        extra_perms = {
            p.doctype_name: p
            for p in frappe.get_all(
                "User Extra Permission",
                filters={"user": user_name},
                fields=["doctype_name", "read", "write", "create", "delete"]
            )
        }

    result = []
    for doctype in PERMISSION_DOCTYPES:
        role_row = _build_effective_permission_row(role_name, doctype)
        p = extra_perms.get(doctype) if extra_perms else None
        result.append({
            "doctype": doctype,
            "read": p.read if p else 0,
            "write": p.write if p else 0,
            "create": p.create if p else 0,
            "delete": p.delete if p else 0,
            "role_read": role_row["read"],
            "role_write": role_row["write"],
            "role_create": role_row["create"],
            "role_delete": role_row["delete"],
            "is_extra": bool(p),
        })

    return result


@frappe.whitelist()
def save_user_extra_permissions(user_name, permissions):
    """Save user-specific permission overrides."""
    _ensure_role_admin()
    user_name = (user_name or "").strip()
    if not user_name:
        frappe.throw(_("User name is required."))

    permissions = _parse_json_arg(permissions, [])

    for perm in permissions:
        doctype = perm.get("doctype")
        if doctype not in PERMISSION_DOCTYPES:
            continue

        read = int(perm.get("read", 0))
        write = int(perm.get("write", 0))
        create = int(perm.get("create", 0))
        delete = int(perm.get("delete", 0))

        # Check if an override already exists
        existing = frappe.db.exists("User Extra Permission", {
            "user": user_name,
            "doctype_name": doctype
        })

        if existing:
            doc = frappe.get_doc("User Extra Permission", existing)
            doc.read = read
            doc.write = write
            doc.create = create
            doc.delete = delete
            doc.save(ignore_permissions=True)
        else:
            doc = frappe.new_doc("User Extra Permission")
            doc.user = user_name
            doc.doctype_name = doctype
            doc.read = read
            doc.write = write
            doc.create = create
            doc.delete = delete
            doc.insert(ignore_permissions=True)

    frappe.clear_cache(doctype="DocType")
    frappe.db.commit()
    return True


@frappe.whitelist()
def reset_user_extra_permissions(user_name):
    """Delete all user-specific permission overrides, falling back to role defaults."""
    _ensure_role_admin()
    user_name = (user_name or "").strip()
    if not user_name:
        frappe.throw(_("User name is required."))

    frappe.db.delete("User Extra Permission", {"user": user_name})
    frappe.clear_cache(doctype="DocType")
    frappe.db.commit()
    return True


RELATIONAL_DEPENDENCIES = {
    "Donor": ["Donation", "Room Booking"],
    "Temple": ["Donation", "Room Booking"],
    "Donation Type": ["Donation"],
    "Item": ["Inventory Entry"],
    "Store Location": ["Inventory Entry"],
    "Item Category": ["Item"],
    "Room": ["Room Booking"],
    "Building": ["Room"],
    "Room Type": ["Room"],
    "User": ["Donation"],
}


def _user_has_recursive_permission(user, doctype, mapped_ptype, visited=None):
    if visited is None:
        visited = set()

    if doctype in visited:
        return False
    visited.add(doctype)

    # 1. Check direct override for this doctype
    extra_perm = frappe.db.get_value(
        "User Extra Permission",
        {"user": user, "doctype_name": doctype},
        ["read", "write", "create", "delete"],
        as_dict=True
    )
    if extra_perm and bool(extra_perm.get(mapped_ptype)):
        return True

    # 2. Check direct role default permission for this doctype
    user_role = frappe.db.get_value("User", user, "custom_user_role")
    if user_role:
        role_row = _build_effective_permission_row(user_role, doctype)
        if role_row and role_row.get(mapped_ptype):
            return True

    # 3. If checking read permission, check if the user has read permission on any parent that links to it
    if mapped_ptype == "read":
        parents = RELATIONAL_DEPENDENCIES.get(doctype, [])
        for parent in parents:
            if _user_has_recursive_permission(user, parent, "read", visited):
                return True

    return False


def has_user_extra_permission(doc, ptype=None, user=None):
    """Check user-specific permission overrides (used as a Frappe permission hook)."""
    if not user:
        user = frappe.session.user

    # Administrator and Guest bypass custom overrides
    if user in ("Administrator", "Guest"):
        return None

    doctype = doc if isinstance(doc, str) else doc.doctype
    if doctype not in PERMISSION_DOCTYPES:
        return None

    # Super Admin and System Manager have all permissions for custom doctypes
    user_roles = frappe.get_roles(user)
    if "Super Admin" in user_roles or "System Manager" in user_roles:
        return True

    ptype_map = {
        "read": "read",
        "write": "write",
        "create": "create",
        "delete": "delete",
    }
    mapped_ptype = ptype_map.get(ptype)
    if not mapped_ptype:
        return None

    # Resolve recursively
    if _user_has_recursive_permission(user, doctype, mapped_ptype):
        return True

    return None


def ensure_temple_donation_roles():
    """Called after migrate to ensure app Role Profile and static roles exist."""
    _ensure_app_role_profile()
    for doctype in PERMISSION_DOCTYPES:
        _upsert_custom_docperm(
            role_name="Super Admin",
            doctype=doctype,
            read=1,
            write=1,
            create=1,
            delete=1
        )

