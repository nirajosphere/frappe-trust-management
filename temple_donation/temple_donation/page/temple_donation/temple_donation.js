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
            <div style="width: 180px; height: 180px; margin-bottom: 16px; filter: drop-shadow(0 12px 24px rgba(16, 185, 129, 0.18)); position: relative; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 150px; height: 150px; background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0) 70%); border-radius: 50%; z-index: 1;"></div>
              <svg viewBox="0 0 200 200" style="position: relative; z-index: 2; width: 100%; height: 100%;" xmlns="http://www.w3.org/2000/svg">
                <!-- Outer glowing rings -->
                <circle cx="100" cy="100" r="80" fill="none" stroke="url(#accentGradientLoader)" stroke-width="2" stroke-dasharray="5 5" opacity="0.4" style="transform-origin: center; animation: spinLoader 8s linear infinite;" />
                
                <!-- Stylized Trust Emblem -->
                <!-- Left curve representing community care/support -->
                <path d="M 60,130 C 45,100 55,60 90,55 C 95,70 90,85 80,95 C 75,100 70,110 80,120 C 85,125 95,130 100,135 C 90,135 70,135 60,130 Z" 
                      fill="url(#primaryGradientLoader)" opacity="0.9" />
                
                <!-- Right curve representing protection/trust -->
                <path d="M 140,130 C 155,100 145,60 110,55 C 105,70 110,85 120,95 C 125,100 130,110 120,120 C 115,125 105,130 100,135 C 110,135 130,135 140,130 Z" 
                      fill="url(#primaryGradientLoader)" opacity="0.9" />
                
                <!-- Heart/Leaf shape in center representing life/charity -->
                <path d="M 100,60 C 108,70 115,80 115,90 C 115,102 108,110 100,110 C 92,110 85,102 85,90 C 85,80 92,70 100,60 Z" 
                      fill="url(#accentGradientLoader)" />

                <defs>
                  <linearGradient id="primaryGradientLoader" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#18181b" />
                    <stop offset="100%" stop-color="#27272a" />
                  </linearGradient>
                  <linearGradient id="accentGradientLoader" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#10b981" />
                    <stop offset="100%" stop-color="#059669" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #18181b; margin: 16px 0 0 0; letter-spacing: -0.025em;">Trust Management Portal</h2>
            <p style="font-size: 0.875rem; color: #71717a; margin: 6px 0 0 0;">Initializing services, please wait...</p>
            <div style="width: 140px; height: 4px; background-color: #e4e4e7; border-radius: 2px; margin-top: 24px; overflow: hidden; position: relative;">
              <div style="position: absolute; left: 0; top: 0; height: 100%; width: 100%; background: linear-gradient(90deg, #10b981, #059669); transform-origin: left; animation: progressAnim 1.6s infinite ease-in-out;"></div>
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
