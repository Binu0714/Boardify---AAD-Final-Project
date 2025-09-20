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

    createUserGrowthChart();

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
                $("#users-count").text(stats.totalUsers.toLocaleString());
                $("#listing-count").text(stats.totalListings.toLocaleString());
                $("#available-listings").text(stats.availableListings.toLocaleString());
                $("#booked-listings").text(stats.bookedListings.toLocaleString());
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

        // --- University / Listing Markers ---
        L.marker([6.83, 79.91]).addTo(map)
            .bindPopup('KDU, Werahera');

        L.marker([6.90, 79.86]).addTo(map)
            .bindPopup('University of Colombo');

        L.marker([6.92, 79.97]).addTo(map)
            .bindPopup('SLIIT Malabe Campus');

        L.marker([6.97, 79.92]).addTo(map)
            .bindPopup('University of Kelaniya');

        L.marker([7.26, 80.60]).addTo(map)
            .bindPopup('University of Peradeniya');

        L.marker([6.71, 79.91]).addTo(map)
            .bindPopup('Grace Peiris Rd, Panadura');

        L.marker([6.87, 79.88]).addTo(map)
            .bindPopup('Kohuwala Listing');


    } catch(e) {
        console.error("Failed to initialize Leaflet map:", e);
    }
}

function createUserGrowthChart() {
    const ctx = document.getElementById('userRegistrationsChart');
    if (!ctx) return; // Exit if the canvas element doesn't exist

    // --- 1. Generate Fake Data ---
    const labels = [];
    const dataPoints = [];
    let cumulativeUsers = Math.floor(Math.random() * 2) + 2; // Start with a random base of 100-150 users

    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Format the date for the label (e.g., "Aug 15")
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

        // Add a random number of new users for that day (between 2 and 14)
        const newUsersToday = Math.floor(Math.random() * 13) + 2;
        cumulativeUsers += newUsersToday;
        dataPoints.push(cumulativeUsers);
    }


    // --- 2. Configure the Chart ---
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Users',
                data: dataPoints,
                fill: true, // Creates the beautiful gradient area under the line
                backgroundColor: 'rgba(79, 172, 254, 0.1)', // Light blue, semi-transparent
                borderColor: 'rgba(79, 172, 254, 1)', // Solid blue line
                pointBackgroundColor: 'rgba(79, 172, 254, 1)', // Solid blue points
                pointBorderColor: '#fff', // White border on points
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(79, 172, 254, 1)',
                tension: 0.3, // Makes the line smooth and curved
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false, // Start the Y-axis near the lowest data point
                    grid: {
                        color: '#e2e8f0' // Lighter grid lines
                    },
                    ticks: {
                        color: '#64748b' // Softer color for axis labels
                    }
                },
                x: {
                    grid: {
                        display: false // Hide vertical grid lines for a cleaner look
                    },
                    ticks: {
                        color: '#64748b',
                        maxRotation: 0, // Keep labels horizontal
                        autoSkip: true, // Automatically hide some labels if they overlap
                        maxTicksLimit: 10 // Show a maximum of 10 labels on the X-axis
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // Hide the "Total Users" legend to save space
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#fff',
                    bodyColor: '#cbd5e1',
                    padding: 10,
                    cornerRadius: 8,
                    displayColors: false // Hide the little color box in the tooltip
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}