# Copyright (c) 2026, sk and contributors
# For license information, please see license.txt

import os
import frappe
from frappe import _

@frappe.whitelist()
def get_latest_bundle():
	"""Returns the URL of the latest temple_donation JS bundle from public/dist."""
	path = frappe.get_app_path("temple_donation", "public", "dist")

	if not os.path.exists(path):
		return None

	files = os.listdir(path)
	bundles = []

	for f in files:
		if f.startswith("temple_donation.bundle") and f.endswith(".js") and not f.endswith(".map"):
			full_path = os.path.join(path, f)
			bundles.append((f, os.path.getmtime(full_path)))

	if bundles:
		bundles.sort(key=lambda x: x[1], reverse=True)
		return f"/assets/temple_donation/dist/{bundles[0][0]}"

	return None

@frappe.whitelist()
def create_donation(donor, temple, amount, payment_mode="Cash", items=None):
	"""
	Create a donation via API.
	"""
	donation = frappe.get_doc({
		"doctype": "Donation",
		"donor": donor,
		"temple": temple,
		"total_amount": amount,
		"payment_mode": payment_mode
	})
	
	if items:
		if isinstance(items, str):
			import json
			items = json.loads(items)
		for item in items:
			donation.append("material_donations", item)
			
	donation.insert()
	donation.submit()
	return donation.name

@frappe.whitelist()
def get_dashboard_stats(temple=None, user=None, from_date=None, to_date=None):
	"""
	Fetch stats like total donation, available rooms, item stock.
	"""
	filters = {}
	if temple:
		filters["temple"] = temple
	if user:
		filters["cashier"] = user
	if from_date and to_date:
		filters["creation"] = ["between", [from_date, to_date]]
		
	stats = {
		"total_donation": frappe.db.get_value("Donation", filters, "sum(total_amount)") or 0,
		"top_category": "General", # Placeholder or calculate from Donation Breakdown
		"new_donors": frappe.db.count("Donor", {"creation": [">", frappe.utils.add_days(frappe.utils.nowdate(), -30)]})
	}
	return stats

@frappe.whitelist()
def get_donations_by_type(temple=None):
	"""
	Return donation breakdown by type for chart.
	"""
	query = """
		SELECT dt.donation_type as type, SUM(di.amount) as value
		FROM `tabDonation Item` di
		JOIN `tabDonation` d ON di.parent = d.name
		JOIN `tabDonation Type` dt ON di.donation_type = dt.name
		WHERE d.docstatus = 1
	"""
	if temple:
		query += f" AND d.temple = '{temple}'"
	
	query += " GROUP BY dt.donation_type"
	return frappe.db.sql(query, as_dict=True)

@frappe.whitelist()
def get_top_donors(temple=None):
	"""
	Return top donors by amount.
	"""
	filters = {"docstatus": 1}
	if temple:
		filters["temple"] = temple
		
	donors = frappe.get_all("Donation", 
		filters=filters, 
		fields=["donor_name as name", "sum(total_amount) as total"],
		group_by="donor",
		order_by="total DESC",
		limit=5
	)
	return donors

@frappe.whitelist()
def room_availability(temple=None, room_type=None):
	"""
	Fetch list of available rooms.
	"""
	filters = {"status": "Available"}
	if temple:
		filters["temple"] = temple
	if room_type:
		filters["room_type"] = room_type
		
	return frappe.get_all("Room", filters=filters, fields=["name", "room_number", "room_type", "price_per_day"])

@frappe.whitelist()
def inventory_stock(temple=None, item=None):
	"""
	Fetch current stock of items.
	"""
	filters = {}
	if temple:
		filters["temple"] = temple
	if item:
		filters["name"] = item
		
	return frappe.get_all("Item", filters=filters, fields=["name", "item_name", "total_stock", "unit"])
