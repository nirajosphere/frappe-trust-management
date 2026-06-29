import frappe
from frappe import _
from frappe.utils import now_datetime, get_datetime


@frappe.whitelist()
def update_room_statuses():
    """
    Cron job: Runs every minute to auto-update Room and Room Booking statuses.
    - Reserved bookings past check-in time → Checked In, Room → Occupied
    - Checked In bookings past check-out time → Checked Out, Room → Available
    """
    now = now_datetime()

    # 1. Reserved → Checked In (check-in time has passed)
    reserved_bookings = frappe.get_all("Room Booking", filters={
        "status": "Reserved",
        "docstatus": 1,
        "check_in": ("<=", now)
    }, fields=["name", "room"])

    for b in reserved_bookings:
        frappe.db.set_value("Room Booking", b.name, "status", "Checked In")
        frappe.db.set_value("Room", b.room, "status", "Occupied")

    # 2. Checked In → Checked Out (check-out time has passed)
    checked_in_bookings = frappe.get_all("Room Booking", filters={
        "status": "Checked In",
        "docstatus": 1,
        "check_out": ("<=", now)
    }, fields=["name", "room"])

    for b in checked_in_bookings:
        frappe.db.set_value("Room Booking", b.name, "status", "Checked Out")
        # Check if another active booking exists for this room
        has_active = frappe.db.exists("Room Booking", {
            "room": b.room,
            "status": ("in", ["Reserved", "Checked In"]),
            "docstatus": 1,
            "name": ("!=", b.name)
        })
        if not has_active:
            frappe.db.set_value("Room", b.room, "status", "Available")

    if reserved_bookings or checked_in_bookings:
        frappe.db.commit()


@frappe.whitelist()
def check_room_availability(room, check_in, check_out, exclude_booking=None):
    """
    Check if a room is available for the given time period.
    Returns {"available": True/False, "conflicting_booking": "RB-xxx" or None}
    """
    filters = {
        "room": room,
        "status": ("not in", ["Cancelled", "Checked Out"]),
        "check_in": ("<", check_out),
        "check_out": (">", check_in)
    }

    if exclude_booking:
        filters["name"] = ("!=", exclude_booking)

    conflicting = frappe.db.get_value("Room Booking", filters, "name")

    return {
        "available": not conflicting,
        "conflicting_booking": conflicting
    }


@frappe.whitelist()
def get_available_rooms(check_in, check_out, temple=None):
    """
    Returns list of rooms with their availability status for the given time range.
    Each room will have an `is_available` flag.
    """
    room_filters = {}
    if temple:
        room_filters["temple"] = temple

    rooms = frappe.get_all("Room", filters=room_filters, fields=[
        "name", "room_number", "temple", "room_type", "capacity", "price_per_day", "status"
    ], order_by="room_number asc")

    # Find all rooms that have conflicting bookings
    booked_rooms = frappe.get_all("Room Booking", filters={
        "status": ("not in", ["Cancelled", "Checked Out"]),
        "check_in": ("<", check_out),
        "check_out": (">", check_in)
    }, fields=["room"], pluck="room")

    booked_set = set(booked_rooms)

    for room in rooms:
        room["is_available"] = room["name"] not in booked_set
        # Also mark unavailable if room is in Maintenance or Cleaning
        if room["status"] in ("Maintenance", "Cleaning"):
            room["is_available"] = False

    return rooms


@frappe.whitelist()
def early_checkout(booking_name):
    """
    Early checkout: sets booking status to Checked Out, room to Available.
    Stores actual checkout timestamp.
    """
    booking = frappe.get_doc("Room Booking", booking_name)

    if booking.status not in ("Checked In", "Reserved"):
        frappe.throw(_("Only active bookings can be checked out."))

    now = now_datetime()

    frappe.db.set_value("Room Booking", booking_name, {
        "status": "Checked Out",
        "check_out": now
    })

    # Check if another active booking exists
    has_active = frappe.db.exists("Room Booking", {
        "room": booking.room,
        "status": ("in", ["Reserved", "Checked In"]),
        "docstatus": 1,
        "name": ("!=", booking_name)
    })
    if not has_active:
        frappe.db.set_value("Room", booking.room, "status", "Available")

    frappe.db.commit()

    return {"success": True, "checkout_time": str(now)}


@frappe.whitelist()
def extend_booking(booking_name, new_check_out):
    """
    Late checkout / extend stay: update check-out time after validating no conflicts.
    """
    booking = frappe.get_doc("Room Booking", booking_name)

    if booking.status in ("Checked Out", "Cancelled"):
        frappe.throw(_("Cannot extend a completed or cancelled booking."))

    # Check for conflicts with the new checkout time
    conflicting = frappe.db.get_value("Room Booking", {
        "room": booking.room,
        "name": ("!=", booking_name),
        "status": ("not in", ["Cancelled", "Checked Out"]),
        "check_in": ("<", new_check_out),
        "check_out": (">", booking.check_in)
    }, "name")

    if conflicting:
        frappe.throw(_("Cannot extend stay. Room has another booking ({0}) that conflicts.").format(conflicting))

    frappe.db.set_value("Room Booking", booking_name, "check_out", new_check_out)
    frappe.db.commit()

    return {"success": True, "new_check_out": new_check_out}


@frappe.whitelist()
def get_room_stats(temple=None):
    """
    Returns room statistics for the dashboard.
    """
    filters = {}
    if temple:
        filters["temple"] = temple

    rooms = frappe.get_all("Room", filters=filters, fields=["status"])

    stats = {
        "total": len(rooms),
        "available": 0,
        "reserved": 0,
        "occupied": 0,
        "cleaning": 0,
        "maintenance": 0
    }

    for r in rooms:
        status = (r.get("status") or "Available").lower()
        if status in stats:
            stats[status] += 1

    return stats
