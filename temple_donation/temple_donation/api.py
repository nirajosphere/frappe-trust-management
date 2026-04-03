import os
import frappe

@frappe.whitelist()
def get_latest_bundle():
    """Returns the URL of the latest temple_donation JS bundle from public/dist."""
    path = frappe.get_app_path("temple_donation", "public", "dist")

    if not os.path.exists(path):
        return None

    files = os.listdir(path)
    bundles = []

    for f in files:
        if f.startswith("temple_donation.bundle") and f.endswith(".js") and not f.endswith(".map"):
            full_path = os.path.join(path, f)
            bundles.append((f, os.path.getmtime(full_path)))

    if bundles:
        bundles.sort(key=lambda x: x[1], reverse=True)
        return f"/assets/temple_donation/dist/{bundles[0][0]}"

    return None
