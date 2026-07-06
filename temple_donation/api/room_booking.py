import frappe
import csv
import io
from frappe import _
from frappe.utils import now_datetime, get_datetime, flt

@frappe.whitelist()
def update_room_statuses():
    """
    Cron job: Runs every minute to auto-update Room and Room Booking statuses.
    - Booked bookings past check-in time → Checked In, Room → Occupied
    - Checked In bookings past check-out time → Checked Out, Room → Available
    """
    now = now_datetime()

    # 1. Booked → Checked In (check-in time has passed)
    booked_bookings = frappe.get_all("Room Booking", filters={
        "status": "Booked",
        "docstatus": 1,
        "check_in": ("<=", now)
    }, fields=["name", "room"])

    for b in booked_bookings:
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
            "status": ("in", ["Booked", "Checked In"]),
            "docstatus": 1,
            "name": ("!=", b.name)
        })
        if not has_active:
            frappe.db.set_value("Room", b.room, "status", "Available")

    if booked_bookings or checked_in_bookings:
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
        "name", "room_number", "temple", "building", "floor_number", "room_type", "capacity", "price_per_day", "status"
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

    if booking.status not in ("Checked In", "Booked"):
        frappe.throw(_("Only active bookings can be checked out."))

    now = now_datetime()

    frappe.db.set_value("Room Booking", booking_name, {
        "status": "Checked Out",
        "check_out": now
    })

    # Check if another active booking exists
    has_active = frappe.db.exists("Room Booking", {
        "room": booking.room,
        "status": ("in", ["Booked", "Checked In"]),
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
    Returns room statistics for the dashboard (compatibility wrapper).
    """
    return get_room_dashboard_data(temple)


@frappe.whitelist()
def get_room_dashboard_data(temple=None, from_date=None, to_date=None):
    """
    Provides comprehensive room management dashboard APIs with date-range filters.
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

    # Date range for selected period
    if from_date and to_date:
        period_start = get_datetime(from_date + " 00:00:00")
        period_end = get_datetime(to_date + " 23:59:59")
    else:
        # Default to today
        period_start = now_datetime().replace(hour=0, minute=0, second=0, microsecond=0)
        period_end = now_datetime().replace(hour=23, minute=59, second=59, microsecond=999999)

    booking_filters = {}
    if temple:
        booking_filters["temple"] = temple

    # Check Ins in selected period
    check_in_filters = booking_filters.copy()
    check_in_filters.update({
        "check_in": ["between", [period_start, period_end]],
        "status": "Booked"
    })
    todays_check_ins = frappe.get_all("Room Booking", filters=check_in_filters, fields=["*"])

    # Check Outs in selected period
    check_out_filters = booking_filters.copy()
    check_out_filters.update({
        "check_out": ["between", [period_start, period_end]],
        "status": "Checked In"
    })
    todays_check_outs = frappe.get_all("Room Booking", filters=check_out_filters, fields=["*"])

    # Upcoming Bookings (after period_end)
    import datetime as dt
    seven_days_later = period_end + dt.timedelta(days=7)

    upcoming_filters = booking_filters.copy()
    upcoming_filters.update({
        "check_in": [">", period_end],
        "check_in": ["<=", seven_days_later],
        "status": "Booked"
    })
    upcoming_bookings = frappe.get_all("Room Booking", filters=upcoming_filters, fields=["*"], order_by="check_in asc")

    # Extra Period Metrics for live site dashboard:
    # 1. Total bookings created or active in the period
    period_booking_filters = booking_filters.copy()
    period_booking_filters.update({
        "creation": ["between", [period_start, period_end]]
    })
    total_period_bookings = frappe.db.count("Room Booking", period_booking_filters)

    # 2. Total revenue (sum of total_amount from room bookings created in the period)
    period_revenue = frappe.db.get_value("Room Booking", {
        **booking_filters,
        "creation": ["between", [period_start, period_end]],
        "status": ["not in", ["Cancelled"]]
    }, "sum(total_amount)") or 0.0

    # Map room ID/name to human-readable room number
    rooms = frappe.get_all("Room", fields=["name", "room_number"])
    room_map = {r.name: r.room_number for r in rooms}

    for b in todays_check_ins:
        b["room"] = room_map.get(b.room) or b.room

    for b in todays_check_outs:
        b["room"] = room_map.get(b.room) or b.room

    for b in upcoming_bookings:
        b["room"] = room_map.get(b.room) or b.room

    return {
        "stats": stats,
        "todays_check_ins": todays_check_ins,
        "todays_check_outs": todays_check_outs,
        "upcoming_bookings": upcoming_bookings,
        "period_metrics": {
            "total_bookings": total_period_bookings,
            "total_revenue": float(period_revenue)
        }
    }


@frappe.whitelist()
def bulk_generate_rooms(temple, building, floor, room_prefix, starting_number, ending_number, room_type, capacity, price_per_day):
    """
    Automated generation of rooms sequentially, avoiding duplicates.
    """
    try:
        start_num = int(starting_number)
        end_num = int(ending_number)
    except ValueError:
        frappe.throw(_("Starting and ending room numbers must be integers."))

    if start_num > end_num:
        frappe.throw(_("Starting number cannot be greater than ending number."))

    created_count = 0
    already_exist_count = 0

    for room_num in range(start_num, end_num + 1):
        room_code = f"{room_prefix}{room_num}"
        
        # Check if room already exists
        if frappe.db.exists("Room", {"room_number": room_code}):
            already_exist_count += 1
            continue

        try:
            doc = frappe.get_doc({
                "doctype": "Room",
                "room_number": room_code,
                "temple": temple,
                "building": building,
                "floor_number": int(floor or 0),
                "room_type": room_type,
                "capacity": int(capacity or 2),
                "price_per_day": flt(price_per_day or 0),
                "status": "Available"
            })
            doc.insert(ignore_permissions=True)
            created_count += 1
        except Exception as e:
            frappe.log_error(f"Error bulk generating room {room_code}: {str(e)}")
            raise e

    frappe.db.commit()

    return {
        "created": created_count,
        "exists": already_exist_count,
        "message": f"Successfully created {created_count} rooms. {already_exist_count} already existed."
    }


@frappe.whitelist()
def download_room_import_template():
    """
    Returns a sample CSV format for importing rooms.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Room Number", "Building Code", "Floor Number", "Room Type Name", "Capacity", "Price Per Day", "Status", "Description", "Notes"])
    writer.writerow(["A-101", "BLD001", "1", "AC", "2", "1500", "Available", "Main Building AC Room", "Near elevator"])
    writer.writerow(["A-102", "BLD001", "1", "Non AC", "4", "800", "Available", "Main Building Quad Room", "Family sized"])
    
    frappe.local.response.filename = "room_import_template.csv"
    frappe.local.response.filecontent = output.getvalue()
    frappe.local.response.type = "download"


@frappe.whitelist()
def import_rooms_from_csv(csv_content, temple):
    """
    Import rooms from uploaded CSV content.
    """
    if not csv_content:
        frappe.throw(_("CSV content is empty or missing."))

    if isinstance(csv_content, bytes):
        csv_content = csv_content.decode("utf-8")

    f = io.StringIO(csv_content.strip())
    reader = csv.reader(f)

    # Read header
    headers = next(reader, None)
    if not headers:
        frappe.throw(_("CSV file is empty."))

    required_headers = ["Room Number", "Building Code", "Floor Number", "Room Type Name"]
    for req in required_headers:
        if req not in headers:
            frappe.throw(_("CSV missing required column: {0}").format(req))

    # Maps for header indices
    h_idx = {h: i for i, h in enumerate(headers)}

    success_count = 0
    failure_count = 0
    logs = []

    for row_idx, row in enumerate(reader, start=2):
        if not row or not any(row):
            continue

        try:
            room_number = row[h_idx["Room Number"]].strip()
            building_code = row[h_idx["Building Code"]].strip()
            floor_number = int(row[h_idx["Floor Number"]].strip() or 0)
            room_type_name = row[h_idx["Room Type Name"]].strip()
            
            capacity = int(row[h_idx.get("Capacity", -1)].strip() or 2) if "Capacity" in h_idx else 2
            price_per_day = flt(row[h_idx.get("Price Per Day", -1)].strip() or 0) if "Price Per Day" in h_idx else 0.0
            status = row[h_idx.get("Status", -1)].strip() or "Available" if "Status" in h_idx else "Available"
            description = row[h_idx.get("Description", -1)].strip() if "Description" in h_idx else ""
            notes = row[h_idx.get("Notes", -1)].strip() if "Notes" in h_idx else ""

            if not room_number:
                raise ValueError("Room Number cannot be empty")

            # Resolve building
            building = frappe.db.get_value("Building", {"building_code": building_code}, "name")
            if not building:
                # Auto-create Building
                b_doc = frappe.get_doc({
                    "doctype": "Building",
                    "building_code": building_code,
                    "building_name": f"Building {building_code}",
                    "temple": temple,
                    "status": "Active"
                })
                b_doc.insert(ignore_permissions=True)
                building = b_doc.name
                logs.append(f"Row {row_idx}: Info - Auto-created Building '{building_code}' under this Temple.")

            # Resolve Room Type
            room_type = frappe.db.get_value("Room Type", {"room_type_name": room_type_name}, "name")
            if not room_type:
                # Auto-create Room Type
                rt_doc = frappe.get_doc({
                    "doctype": "Room Type",
                    "room_type_name": room_type_name,
                    "default_capacity": capacity or 2,
                    "default_price_per_day": price_per_day or 0.0,
                    "active": 1
                })
                rt_doc.insert(ignore_permissions=True)
                room_type = rt_doc.name
                logs.append(f"Row {row_idx}: Info - Auto-created Room Type '{room_type_name}'.")

            if frappe.db.exists("Room", {"room_number": room_number}):
                raise ValueError(f"Room Number '{room_number}' already exists")

            doc = frappe.get_doc({
                "doctype": "Room",
                "room_number": room_number,
                "temple": temple,
                "building": building,
                "floor_number": floor_number,
                "room_type": room_type,
                "capacity": capacity,
                "price_per_day": price_per_day,
                "status": status,
                "description": description,
                "notes": notes
            })
            doc.insert(ignore_permissions=True)
            success_count += 1
            logs.append(f"Row {row_idx}: Success - Room {room_number} created.")

        except Exception as e:
            failure_count += 1
            logs.append(f"Row {row_idx}: Error - {str(e)}")

    frappe.db.commit()

    return {
        "success": success_count,
        "failed": failure_count,
        "logs": logs,
        "message": f"Import completed. Succeeded: {success_count}, Failed: {failure_count}."
    }
