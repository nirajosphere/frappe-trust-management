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
        <div id="temple-initial-loader" style="position: fixed; inset: 0; z-index: 999999; display: flex; flex-direction: column; align-items: center; justify-content: center; background: radial-gradient(circle at center, #ffffff 0%, #fffcf8 60%, #fff8f0 100%); width: 100vw; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <style>
            @keyframes loadingBarInit {
              0% { transform: scaleX(0) translateX(0); }
              50% { transform: scaleX(0.7) translateX(30%); }
              100% { transform: scaleX(0) translateX(150%); }
            }
            @keyframes pulseGlowInit {
              0% { transform: translate(-50%, -50%) scale(0.92); opacity: 0.6; }
              100% { transform: translate(-50%, -50%) scale(1.12); opacity: 1; }
            }
          </style>
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
            <div style="width: 180px; height: 180px; margin-bottom: 16px; filter: drop-shadow(0 12px 24px rgba(234, 179, 8, 0.18)); position: relative; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 150px; height: 150px; background: radial-gradient(circle, rgba(234, 179, 8, 0.15) 0%, rgba(234, 179, 8, 0) 70%); border-radius: 50%; animation: pulseGlowInit 3s ease-in-out infinite alternate; z-index: 1;"></div>
              <svg viewBox="0 0 200 200" style="position: relative; z-index: 2; width: 100%; height: 100%;" xmlns="http://www.w3.org/2000/svg">
                <path d="M 50,160 L 150,160 L 145,150 L 55,150 Z" fill="#eab308" opacity="0.9" />
                <path d="M 60,150 L 140,150 L 136,140 L 64,140 Z" fill="#eab308" />
                <path d="M 68,140 L 132,140 L 128,128 L 72,128 Z" fill="#eab308" opacity="0.95" />
                <path d="M 76,128 C 76,105 92,85 94,62 L 106,62 C 108,85 124,105 124,128 Z" fill="#eab308" />
                <line x1="82" y1="115" x2="118" y2="115" stroke="#a16207" stroke-width="1.5" opacity="0.5" />
                <line x1="87" y1="102" x2="113" y2="102" stroke="#a16207" stroke-width="1.5" opacity="0.5" />
                <line x1="91" y1="89" x2="109" y2="89" stroke="#a16207" stroke-width="1.5" opacity="0.5" />
                <line x1="93" y1="76" x2="107" y2="76" stroke="#a16207" stroke-width="1.5" opacity="0.5" />
                <path d="M 96,62 L 104,62 L 104,59 L 96,59 Z" fill="#eab308" />
                <circle cx="100" cy="55" r="4.5" fill="#eab308" />
                <path d="M 98,51 L 102,51 L 100,44 Z" fill="#eab308" />
                <line x1="100" y1="44" x2="100" y2="10" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round" />
                <circle cx="100" cy="9" r="1.5" fill="#eab308" />
                <path fill="#f97316" stroke="#ea580c" stroke-width="0.5" stroke-linejoin="round">
                  <animate
                    attributeName="d"
                    dur="1.8s"
                    repeatCount="indefinite"
                    values="
                      M 100,12 Q 115,2 128,12 T 155,20 Q 130,30 115,22 T 100,34 Z;
                      M 100,12 Q 115,10 128,4 T 155,24 Q 130,22 115,30 T 100,34 Z;
                      M 100,12 Q 115,18 128,12 T 155,26 Q 130,18 115,26 T 100,34 Z;
                      M 100,12 Q 115,10 128,4 T 155,22 Q 130,28 115,20 T 100,34 Z;
                      M 100,12 Q 115,2 128,12 T 155,20 Q 130,30 115,22 T 100,34 Z
                    "
                  />
                </path>
              </svg>
            </div>
            <h2 style="font-size: 1.35rem; font-weight: 700; color: #18181b; margin: 16px 0 0 0; letter-spacing: -0.025em;">Temple Donation Portal</h2>
            <p style="font-size: 0.875rem; color: #71717a; margin: 6px 0 0 0;">Initializing services, please wait...</p>
            <div style="width: 140px; height: 4px; background-color: #f4f4f5; border-radius: 2px; margin-top: 24px; overflow: hidden; position: relative;">
              <div style="position: absolute; left: 0; top: 0; height: 100%; width: 100%; background: linear-gradient(90deg, #fb923c, #ea580c); transform-origin: left; animation: loadingBarInit 2.5s infinite ease-in-out;"></div>
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
