# Copyright (c) 2026, sk and contributors
# For license information, please see license.txt

import frappe
from frappe import _
import json

def generate_qr_code(data):
	try:
		import qrcode
		import io
		import base64
		qr = qrcode.QRCode(version=1, box_size=10, border=4)
		qr.add_data(data)
		qr.make(fit=True)
		img = qr.make_image(fill_color="black", back_color="white")
		buffered = io.BytesIO()
		img.save(buffered, format="PNG")
		img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
		return f"data:image/png;base64,{img_str}"
	except Exception:
		# Fallback to public QR code API
		import urllib.parse
		safe_data = urllib.parse.quote(data)
		return f"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={safe_data}"

def get_base64_image(image_url):
	if not image_url:
		return ""
	if image_url.startswith("data:"):
		return image_url
	try:
		import os
		import base64
		import mimetypes
		if image_url.startswith("/files/") or image_url.startswith("files/"):
			filename = image_url.lstrip("/")
			file_path = frappe.get_site_path("public", filename)
			if os.path.exists(file_path):
				with open(file_path, "rb") as f:
					data = f.read()
				encoded = base64.b64encode(data).decode("utf-8")
				mime_type, _ = mimetypes.guess_type(file_path)
				if not mime_type:
					mime_type = "image/png"
				return f"data:{mime_type};base64,{encoded}"
	except Exception as e:
		frappe.log_error(f"Error encoding image to base64: {str(e)}", "Document Receipt Image Base64")
	return image_url

def get_variables_context(doc):
	# Base Document variables
	context = {
		"receipt_number": doc.name,
		"receipt_date": frappe.utils.format_date(doc.get("posting_date") or doc.get("creation")),
		"created_by": doc.owner,
		"amount": doc.get("total_amount") or doc.get("amount") or 0.0,
		"payment_mode": doc.get("payment_mode") or "N/A",
		"cashier": doc.get("cashier") or doc.owner or "System",
		"notes": doc.get("notes") or doc.get("remarks") or ""
	}

	# Fetch Temple info
	temple_name = doc.get("temple")
	if temple_name:
		temple_doc = frappe.get_doc("Temple", temple_name)
		context.update({
			"temple_name": temple_doc.temple_name,
			"trust_name": temple_doc.get("trust_name") or temple_doc.temple_name,
			"address": temple_doc.get("address") or "",
			"city": temple_doc.get("city") or "",
			"state": temple_doc.get("state") or "",
			"country": temple_doc.get("country") or "",
			"phone": temple_doc.get("phone") or "",
			"email": temple_doc.get("email") or "",
			"website": temple_doc.get("website") or ""
		})

	# Donation Specific
	if doc.doctype == "Donation":
		context.update({
			"donor_name": doc.get("donor_name") or "Anonymous",
			"mobile": doc.get("mobile_number") or "",
			"donation_type": ", ".join([d.donation_type for d in doc.get("donation_items")]) if doc.get("donation_items") else "General",
			"amount": doc.total_amount,
			"payment_mode": doc.payment_mode,
			"notes": doc.notes or ""
		})
	
	# Room Specific
	elif doc.doctype == "Room Booking":
		room_doc = frappe.get_doc("Room", doc.room) if doc.get("room") else None
		context.update({
			"guest_name": doc.guest_name,
			"room_number": room_doc.room_number if room_doc else doc.room,
			"room_type": room_doc.room_type if room_doc else "",
			"building": room_doc.building if room_doc else "",
			"check_in": frappe.utils.format_datetime(doc.check_in),
			"check_out": frappe.utils.format_datetime(doc.check_out),
			"days": (frappe.utils.get_datetime(doc.check_out) - frappe.utils.get_datetime(doc.check_in)).days or 1,
			"amount": doc.total_amount
		})

	# Inventory Specific
	elif doc.doctype == "Inventory Entry":
		first_item = doc.items[0] if doc.get("items") else None
		context.update({
			"entry_number": doc.name,
			"entry_type": doc.entry_type,
			"item_name": first_item.item if first_item else "",
			"quantity": first_item.qty if first_item else 0,
			"unit": first_item.unit if first_item else "",
			"rate": first_item.rate if first_item else 0,
			"total": sum([i.total_amount or (i.qty * i.rate) for i in doc.get("items")]) if doc.get("items") else 0,
			"reference": doc.reference_name or ""
		})

	return context

