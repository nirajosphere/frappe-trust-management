# Copyright (c) 2026, sk and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class Donation(Document):
	def on_submit(self):
		self.create_ledger_entry()
		if self.material_donations:
			self.create_inventory_entry()

	def create_ledger_entry(self):
		frappe.get_doc({
			"doctype": "Temple Ledger",
			"temple": self.temple,
			"posting_date": frappe.utils.nowdate(),
			"transaction_type": "Credit",
			"reference_doctype": "Donation",
			"reference_name": self.name,
			"amount": self.total_amount,
			"notes": f"Donation from {self.donor_name or self.donor}"
		}).insert()

	def create_inventory_entry(self):
		ie = frappe.get_doc({
			"doctype": "Inventory Entry",
			"entry_type": "IN",
			"temple": self.temple,
			"posting_date": frappe.utils.now_datetime(),
			"reference_type": "Donation",
			"reference_name": self.name,
			"items": []
		})
		for item in self.material_donations:
			ie.append("items", {
				"item": item.item,
				"qty": item.qty
			})
		ie.insert()
		ie.submit()
