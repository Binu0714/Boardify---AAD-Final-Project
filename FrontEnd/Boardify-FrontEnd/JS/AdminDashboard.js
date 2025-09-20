document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Toggle ---
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // --- Profile Dropdown Toggle ---
    const profileAvatar = document.getElementById('profile-avatar');
    const profileDropdown = document.getElementById('profile-dropdown');

    profileAvatar.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent click from bubbling up to document
        profileDropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!profileDropdown.contains(event.target) && !profileAvatar.contains(event.target)) {
            profileDropdown.classList.remove('active');
        }
    });

    // // --- Chart.js ---
    // const userRegistrationsCtx = document.getElementById('userRegistrationsChart').getContext('2d');
    // new Chart(userRegistrationsCtx, {
    //     type: 'line',
    //     data: {
    //         labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    //         datasets: [{
    //             label: 'New Users',
    //             data: [65, 59, 80, 81, 56, 55, 40],
    //             fill: true,
    //             backgroundColor: 'rgba(139, 92, 246, 0.1)',
    //             borderColor: '#8b5cf6',
    //             tension: 0.3
    //         }]
    //     },
    //     options: {
    //         responsive: true,
    //         maintainAspectRatio: false
    //     }
    // });

    // --- Leaflet Map ---
    var map = L.map('listingMap').setView([6.9271, 79.8612], 12); // Centered on Colombo

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([6.9271, 79.8612]).addTo(map)
        .bindPopup('Colombo Central Listing.')
        .openPopup();
    L.marker([6.8665, 79.8817]).addTo(map)
        .bindPopup('Dehiwala-Mount Lavinia Listing.');

});