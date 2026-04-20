# Copyright (c) 2026, sk and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class InventoryEntry(Document):
	def on_submit(self):
		self.update_stock()

	def on_cancel(self):
		self.update_stock(reverse=True)

	def update_stock(self, reverse=False):
		for item in self.items:
			qty = item.qty
			if (self.entry_type == "OUT" and not reverse) or (self.entry_type == "IN" and reverse):
				qty = -qty
			
			current_stock = frappe.db.get_value("Item", item.item, "total_stock") or 0
			frappe.db.set_value("Item", item.item, "total_stock", current_stock + qty)
