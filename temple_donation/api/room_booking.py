import frappe
import csv
import io
from frappe import _
from frappe.utils import now_datetime, get_datetime, flt

def has_active_booking_for_room(room_id, exclude_booking=None):
    """
    Checks if a room has an active (Booked or Checked In) booking in either the
    legacy single room field or the booking_room child table.
    """
    filters_main = {
        "room": room_id,
        "status": ("in", ["Booked", "Checked In"]),
        "docstatus": 1
    }
    if exclude_booking:
        filters_main["name"] = ("!=", exclude_booking)
        
    if frappe.db.exists("Room Booking", filters_main):
        return True
        
    # Check child table mapping
    query = """
        SELECT rb.name 
        FROM `tabRoom Booking` rb
        INNER JOIN `tabbooking_room` br ON br.parent = rb.name
        WHERE br.room_id = %s
          AND rb.status IN ('Booked', 'Checked In')
          AND rb.docstatus = 1
    """
    args = [room_id]
    if exclude_booking:
        query += " AND rb.name != %s"
        args.append(exclude_booking)
        
    res = frappe.db.sql(query, args)
    return len(res) > 0


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
        
        # Get all child rooms
        rooms = frappe.get_all("booking_room", filters={"parent": b.name}, fields=["room_id"])
        assigned_rooms = [r.room_id for r in rooms]
        if b.room and b.room not in assigned_rooms:
            assigned_rooms.append(b.room)
            
        for room_id in assigned_rooms:
            frappe.db.set_value("Room", room_id, "status", "Occupied")

    # 2. Checked In → Checked Out (check-out time has passed)
    checked_in_bookings = frappe.get_all("Room Booking", filters={
        "status": "Checked In",
        "docstatus": 1,
        "check_out": ("<=", now)
    }, fields=["name", "room"])

    for b in checked_in_bookings:
        frappe.db.set_value("Room Booking", b.name, "status", "Checked Out")
        
        # Get all child rooms
        rooms = frappe.get_all("booking_room", filters={"parent": b.name}, fields=["room_id"])
        assigned_rooms = [r.room_id for r in rooms]
        if b.room and b.room not in assigned_rooms:
            assigned_rooms.append(b.room)
            
        for room_id in assigned_rooms:
            has_active = has_active_booking_for_room(room_id, exclude_booking=b.name)
            if not has_active:
                frappe.db.set_value("Room", room_id, "status", "Available")

    if booked_bookings or checked_in_bookings:
        frappe.db.commit()


