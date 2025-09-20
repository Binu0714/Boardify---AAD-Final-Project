$(document).ready(function() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "Login.html";
        return;
    }

    setupPageInteractions();

    checkAndShowAdminApprovalAlert(token);

    try {
        const payload = parseJwt(token);
        if (payload && payload.sub) {
            $("#dashboard-username").text(payload.sub + "!");
        }
    } catch (e) {
        console.error("Could not parse JWT to set username:", e);
    }

    fetchDashboardStats(token);
    setupLeafletMap();

});

function setupPageInteractions() {
    const mobileMenuToggle = $('#mobile-menu-toggle');
    const navMenu = $('#nav-menu');
    mobileMenuToggle.click(function() {
        $(this).toggleClass('active');
        navMenu.toggleClass('active');
    });

    const profileAvatar = $('#profile-avatar');
    const profileDropdown = $('#profile-dropdown');
    profileAvatar.click(function(event) {
        event.stopPropagation();
        profileDropdown.toggleClass('active');
    });

    $(document).click(function(event) {
        if (!profileDropdown.is(event.target) && !profileAvatar.is(event.target) && profileDropdown.has(event.target).length === 0) {
            profileDropdown.removeClass('active');
        }
    });
}

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

function checkAndShowAdminApprovalAlert(token) {
    $.ajax({
        url: 'http://localhost:8080/property/unverified',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function(res) {
            if (res.status === 200 && res.data && res.data.length > 0) {
                const pendingCount = res.data.length;

                Swal.fire({
                    title: 'Admin Alert',
                    html: `You have <strong>${pendingCount}</strong> new listing${pendingCount > 1 ? 's' : ''} pending approval.`,
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#aaa',
                    cancelButtonText: 'Dismiss',
                    confirmButtonText: 'Review Now'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'Listings.html';
                    }
                });
            }
        },
        error: function(err) {
            console.error("Could not check for pending approvals:", err);
        }
    });
}

function fetchDashboardStats(token) {
    $.ajax({
        url: "http://localhost:8080/admin/stats",
        type: "GET",
        headers: { "Authorization": `Bearer ${token}` },
        success: function (response) {
            if (response.status === 200 && response.data) {
                const stats = response.data;
                $("#total-users").text(stats.totalUsers.toLocaleString());
                $("#total-ads").text(stats.totalListings.toLocaleString());
                $("#available-ads").text(stats.availableListings.toLocaleString());
                $("#booked-ads").text(stats.bookedListings.toLocaleString());
            }
        },
        error: function (xhr) {
            console.error("Failed to fetch admin stats:", xhr);
            $(".stat-number").text('--');
        }
    });
}

function setupLeafletMap() {
    try {
        const map = L.map('listingMap').setView([6.9271, 79.8612], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker([6.9271, 79.8612]).addTo(map).bindPopup('Colombo Central Listing.');
        L.marker([6.8665, 79.8817]).addTo(map).bindPopup('Dehiwala-Mount Lavinia Listing.');
    } catch(e) {
        console.error("Failed to initialize Leaflet map:", e);
    }
}