# Copyright (c) 2026, sk and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _

class InventoryEntry(Document):
	def validate(self):
		for item in self.items:
			if not item.unit:
				item.unit = frappe.db.get_value("Item", item.item, "unit")
			item.total_amount = (item.qty or 0) * (item.rate or 0)

	def on_submit(self):
		self.update_stock()

	def on_cancel(self):
		self.update_stock(reverse=True)

	def update_stock(self, reverse=False):
		for item in self.items:
			qty = item.qty or 0
			# Entry Types: Stock In, Stock Out, Stock Adjustment
			# Support legacy IN/OUT types too
			is_out = self.entry_type in ["OUT", "Stock Out"]
			is_in = self.entry_type in ["IN", "Stock In"]
			
			if is_out:
				actual_qty = -qty if not reverse else qty
			elif is_in:
				actual_qty = qty if not reverse else -qty
			else: # Stock Adjustment
				actual_qty = qty if not reverse else -qty

			stock_data = frappe.db.get_value("Item", item.item, ["total_stock", "current_stock", "minimum_stock", "item_name", "item_code", "name"], as_dict=True)
			if not stock_data:
				continue
			
			total_stock = float(stock_data.get("total_stock") or 0)
			current_stock = float(stock_data.get("current_stock") or 0)

			new_total = total_stock + actual_qty
			new_current = current_stock + actual_qty

			frappe.db.set_value("Item", item.item, {
				"total_stock": new_total,
				"current_stock": new_current
			}, update_modified=True)

			# Trigger low stock check on subtraction (issue/stock out)
			if not reverse and is_out and new_total < float(stock_data.get("minimum_stock") or 0):
				self.send_low_stock_notification(stock_data, new_total)

	def send_low_stock_notification(self, item_data, current_stock):
		"""
		Sends in-app notifications and email alerts when stock drops below threshold.
		"""
		item_name = item_data.get("item_name") or item_data.get("name")
		item_code = item_data.get("item_code") or ""
		min_stock = float(item_data.get("minimum_stock") or 0)

		# 1. Create In-App Notification (Notification Log) if Doctype exists
		try:
			if frappe.db.exists("DocType", "Notification Log"):
				users = frappe.get_all("User", filters={"enabled": 1}, fields=["name"])
				system_managers = []
				for u in users:
					if "System Manager" in frappe.get_roles(u.name) or "Administrator" in frappe.get_roles(u.name):
						system_managers.append(u.name)
				
				for manager in system_managers:
					doc = frappe.new_doc("Notification Log")
					doc.for_user = manager
					doc.subject = _("Low Stock Alert: {0} ({1}) is below minimum stock.").format(item_name, item_code)
					doc.email_content = _("Item {0} has current stock {1}, which is below the minimum threshold of {2}.").format(
						item_name, current_stock, min_stock
					)
					doc.document_type = "Item"
					doc.document_name = item_data.get("name")
					doc.insert(ignore_permissions=True)
		except Exception as e:
			frappe.log_error(title="Low Stock In-App Notification Error", message=frappe.get_traceback())

		# 2. Send email alert to System Managers
		try:
			users = frappe.get_all("User", filters={"enabled": 1}, fields=["name", "email"])
			recipients = []
			for u in users:
				if u.email and ("System Manager" in frappe.get_roles(u.name) or "Administrator" in frappe.get_roles(u.name)):
					recipients.append(u.email)
			
			if recipients:
				subject = _("Low Stock Alert: {0}").format(item_name)
				message = f"""
				<p>{_("The stock level for item <b>{0} ({1})</b> has fallen below the defined minimum limit.")}</p>
				<ul>
					<li><b>{_("Current Stock")}:</b> {current_stock}</li>
					<li><b>{_("Minimum Threshold")}:</b> {min_stock}</li>
				</ul>
				<p>{_("Please take necessary actions to replenish the stock.")}</p>
				"""
				frappe.sendmail(
					recipients=recipients,
					subject=subject,
					message=message,
					reference_doctype="Item",
					reference_name=item_data.get("name")
				)
		except Exception as e:
			frappe.log_error(title="Low Stock Email Alert Error", message=frappe.get_traceback())
