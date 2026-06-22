import frappe

def check_meta():
    meta = frappe.get_meta('Donation Type')
    print("Fields in Donation Type:")
    for f in meta.fields:
        print(f"- {f.fieldname} ({f.label})")

if __name__ == "__main__":
    frappe.init(site="temple.donation:8001")
    frappe.connect()
    check_meta()
