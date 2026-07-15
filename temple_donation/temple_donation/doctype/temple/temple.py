# Copyright (c) 2026, sk and contributors
# For license information, please see license.txt

import json
import frappe
from frappe.model.document import Document


class Temple(Document):
	def on_update(self):
		if frappe.flags.in_sync:
			return
		frappe.flags.in_sync = True
		try:
			self.sync_to_donation_types()
		finally:
			frappe.flags.in_sync = False

	def on_trash(self):
		if frappe.flags.in_sync:
			return
		frappe.flags.in_sync = True
		try:
			self.remove_from_all_donation_types()
		finally:
			frappe.flags.in_sync = False

	def sync_to_donation_types(self):
		# 1. Get current selected donation types from the child table
		selected_types = [d.donation_type for d in self.donation_types if d.donation_type]

		# 2. Get previous donation types from DB
		db_doc = frappe.get_doc("Temple", self.name) if frappe.db.exists("Temple", self.name) else None
		prev_types = []
		if db_doc:
			prev_types = [d.donation_type for d in db_doc.donation_types if d.donation_type]

		# Donation types to add this temple to
		to_add = set(selected_types) - set(prev_types)
		# Donation types to remove this temple from
		to_remove = set(prev_types) - set(selected_types)

		# Sync additions
		for dt_name in to_add:
			if frappe.db.exists("Donation Type", dt_name):
				dt_doc = frappe.get_doc("Donation Type", dt_name)
				temples = []
				if dt_doc.temple:
					try:
						if dt_doc.temple.startswith("["):
							temples = json.loads(dt_doc.temple)
						else:
							temples = [t.strip() for t in dt_doc.temple.split(",") if t.strip()]
					except Exception:
						temples = [dt_doc.temple]
				if self.name not in temples:
					temples.append(self.name)
					dt_doc.temple = json.dumps(temples)
					dt_doc.save(ignore_permissions=True)

		# Sync removals
		for dt_name in to_remove:
			if frappe.db.exists("Donation Type", dt_name):
				dt_doc = frappe.get_doc("Donation Type", dt_name)
				temples = []
				if dt_doc.temple:
					try:
						if dt_doc.temple.startswith("["):
							temples = json.loads(dt_doc.temple)
						else:
							temples = [t.strip() for t in dt_doc.temple.split(",") if t.strip()]
					except Exception:
						temples = [dt_doc.temple]
				if self.name in temples:
					temples.remove(self.name)
					dt_doc.temple = json.dumps(temples)
					dt_doc.save(ignore_permissions=True)

	def remove_from_all_donation_types(self):
		# Fetch all Donation Types
		donation_types = frappe.get_all("Donation Type", fields=["name", "temple"])
		for dt in donation_types:
			if dt.temple:
				try:
					temples = json.loads(dt.temple) if dt.temple.startswith("[") else [t.strip() for t in dt.temple.split(",") if t.strip()]
				except Exception:
					temples = [dt.temple]
				
				if self.name in temples:
					temples.remove(self.name)
					dt_doc = frappe.get_doc("Donation Type", dt.name)
					dt_doc.temple = json.dumps(temples)
					dt_doc.save(ignore_permissions=True)
