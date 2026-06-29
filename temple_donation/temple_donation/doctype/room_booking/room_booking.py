import frappe
from frappe.model.document import Document
from frappe import _
from frappe.utils import get_datetime, now_datetime

class RoomBooking(Document):
	def validate(self):
		self.check_availability()
		self.check_overlapping_bookings()

	def on_submit(self):
		# Create donation if necessary
		self.create_donation()

		# Update room status immediately if check-in is now or in the past
		now = now_datetime()
		if get_datetime(self.check_in) <= now:
			self.db_set("status", "Checked In")
			self.update_room_status("Occupied")
		else:
			self.update_room_status("Reserved")

	def on_cancel(self):
		self.update_room_status("Available")

	def check_availability(self):
		# Simple check: if room status is Maintenance or Cleaning, prevent booking? 
		# But we can allow booking for future dates. Just warn.
		pass

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
		if not self.donation and self.total_amount:
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