@frappe.whitelist()
def get_rendered_receipt(doc_name, doctype, template_name=None):
	# 1. Fetch the doc
	doc = frappe.get_doc(doctype, doc_name)
	
	# 2. Get temple
	temple = doc.get("temple")
	
	# 3. Find template
	template_doc = None
	if template_name:
		template_doc = frappe.get_doc("Document Template", template_name)
	else:
		# Get default from settings or default template
		settings = frappe.get_all("Receipt Settings", filters={"temple": temple}, fields=["*"])
		if settings:
			settings_doc = frappe.get_doc("Receipt Settings", settings[0].name)
			mapping = {
				"Donation": "default_donation_template",
				"Room Booking": "default_room_template",
				"Inventory Entry": "default_inventory_template"
			}
			field = mapping.get(doctype)
			if field and settings_doc.get(field):
				try:
					template_doc = frappe.get_doc("Document Template", settings_doc.get(field))
				except frappe.DoesNotExistError:
					pass
		
		if not template_doc:
			mapping_type = {
				"Donation": "Donation Receipt",
				"Room Booking": "Room Receipt",
				"Inventory Entry": "Inventory Receipt"
			}
			temp_type = mapping_type.get(doctype, "Custom")
			templates = frappe.get_all("Document Template", filters={"temple": temple, "template_type": temp_type, "default_template": 1}, fields=["*"])
			if templates:
				template_doc = frappe.get_doc("Document Template", templates[0].name)
			else:
				templates = frappe.get_all("Document Template", filters={"temple": temple, "template_type": temp_type, "status": "Active"}, fields=["*"])
				if templates:
					template_doc = frappe.get_doc("Document Template", templates[0].name)

	# 4. Fallback default template if none is configured
	if not template_doc:
		template_doc = frappe._dict({
			"template_name": "Fallback Template",
			"paper_size": "A4",
			"print_orientation": "Portrait",
			"font_family": "Inter",
			"margins": "20px",
			"primary_color": "#18181b",
			"secondary_color": "#71717a",
			"header_html": "<h2>{{temple_name}}</h2><p>{{address}}, {{city}}</p><hr>",
			"body_html": "<h3>Receipt #{{receipt_number}}</h3><p>Date: {{receipt_date}}</p><p>Amount: {{amount}}</p><p>Cashier: {{cashier}}</p>",
			"footer_html": "<hr><p>Thank you for your visit!</p>"
		})

	# 5. Build context
	context = get_variables_context(doc)
	
	# Add raw objects to context for advanced custom rendering
	context["doc"] = doc
	if temple:
		try:
			context["temple_doc"] = frappe.get_doc("Temple", temple)
		except Exception:
			pass
	
	# Pass colors to context so they can be rendered inside template fields via Jinja
	context["primary_color"] = template_doc.get("primary_color") or "#18181b"
	context["secondary_color"] = template_doc.get("secondary_color") or "#71717a"

	# Handle trust logo image tag in context
	logo_url = template_doc.get("logo")
	logo_base64 = ""
	if logo_url:
		logo_base64 = get_base64_image(logo_url)
		if not logo_base64.startswith("data:") and not logo_base64.startswith("http"):
			logo_base64 = frappe.utils.get_url(logo_base64)
		context["logo"] = logo_base64
		context["logo_tag"] = f'<img src="{logo_base64}" style="max-height: 70px; max-width: 120px; display: block; object-fit: contain;" />'
	else:
		context["logo"] = ""
		context["logo_tag"] = ""
	
	# Check if QR code is enabled
	enable_qr = True
	settings = frappe.get_all("Receipt Settings", filters={"temple": temple}, fields=["enable_qr_code"])
	if settings and not settings[0].enable_qr_code:
		enable_qr = False
		
	if enable_qr:
		host = frappe.utils.get_url()
		verify_url = f"{host}/api/method/temple_donation.api.document_receipt.verify_receipt?receipt_id={doc.name}&doctype={doc.doctype}"
		qr_code_src = generate_qr_code(verify_url)
		context["qr_code"] = f'<img src="{qr_code_src}" style="width: 120px; height: 120px; display: block; margin: 10px auto;" />'
	else:
		context["qr_code"] = ""

	# Define default layouts in case the template does not have them set or they are saved as null
	header_html = template_doc.header_html
	if not header_html or not header_html.strip():
		header_html = """
<div style="text-align: center; padding-bottom: 10px;">
    {% if logo_tag %}
    {{logo_tag}}
    {% endif %}
    <h1 style="margin: 0; font-size: 24px; color: {{primary_color}};">{{temple_name}}</h1>
    <p style="margin: 4px 0 0 0; font-size: 14px; color: {{secondary_color}};">{{address}}, {{city}}, {{state}}</p>
    <p style="margin: 2px 0 0 0; font-size: 12px; color: {{secondary_color}};">Phone: {{phone}} | Email: {{email}}</p>
</div>
"""

	footer_html = template_doc.footer_html
	if not footer_html or not footer_html.strip():
		footer_html = """
<div style="text-align: center; font-size: 11px; color: {{secondary_color}}; padding-top: 5px;">
    <p style="margin: 0;">Thank you for your generous contribution. May the divine blessings be with you always.</p>
</div>
"""

	# Render Jinja
	rendered_header = frappe.render_template(header_html, context)
	rendered_body = frappe.render_template(template_doc.body_html or "", context)
	rendered_footer = frappe.render_template(footer_html, context)

	styles = f"""
	<style>
		@import url('https://fonts.googleapis.com/css2?family={template_doc.font_family}:wght@300;400;600;700&display=swap');
		body {{
			font-family: '{template_doc.font_family}', sans-serif;
			margin: 0;
			padding: {template_doc.margins or '15px'};
			color: #1f2937;
			background-color: #ffffff;
			box-sizing: border-box;
		}}
		.receipt-container {{
			width: 100%;
			max-width: 800px;
			margin: 0 auto;
			position: relative;
		}}
		.receipt-header {{
			margin-bottom: 20px;
			border-bottom: 2px solid {template_doc.primary_color};
			padding-bottom: 10px;
		}}
		.receipt-body {{
			margin-bottom: 20px;
			min-height: 200px;
		}}
		.receipt-footer {{
			margin-top: 20px;
			border-top: 1px solid #e5e7eb;
			padding-top: 10px;
			font-size: 12px;
			color: {template_doc.secondary_color};
			text-align: center;
		}}
		.primary-text {{ color: {template_doc.primary_color}; }}
		.secondary-text {{ color: {template_doc.secondary_color}; }}
		table {{
			width: 100%;
			border-collapse: collapse;
			margin-top: 15px;
		}}
		th {{
			background-color: {template_doc.primary_color};
			color: #ffffff;
			text-align: left;
			padding: 8px;
			font-size: 14px;
		}}
		td {{
			padding: 8px;
			border-bottom: 1px solid #e5e7eb;
			font-size: 14px;
		}}
	</style>
	"""
	
	html = f"""
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="utf-8">
		<title>Receipt {doc.name}</title>
		{styles}
	</head>
	<body>
		<div class="receipt-container">
			<div class="receipt-header">{rendered_header}</div>
			<div class="receipt-body">{rendered_body}</div>
			<div class="receipt-footer">{rendered_footer}</div>
		</div>
	</body>
	</html>
	"""

	return {
		"html": html,
		"template": {
			"template_name": template_doc.template_name,
			"paper_size": template_doc.paper_size,
			"print_orientation": template_doc.print_orientation,
			"primary_color": template_doc.primary_color,
			"secondary_color": template_doc.secondary_color,
			"font_family": template_doc.font_family,
			"margins": template_doc.margins
		}
	}

