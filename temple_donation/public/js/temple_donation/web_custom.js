$(document).ready(() => {
    // Redirect old update-profile route to the new custom /me page
    if (window.location.pathname.includes('/update-profile')) {
        window.location.href = '/me';
    }
});
