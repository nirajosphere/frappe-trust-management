# Copyright (c) 2026, sk and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


import frappe
from frappe import _

class Room(Document):
	def validate(self):
		self.validate_temple_change()
		self.validate_unique_room_number()

	def validate_unique_room_number(self):
		if not self.room_number or not self.temple:
			return
		duplicate = frappe.db.exists("Room", {
			"temple": self.temple,
			"room_number": self.room_number,
			"name": ["!=", self.name]
		})
		if duplicate:
			frappe.throw(
				_("Room number '{0}' already exists in the selected Temple.").format(self.room_number)
			)

	def validate_temple_change(self):
		if not self.is_new():
			db_temple = frappe.db.get_value("Room", self.name, "temple")
			if db_temple and db_temple != self.temple:
				# Check for active bookings
				active_bookings = frappe.db.exists("Room Booking", {
					"room": self.name,
					"status": ["in", ["Reserved", "Checked In"]],
				})
				if active_bookings:
					frappe.throw(
						_("Cannot change the Temple of Room '{0}' because it has active or reserved bookings under the current Temple.").format(self.name)
					)
