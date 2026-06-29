app_name = "temple_donation"
app_title = "Trust Management"
app_publisher = "sk"
app_description = "Trust Management System"
app_email = "shailesh@aavatto.com"
app_license = "mit"

app_include_js = [
    # "/assets/temple_donation/dist/temple_donation.bundle.js",
    "/assets/temple_donation/js/temple_donation/redirect.js"
]


app_include_css = [
    "/assets/temple_donation/js/temple_donation/styles.css"
]

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "temple_donation",
# 		"logo": "/assets/temple_donation/logo.png",
# 		"title": "Temple Donation",
# 		"route": "/temple_donation",
# 		"has_permission": "temple_donation.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/temple_donation/css/temple_donation.css"
# app_include_js = "/assets/temple_donation/js/temple_donation.js"

# include js, css files in header of web template
web_include_css = "/assets/temple_donation/js/temple_donation/styles.css"
web_include_js = "/assets/temple_donation/js/temple_donation/web_custom.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "temple_donation/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "temple_donation/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
role_home_page = {
	"Temple Admin": "app/temple-donation",
	"Cashier": "app/temple-donation",
	"Super Admin": "app/temple-donation"
}

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "temple_donation.utils.jinja_methods",
# 	"filters": "temple_donation.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "temple_donation.install.before_install"
# after_install = "temple_donation.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "temple_donation.uninstall.before_uninstall"
# after_uninstall = "temple_donation.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "temple_donation.utils.before_app_install"
# after_app_install = "temple_donation.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "temple_donation.utils.before_app_uninstall"
# after_app_uninstall = "temple_donation.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "temple_donation.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

doc_events = {
	"User": {
		"before_save": "temple_donation.api.sync_user_roles"
	}
}

# Scheduled Tasks
# ---------------

scheduler_events = {
	"cron": {
		"* * * * *": [
			"temple_donation.api.room_booking.update_room_statuses"
		]
	}
}

# Testing
# -------

# before_tests = "temple_donation.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "temple_donation.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "temple_donation.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["temple_donation.utils.before_request"]
# after_request = ["temple_donation.utils.after_request"]

# Job Events
# ----------
# before_job = ["temple_donation.utils.before_job"]
# after_job = ["temple_donation.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"temple_donation.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

# Translation
# ------------
# List of apps whose translatable strings should be excluded from this app's translations.
# ignore_translatable_strings_from = []

fixtures = [
    # "Role Profile",
    {
        "dt":"Role",
        "filters":[
            ["name","in",["Temple Admin","Super Admin","Cashier"]]
        ]
    }
]