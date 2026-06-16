$(document).ready(() => {
    // Inject a "Back to Application" button on the profile update page
    if (window.location.pathname.includes('/update-profile')) {
        const backBtn = $(`
            <a href="/app/temple-donation" class="btn btn-sm btn-default btn-back-to-app" style="margin-bottom: 20px; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; border: 1px solid #e4e4e7; background-color: #ffffff; color: #18181b; padding: 6px 12px; border-radius: 6px; text-decoration: none; transition: all 0.2s; box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);">
                <span style="font-size: 14px;">&larr;</span> Back to Application
            </a>
        `);
        
        // Prepend to the first available layout container
        const target = $('.page-content, main, .page-container, .web-form-container').first();
        if (target.length) {
            target.prepend(backBtn);
        }
    }
});
