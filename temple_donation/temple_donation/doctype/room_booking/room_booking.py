import frappe
from frappe.model.document import Document
from frappe import _
from frappe.utils import get_datetime, now_datetime

class RoomBooking(Document):
	def validate(self):
		self.check_availability()
		self.check_overlapping_bookings()
		self.validate_room_temple_match()

	def validate_room_temple_match(self):
		if self.room and self.temple:
			room_temple = frappe.db.get_value("Room", self.room, "temple")
			if room_temple != self.temple:
				frappe.throw(_("Selected Room '{0}' does not belong to the selected Temple ({1}). It belongs to '{2}'.").format(self.room, self.temple, room_temple))

	def on_submit(self):
		# Create donation if already Paid on submission
		self.create_donation()
		self.sync_room_status()

	def on_update(self):
		# Create donation if paid on update/save (allows post-submission payment status updates)
		self.create_donation()
		self.sync_room_status()

	def on_cancel(self):
		self.db_set("status", "Cancelled")
		self.sync_room_status()

	def check_availability(self):
		# Prevent booking if room is in Maintenance or Cleaning status
		room_status = frappe.db.get_value("Room", self.room, "status")
		if room_status in ("Maintenance", "Cleaning"):
			frappe.throw(_("Room {0} is currently in {1} status and cannot be booked.").format(self.room, room_status))

	def check_overlapping_bookings(self):
		if not self.check_in or not self.check_out:
			frappe.throw(_("Check-in and Check-out times are required."))
			
		if get_datetime(self.check_in) >= get_datetime(self.check_out):
			frappe.throw(_("Check-out time must be after Check-in time."))

		filters = {
			"room": self.room,
			"name": ("!=", self.name),
			"status": ("not in", ["Cancelled", "Checked Out"]),
			"check_in": ("<", self.check_out),
			"check_out": (">", self.check_in)
		}
		
		overlapping_booking = frappe.db.get_value("Room Booking", filters, "name")
		
		if overlapping_booking:
			frappe.throw(_("Room {0} is already booked for the selected time. (Booking: {1})").format(self.room, overlapping_booking))

	def create_donation(self):
		if self.payment_status == "Paid" and not self.donation and self.total_amount:
			donation = frappe.get_doc({
				"doctype": "Donation",
				"donor": self.donor,
				"temple": self.temple,
				"total_amount": self.total_amount,
				"notes": f"Room Booking Payment for {self.room}",
				"payment_mode": "Cash"
			})
			donation.insert(ignore_permissions=True)
			donation.submit()
			self.donation = donation.name
			self.db_set("donation", donation.name)

	def sync_room_status(self):
		"""
		Syncs the Room status based on the booking's current status:
		- Booked -> Reserved
		- Checked In -> Occupied
		- Checked Out -> Available
		- Cancelled -> Available
		"""
		if not self.room:
			return

		target_status = "Available"
		if self.status == "Booked":
			target_status = "Reserved"
		elif self.status == "Checked In":
			target_status = "Occupied"
		elif self.status in ("Checked Out", "Cancelled"):
			target_status = "Available"

		# If setting to Available, check if another active/overlapping booking is currently occupied/reserved
		if target_status == "Available":
			has_active = frappe.db.exists("Room Booking", {
				"room": self.room,
				"status": ("in", ["Booked", "Checked In"]),
				"docstatus": 1,
				"name": ("!=", self.name)
			})
			if has_active:
				# Keep status as Reserved/Occupied based on the other booking
				other_status = frappe.db.get_value("Room Booking", {
					"room": self.room,
					"status": ("in", ["Booked", "Checked In"]),
					"docstatus": 1,
					"name": ("!=", self.name)
				}, "status")
				target_status = "Occupied" if other_status == "Checked In" else "Reserved"

		frappe.db.set_value("Room", self.room, "status", target_status)
		frappe.db.commit()
