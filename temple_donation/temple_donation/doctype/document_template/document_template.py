# Copyright (c) 2026, sk and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class DocumentTemplate(Document):
	def before_save(self):
		if self.default_template:
			# Set other templates of the same type for this temple to non-default
			frappe.db.sql(
				"""
				update `tabDocument Template`
				set default_template = 0
				where temple = %s and template_type = %s and name != %s
				""",
				(self.temple, self.template_type, self.name or "")
			)
