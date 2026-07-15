# Copyright (c) 2026, sk and contributors
# For license information, please see license.txt

import json
import frappe
from frappe.model.document import Document


class DonationType(Document):
	def on_update(self):
		if frappe.flags.in_sync:
			return
		frappe.flags.in_sync = True
		try:
			self.sync_to_temples()
		finally:
			frappe.flags.in_sync = False

	def on_trash(self):
		if frappe.flags.in_sync:
			return
		frappe.flags.in_sync = True
		try:
			self.remove_from_all_temples()
		finally:
			frappe.flags.in_sync = False

	def sync_to_temples(self):
		# 1. Parse current temples assigned to this donation type
		assigned_temples = []
		if self.temple:
			try:
				if self.temple.startswith("["):
					assigned_temples = json.loads(self.temple)
				else:
					assigned_temples = [t.strip() for t in self.temple.split(",") if t.strip()]
			except Exception:
				assigned_temples = [self.temple]

		# 2. Get previous temples from DB
		db_doc = frappe.get_doc("Donation Type", self.name) if frappe.db.exists("Donation Type", self.name) else None
		prev_temples = []
		if db_doc and db_doc.temple:
			try:
				if db_doc.temple.startswith("["):
					prev_temples = json.loads(db_doc.temple)
				else:
					prev_temples = [t.strip() for t in db_doc.temple.split(",") if t.strip()]
			except Exception:
				prev_temples = [db_doc.temple]

		# Temples to add this donation type to
		to_add = set(assigned_temples) - set(prev_temples)
		# Temples to remove this donation type from
		to_remove = set(prev_temples) - set(assigned_temples)

		# Sync additions
		for temple_name in to_add:
			if frappe.db.exists("Temple", temple_name):
				t_doc = frappe.get_doc("Temple", temple_name)
				# Check if already exists in child table
				exists = any(d.donation_type == self.name for d in t_doc.donation_types)
				if not exists:
					t_doc.append("donation_types", {
						"donation_type": self.name
					})
					t_doc.save(ignore_permissions=True)

		# Sync removals
		for temple_name in to_remove:
			if frappe.db.exists("Temple", temple_name):
				t_doc = frappe.get_doc("Temple", temple_name)
				# Filter out this donation type
				original_len = len(t_doc.donation_types)
				t_doc.donation_types = [d for d in t_doc.donation_types if d.donation_type != self.name]
				if len(t_doc.donation_types) < original_len:
					t_doc.save(ignore_permissions=True)

	def remove_from_all_temples(self):
		# Find all Temples that have this donation type in their child table
		temples = frappe.get_all("Temple Donation Type", filters={"donation_type": self.name}, fields=["parent"])
		temple_names = list(set([t.parent for t in temples]))
		for temple_name in temple_names:
			if frappe.db.exists("Temple", temple_name):
				t_doc = frappe.get_doc("Temple", temple_name)
				t_doc.donation_types = [d for d in t_doc.donation_types if d.donation_type != self.name]
				t_doc.save(ignore_permissions=True)
