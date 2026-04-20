# Copyright (c) 2026, sk and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _

class RoomBooking(Document):
	def validate(self):
		self.check_availability()

	def on_submit(self):
		self.create_donation()
		self.update_room_status("Occupied")

	def on_cancel(self):
		self.update_room_status("Available")

	def check_availability(self):
		# Simple check: if room status is not Available
		status = frappe.db.get_value("Room", self.room, "status")
		if status != "Available":
			frappe.throw(_("Room {0} is not available. Current status: {1}").format(self.room, status))

	def create_donation(self):
		if not self.donation:
			donation = frappe.get_doc({
				"doctype": "Donation",
				"donor": self.donor,
				"temple": self.temple,
				"total_amount": self.total_amount,
				"notes": f"Room Booking Payment for {self.room}",
				"payment_mode": "Cash" # Default
			})
			donation.insert()
			donation.submit()
			self.donation = donation.name
			self.db_set("donation", donation.name)

	def update_room_status(self, status):
		frappe.db.set_value("Room", self.room, "status", status)