@frappe.whitelist()
def check_room_availability(room, check_in, check_out, exclude_booking=None):
    """
    Check if a room is available for the given time period.
    Returns {"available": True/False, "conflicting_booking": "RB-xxx" or None}
    """
    # Check legacy main field
    filters = {
        "room": room,
        "status": ("not in", ["Cancelled", "Checked Out"]),
        "check_in": ("<", check_out),
        "check_out": (">", check_in)
    }
    if exclude_booking:
        filters["name"] = ("!=", exclude_booking)
        
    conflicting = frappe.db.get_value("Room Booking", filters, "name")
    if conflicting:
        return {
            "available": False,
            "conflicting_booking": conflicting
        }
        
    # Check child table mapping
    query = """
        SELECT rb.name 
        FROM `tabRoom Booking` rb
        INNER JOIN `tabbooking_room` br ON br.parent = rb.name
        WHERE br.room_id = %s
          AND rb.status NOT IN ('Cancelled', 'Checked Out')
          AND rb.check_in < %s
          AND rb.check_out > %s
    """
    args = [room, check_out, check_in]
    if exclude_booking:
        query += " AND rb.name != %s"
        args.append(exclude_booking)
        
    res = frappe.db.sql(query, args)
    if res:
        return {
            "available": False,
            "conflicting_booking": res[0][0]
        }

    return {
        "available": True,
        "conflicting_booking": None
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

    # Find all rooms that have conflicting bookings (legacy room field)
    booked_rooms = frappe.get_all("Room Booking", filters={
        "status": ("not in", ["Cancelled", "Checked Out"]),
        "check_in": ("<", check_out),
        "check_out": (">", check_in)
    }, fields=["room"], pluck="room")

    # Find all rooms that have conflicting bookings (child table room mapping)
    booked_child = frappe.db.sql("""
        SELECT br.room_id 
        FROM `tabRoom Booking` rb
        INNER JOIN `tabbooking_room` br ON br.parent = rb.name
        WHERE rb.status NOT IN ('Cancelled', 'Checked Out')
          AND rb.check_in < %s
          AND rb.check_out > %s
    """, (check_out, check_in), pluck=True)

    booked_set = set(list(filter(None, booked_rooms)) + list(filter(None, booked_child)))

    for room in rooms:
        room["is_available"] = room["name"] not in booked_set
        # Also mark unavailable if room is in Maintenance or Cleaning
        if room["status"] in ("Maintenance", "Cleaning"):
            room["is_available"] = False

    return rooms


@frappe.whitelist()
def check_in_booking(booking_name):
    """
    Check in guest: sets booking status to Checked In, all assigned rooms to Occupied.
    """
    booking = frappe.get_doc("Room Booking", booking_name)

    if booking.status != "Booked":
        frappe.throw(_("Only Booked rooms can be checked in."))

    frappe.db.set_value("Room Booking", booking_name, "status", "Checked In")
    
    # Get all assigned rooms
    rooms = frappe.get_all("booking_room", filters={"parent": booking_name}, fields=["room_id"])
    assigned_rooms = [r.room_id for r in rooms]
    if booking.room and booking.room not in assigned_rooms:
        assigned_rooms.append(booking.room)
        
    for room_id in assigned_rooms:
        frappe.db.set_value("Room", room_id, "status", "Occupied")
        
    frappe.db.commit()

    return {"success": True}


@frappe.whitelist()
def early_checkout(booking_name):
    """
    Early checkout: sets booking status to Checked Out, releases all assigned rooms.
    """
    booking = frappe.get_doc("Room Booking", booking_name)

    if booking.status not in ("Checked In", "Booked"):
        frappe.throw(_("Only active bookings can be checked out."))

    now = now_datetime()

    frappe.db.set_value("Room Booking", booking_name, {
        "status": "Checked Out",
        "check_out": now
    })

    # Release all assigned rooms
    rooms = frappe.get_all("booking_room", filters={"parent": booking_name}, fields=["room_id"])
    assigned_rooms = [r.room_id for r in rooms]
    if booking.room and booking.room not in assigned_rooms:
        assigned_rooms.append(booking.room)

    for room_id in assigned_rooms:
        has_active = has_active_booking_for_room(room_id, exclude_booking=booking_name)
        if not has_active:
            frappe.db.set_value("Room", room_id, "status", "Available")

    frappe.db.commit()

    return {"success": True, "checkout_time": str(now)}


@frappe.whitelist()
def extend_booking(booking_name, new_check_out):
    """
    Late checkout / extend stay: update check-out time after validating no conflicts for all assigned rooms.
    """
    booking = frappe.get_doc("Room Booking", booking_name)

    if booking.status in ("Checked Out", "Cancelled"):
        frappe.throw(_("Cannot extend a completed or cancelled booking."))

    # Get all assigned rooms
    rooms = frappe.get_all("booking_room", filters={"parent": booking_name}, fields=["room_id"])
    assigned_rooms = [r.room_id for r in rooms]
    if booking.room and booking.room not in assigned_rooms:
        assigned_rooms.append(booking.room)

    for room_id in assigned_rooms:
        availability = check_room_availability(room_id, booking.check_in, new_check_out, exclude_booking=booking_name)
        if not availability["available"]:
            frappe.throw(_("Cannot extend stay. Room {0} has a conflict ({1}).").format(
                room_id, availability["conflicting_booking"]
            ))

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


@frappe.whitelist()
def search_rooms(
    search=None, 
    check_in=None, 
    check_out=None, 
    temple=None, 
    availability=None, 
    floor=None, 
    room_type=None, 
    capacity=None, 
    limit=20, 
    offset=0
):
    """
    Whitelisted API method to search rooms with debounce support, server-side filtering,
    date-range availability, and pagination.
    """
    try:
        limit = int(limit)
    except Exception:
        limit = 20
    try:
        offset = int(offset)
    except Exception:
        offset = 0

    conditions = []
    values = {}

    if temple:
        conditions.append("r.temple = %(temple)s")
        values["temple"] = temple

    if floor and floor != "All":
        floor_val = None
        if isinstance(floor, str):
            floor_lower = floor.lower()
            if "ground" in floor_lower:
                floor_val = 0
            elif "first" in floor_lower:
                floor_val = 1
            elif "second" in floor_lower:
                floor_val = 2
            elif "third" in floor_lower:
                floor_val = 3
            elif "fourth" in floor_lower:
                floor_val = 4
            elif "fifth" in floor_lower:
                floor_val = 5
            elif "sixth" in floor_lower:
                floor_val = 6
            elif "seventh" in floor_lower:
                floor_val = 7
            elif "eighth" in floor_lower:
                floor_val = 8
            elif "ninth" in floor_lower:
                floor_val = 9
            elif "tenth" in floor_lower:
                floor_val = 10
            else:
                digits = "".join(filter(str.isdigit, floor))
                if digits:
                    floor_val = int(digits)
        else:
            try:
                floor_val = int(floor)
            except Exception:
                pass
        
        if floor_val is not None:
            conditions.append("r.floor_number = %(floor_val)s")
            values["floor_val"] = floor_val

    if room_type and room_type != "All":
        conditions.append("rt.room_type_name = %(room_type)s")
        values["room_type"] = room_type

    if capacity and capacity != "All":
        capacity_val = None
        if isinstance(capacity, str):
            digits = "".join(filter(str.isdigit, capacity))
            if digits:
                capacity_val = int(digits)
        else:
            try:
                capacity_val = int(capacity)
            except Exception:
                pass
        
        if capacity_val is not None:
            conditions.append("r.capacity = %(capacity_val)s")
            values["capacity_val"] = capacity_val

    if search:
        search_like = f"%{search}%"
        values["search_like"] = search_like
        search_conditions = [
            "r.room_number LIKE %(search_like)s",
            "r.name LIKE %(search_like)s",
            "r.description LIKE %(search_like)s",
            "rt.room_type_name LIKE %(search_like)s",
            "b.building_name LIKE %(search_like)s"
        ]
        
        # Floor search matching
        search_floor_val = None
        search_lower = search.lower()
        floor_map = {
            "ground": 0, "first": 1, "second": 2, "third": 3, "fourth": 4, 
            "fifth": 5, "sixth": 6, "seventh": 7, "eighth": 8, "ninth": 9, "tenth": 10
        }
        for k, v in floor_map.items():
            if k in search_lower:
                search_floor_val = v
                break
        
        if not search_floor_val and search.isdigit():
            search_floor_val = int(search)
            
        if search_floor_val is not None:
            search_conditions.append("r.floor_number = %(search_floor_val)s")
            values["search_floor_val"] = search_floor_val
            
        conditions.append(f"({' OR '.join(search_conditions)})")

    where_clause = ""
    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)

    sql_query = f"""
        SELECT 
            r.name, 
            r.room_number, 
            r.temple, 
            r.building, 
            r.floor_number, 
            r.room_type, 
            r.capacity, 
            r.price_per_day, 
            r.status, 
            r.description, 
            rt.room_type_name,
            b.building_name
        FROM 
            `tabRoom` r
        LEFT JOIN 
            `tabRoom Type` rt ON r.room_type = rt.name
        LEFT JOIN 
            `tabBuilding` b ON r.building = b.name
        {where_clause}
        ORDER BY r.room_number ASC
    """

    rooms = frappe.db.sql(sql_query, values, as_dict=True)

    booked_set = set()
    if check_in and check_out:
        try:
            check_in_str = str(check_in).replace("T", " ")
            check_out_str = str(check_out).replace("T", " ")
            
            # 1. Main room bookings
            booked_rooms = frappe.get_all("Room Booking", filters={
                "status": ("not in", ["Cancelled", "Checked Out"]),
                "check_in": ("<", check_out_str),
                "check_out": (">", check_in_str)
            }, fields=["room"], pluck="room")
            
            # 2. Child table bookings
            booked_child = frappe.db.sql("""
                SELECT br.room_id 
                FROM `tabRoom Booking` rb
                INNER JOIN `tabbooking_room` br ON br.parent = rb.name
                WHERE rb.status NOT IN ('Cancelled', 'Checked Out')
                  AND rb.check_in < %s
                  AND rb.check_out > %s
            """, (check_out_str, check_in_str), pluck=True)
            
            booked_set = set(list(filter(None, booked_rooms)) + list(filter(None, booked_child)))
        except Exception as e:
            frappe.log_error(f"Error checking available rooms: {str(e)}")
    else:
        for room in rooms:
            if room["status"] == "Occupied":
                booked_set.add(room["name"])

    filtered_rooms = []
    for room in rooms:
        room["is_available"] = room["name"] not in booked_set
        if room["status"] in ("Cleaning", "Maintenance"):
            room["is_available"] = False
        
        # Apply availability filter
        if availability and availability != "All":
            avail_lower = availability.lower()
            if avail_lower == "available" and not room["is_available"]:
                continue
            elif avail_lower == "occupied" and (room["is_available"] or room["status"] in ("Cleaning", "Maintenance")):
                continue
            elif avail_lower == "cleaning" and room["status"] != "Cleaning":
                continue
            elif avail_lower == "maintenance" and room["status"] != "Maintenance":
                continue
        
        filtered_rooms.append(room)

    total_count = len(filtered_rooms)
    paginated_rooms = filtered_rooms[offset : offset + limit]

    return {
        "rooms": paginated_rooms,
        "total": total_count
    }

