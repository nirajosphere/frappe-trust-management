import frappe

def create_doctype():
    if not frappe.db.exists("DocType", "Room Booking"):
        doc = frappe.get_doc({
            "doctype": "DocType",
            "name": "Room Booking",
            "module": "Temple Donation",
            "custom": 0,
            "naming_rule": "Expression",
            "autoname": "format:RB-{YYYY}-{MM}-{#####}",
            "fields": [
                {"fieldname": "room", "label": "Room", "fieldtype": "Link", "options": "Room", "reqd": 1, "in_list_view": 1},
                {"fieldname": "guest_name", "label": "Guest Name", "fieldtype": "Data", "reqd": 1, "in_list_view": 1},
                {"fieldname": "guest_id", "label": "Guest ID", "fieldtype": "Data"},
                {"fieldname": "check_in", "label": "Check-in Date & Time", "fieldtype": "Datetime", "reqd": 1, "in_list_view": 1},
                {"fieldname": "check_out", "label": "Check-out Date & Time", "fieldtype": "Datetime", "reqd": 1, "in_list_view": 1},
                {"fieldname": "status", "label": "Status", "fieldtype": "Select", "options": "Reserved\nChecked In\nChecked Out\nCancelled", "default": "Reserved", "reqd": 1, "in_list_view": 1},
                {"fieldname": "number_of_guests", "label": "Number of Guests", "fieldtype": "Int", "default": 1},
                {"fieldname": "remarks", "label": "Remarks", "fieldtype": "Small Text"}
            ],
            "permissions": [
                {"role": "System Manager", "read": 1, "write": 1, "create": 1, "delete": 1}
            ]
        })
        doc.insert(ignore_permissions=True)
        print("Room Booking DocType created successfully")
    else:
        print("Room Booking DocType already exists")

create_doctype()