@frappe.whitelist()
def download_receipt_pdf(doc_name, doctype, template_name=None):
	res = get_rendered_receipt(doc_name, doctype, template_name)
	html_content = res["html"]
	template_info = res["template"]
	
	page_size = template_info.get("paper_size") or "A4"
	orientation = template_info.get("print_orientation") or "Portrait"
	margins = template_info.get("margins") or "10mm"
	
	if "Thermal" in page_size:
		width = "80mm" if "80" in page_size else "58mm"
		page_rule = f"@page {{ size: {width} 200mm; margin: 2mm; }}"
	else:
		page_rule = f"@page {{ size: {page_size} {orientation.lower()}; margin: {margins}; }}"
		
	# Inject CSS @page layout rules for paged media rendering
	css_injection = f"<style>{page_rule}</style>"
	if "</head>" in html_content:
		html_content = html_content.replace("</head>", f"{css_injection}</head>")
	else:
		html_content = f"{css_injection}{html_content}"
		
	import weasyprint
	pdf_content = weasyprint.HTML(string=html_content).write_pdf()
	
	frappe.local.response.filename = f"Receipt_{doc_name}.pdf"
	frappe.local.response.filecontent = pdf_content
	frappe.local.response.type = "download"

@frappe.whitelist(allow_guest=True)
def verify_receipt(receipt_id, doctype):
	doc = None
	error = None
	try:
		doc = frappe.get_doc(doctype, receipt_id)
	except frappe.DoesNotExistError:
		error = f"Receipt {receipt_id} of type {doctype} was not found."
	except Exception as e:
		error = str(e)
		
	html = f"""
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Receipt Verification</title>
		<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
		<style>
			body {{
				font-family: 'Outfit', sans-serif;
				background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
				min-height: 100vh;
				display: flex;
				align-items: center;
				justify-content: center;
				margin: 0;
				padding: 20px;
			}}
			.card {{
				background: rgba(255, 255, 255, 0.95);
				border-radius: 16px;
				box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
				padding: 40px;
				max-width: 480px;
				width: 100%;
				text-align: center;
				backdrop-filter: blur(10px);
				border: 1px solid rgba(255, 255, 255, 0.5);
			}}
			.icon {{
				width: 80px;
				height: 80px;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				margin: 0 auto 24px;
				font-size: 40px;
			}}
			.icon.success {{
				background: #e6f4ea;
				color: #137333;
			}}
			.icon.error {{
				background: #fce8e6;
				color: #c5221f;
			}}
			h2 {{
				margin: 0 0 8px;
				color: #1f2937;
				font-size: 24px;
				font-weight: 700;
			}}
			.subtitle {{
				color: #6b7280;
				margin: 0 0 32px;
				font-size: 14px;
			}}
			.detail-row {{
				display: flex;
				justify-content: space-between;
				padding: 12px 0;
				border-bottom: 1px solid #f3f4f6;
				font-size: 15px;
			}}
			.detail-row:last-child {{
				border-bottom: none;
			}}
			.label {{
				color: #6b7280;
				font-weight: 500;
				text-align: left;
			}}
			.value {{
				color: #1f2937;
				font-weight: 600;
				text-align: right;
			}}
			.badge {{
				display: inline-block;
				padding: 4px 12px;
				border-radius: 12px;
				font-size: 12px;
				font-weight: 600;
				text-transform: uppercase;
			}}
			.badge.success {{
				background: #e6f4ea;
				color: #137333;
			}}
			.badge.pending {{
				background: #fef7e0;
				color: #b06000;
			}}
			.footer-logo {{
				margin-top: 32px;
				font-size: 12px;
				color: #9ca3af;
				font-weight: 600;
				text-transform: uppercase;
				letter-spacing: 1px;
			}}
		</style>
	</head>
	<body>
		<div class="card">
	"""
	
	if error:
		html += f"""
			<div class="icon error">✕</div>
			<h2>Verification Failed</h2>
			<p class="subtitle">The scanned document is not authentic or has been removed.</p>
			<div class="detail-row">
				<span class="label">Reason</span>
				<span class="value" style="color: #c5221f;">{error}</span>
			</div>
		"""
	else:
		temple_name = doc.get("temple")
		temple_title = ""
		if temple_name:
			temple_title = frappe.db.get_value("Temple", temple_name, "temple_name") or temple_name
			
		amount = doc.get("total_amount") or doc.get("amount") or 0.0
		doc_date = frappe.utils.format_date(doc.get("posting_date") or doc.get("creation"))
		status = doc.get("status") or doc.get("payment_status") or "Submitted"
		
		status_class = "success" if status in ["Paid", "Checked Out", "Submitted"] else "pending"
		
		html += f"""
			<div class="icon success">✓</div>
			<h2>Receipt Verified</h2>
			<p class="subtitle">This document is authentic and registered in the database.</p>
			
			<div class="detail-row">
				<span class="label">Receipt Number</span>
				<span class="value">{doc.name}</span>
			</div>
			<div class="detail-row">
				<span class="label">Temple / Trust</span>
				<span class="value">{temple_title}</span>
			</div>
			<div class="detail-row">
				<span class="label">Amount</span>
				<span class="value">₹{amount:,.2f}</span>
			</div>
			<div class="detail-row">
				<span class="label">Date</span>
				<span class="value">{doc_date}</span>
			</div>
			<div class="detail-row">
				<span class="label">Status</span>
				<span class="value"><span class="badge {status_class}">{status}</span></span>
			</div>
		"""
		
	html += """
			<div class="footer-logo">Temple Management System</div>
		</div>
	</body>
	</html>
	"""
	
	frappe.local.response.type = "binary"
	frappe.local.response.filecontent = html.encode("utf-8")
	frappe.local.response.content_type = "text/html"
