frappe.pages["temple-donation"].on_page_load = function (wrapper) {
  const page = frappe.ui.make_app_page({
    parent: wrapper,
    title: __("Temple Donation"),
    single_column: true,
  });

  // Hide the standard Frappe page header to prevent double headers
  if (page && page.header) page.header.hide();
  $(wrapper).find('.page-head').hide();

  // Load scoped CSS
  const premium_css = "/assets/temple_donation/js/temple_donation/styles.css";
  frappe.require(premium_css);
};

frappe.pages["temple-donation"].on_page_show = function (wrapper) {
  // Hide standard header on show as well
  $(wrapper).find('.page-head').hide();

  let $parent = $(wrapper).find(".layout-main-section");

  if ($parent.find("#react-root").length === 0) {
    $parent.empty().append(`<div id="react-root"></div>`);

    // Immediately inject the custom waving flag loading screen to document.body
    // to hide any Frappe loading elements or logos
    if (!document.getElementById("temple-initial-loader")) {
      const loaderHtml = `
        <div id="temple-initial-loader" style="position: fixed; inset: 0; z-index: 999999; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle at center, #ffffff 0%, #f9fafb 60%, #f3f4f6 100%); width: 100vw; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <style>
            @keyframes spinLoader {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes progressAnim {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          </style>
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
            <div style="width: 180px; height: 180px; margin-bottom: 16px; filter: drop-shadow(0 12px 24px rgba(245, 158, 11, 0.15)); position: relative; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 150px; height: 150px; background: radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0) 70%); border-radius: 50%; z-index: 1;"></div>
              <svg viewBox="0 0 150 150" style="position: relative; z-index: 2; width: 100%; height: 100%;" xmlns="http://www.w3.org/2000/svg">
                <!-- Outer Ring -->
                <circle cx="75" cy="75" r="68" fill="none" stroke="url(#goldGradientLoader)" stroke-width="2" opacity="0.3" style="transform-origin: center; animation: spinLoader 8s linear infinite;" />
                <circle cx="75" cy="75" r="58" fill="none" stroke="url(#goldGradientLoader)" stroke-width="1.5" />
                
                <!-- Solid Center Circle -->
                <circle cx="75" cy="75" r="48" fill="url(#goldGradientLoader)" />
                
                <!-- Symmetrical Monogram Text -->
                <text x="75" y="91" font-family="-apple-system, BlinkMacSystemFont, 'Outfit', 'Inter', sans-serif" font-size="46" font-weight="900" fill="#ffffff" text-anchor="middle">T</text>

                <defs>
                  <linearGradient id="goldGradientLoader" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#f59e0b" />
                    <stop offset="100%" stop-color="#d97706" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #18181b; margin: 16px 0 0 0; letter-spacing: -0.025em;">Trust Management Portal</h2>
            <p style="font-size: 0.875rem; color: #71717a; margin: 6px 0 0 0;">Initializing services, please wait...</p>
            <div style="width: 140px; height: 4px; background-color: #e4e4e7; border-radius: 2px; margin-top: 24px; overflow: hidden; position: relative;">
              <div style="position: absolute; left: 0; top: 0; height: 100%; width: 100%; background: linear-gradient(90deg, #f59e0b, #d97706); transform-origin: left; animation: progressAnim 1.6s infinite ease-in-out;"></div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', loaderHtml);
    }

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
