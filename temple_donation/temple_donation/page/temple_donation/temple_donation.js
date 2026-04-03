frappe.pages["temple-donation"].on_page_load = function (wrapper) {
  const page = frappe.ui.make_app_page({
    parent: wrapper,
    title: __("Temple Donation"),
    single_column: true,
  });

  // Load scoped CSS
  const premium_css = "/assets/temple_donation/js/temple_donation/styles.css";
  frappe.require(premium_css);
};

frappe.pages["temple-donation"].on_page_show = function (wrapper) {
  let $parent = $(wrapper).find(".layout-main-section");

  if ($parent.find("#react-root").length === 0) {
    $parent.empty().append(`<div id="react-root"></div>`);

    frappe.call({
      method: "temple_donation.temple_donation.api.get_latest_bundle",
      callback: function (r) {
        if (r.message) {
          frappe.require(r.message).then(() => {
            if (frappe.ui.TempleDonation) {
              frappe.temple_donation = new frappe.ui.TempleDonation({
                wrapper: $parent.find("#react-root"),
                page: wrapper.page,
              });
            }
          });
        }
      },
    });
  } else {
    if (window.update_temple_donation_route) {
      window.update_temple_donation_route();
    }
  }
};
