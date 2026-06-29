// Copyright (c) 2026, sk and contributors
// For license information, please see license.txt

frappe.ui.form.on("Room Booking", {
	setup(frm) {
		frm.set_query("room", function() {
			return {
				filters: {
					temple: frm.doc.temple || ""
				}
			};
		});
	},
	temple(frm) {
		// Clear room selection if temple is changed to prevent mismatched saves
		frm.set_value("room", "");
	}
});
