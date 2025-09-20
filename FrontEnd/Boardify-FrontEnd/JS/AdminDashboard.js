$(document).ready(function () {

    // --- Mobile Menu Toggle ---
    const mobileMenuToggle = $('#mobile--toggle');
    const navMenu = $('#nav-menu');

    mobileMenuToggle.click(function () {
        $(this).toggleClass('active');
        navMenu.toggleClass('active');
    });

    // --- Profile Dropdown Toggle ---
    const profileAvatar = $('#profile-avatar');
    const profileDropdown = $('#profile-dropdown');

    profileAvatar.click(function (event) {
        event.stopPropagation();
        profileDropdown.toggleClass('active');
    });

    $(document).click(function (event) {
        if (!profileDropdown.is(event.target) && !profileAvatar.is(event.target) && profileDropdown.has(event.target).length === 0) {
            profileDropdown.removeClass('active');
        }
    });

    // --- Fetch Admin Stats ---
    const token = localStorage.getItem("token"); // Assuming you store the token with the key "token"
    if (!token) {
        // If no token, redirect to login
        console.error("No token found, redirecting to login.");
        window.location.href = "Login.html"; // Make sure this path is correct
        return;
    }

    $.ajax({
        url: "http://localhost:8080/admin/stats", // Your backend endpoint
        type: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        success: function (response) {
            console.log("API Response:", response);

            // **CORRECTION 1: Access the 'data' object from your ApiResponse**
            const stats = response.data;

            // **CORRECTION 2: Use matching IDs to update the text**
            $("#users-count").text(stats.totalUsers.toLocaleString());
            $("#listing-count").text(stats.totalListings.toLocaleString());
            $("#available-listings").text(stats.availableListings.toLocaleString());
            $("#booked-listings").text(stats.bookedListings.toLocaleString());
        },
        error: function (xhr) {
            console.error("Failed to fetch stats:", xhr);
            let errorMessage = "Failed to load dashboard statistics.";
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
            } else if (xhr.status === 403) {
                errorMessage = "You do not have permission to view this data.";
            }

            Swal.fire({
                icon: 'error',
                title: 'Request Failed',
                text: errorMessage
            });
        }
    });

    // --- Leaflet Map ---
    // (Your Leaflet map code remains the same)
    var map = L.map('listingMap').setView([6.9271, 79.8612], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([6.9271, 79.8612]).addTo(map)
        .bindPopup('Colombo Central Listing.')
        .openPopup();

    L.marker([6.8665, 79.8817]).addTo(map)
        .bindPopup('Dehiwala-Mount Lavinia Listing.');

});