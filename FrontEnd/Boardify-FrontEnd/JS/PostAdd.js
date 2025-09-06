// This file contains the final, simplified logic for the Post Ad page with manual address input.

window.addEventListener('load', () => {

    // --- CONFIGURATION ---
    // IMPORTANT: Make sure this is your real LocationIQ API key.
    const LOCATIONIQ_API_KEY = "pk.96f2728aa09caeeee3fc53d7d44d1ab5";

    // --- GLOBAL VARIABLES ---
    let map;
    let marker;
    const initialPosition = [7.8731, 80.7718]; // Center of Sri Lanka

    // =================================================================
    // HEADER & NAVIGATION LOGIC
    // =================================================================
    // ... (Your existing, working header/menu/profile logic goes here) ...

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
            profileAvatar.classList.toggle('active');
            profileDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (event) => {
            if (!profileDropdown.contains(event.target) && !profileAvatar.contains(event.target)) {
                profileAvatar.classList.remove('active');
                profileDropdown.classList.remove('active');
            }
        });

        // --- Header scroll effect ---
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });



    // =================================================================
    // MAP, LOCATION, and FORM LOGIC (MANUAL INPUT VERSION)
    // =================================================================

    function initializeMap() {
        const mapContainer = document.getElementById('map');
        if (mapContainer && typeof L !== 'undefined') {
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });
            map = L.map(mapContainer).setView(initialPosition, 8);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
            map.invalidateSize();
            marker = L.marker(initialPosition, { draggable: true }).addTo(map);
            marker.on('dragend', (event) => {
                const position = event.target.getLatLng();
                updateMapAndFields(position.lat, position.lng);
            });
        }
    }

    function updateMapAndFields(lat, lng, zoomLevel = 17) {
        const newLatLng = new L.LatLng(lat, lng);
        marker.setLatLng(newLatLng);
        map.setView(newLatLng, zoomLevel);
        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lng;
    }

    // This function geocodes the manually typed address
    function geocodeAddress() {
        const address = document.getElementById('ad-address').value;
        const city = document.getElementById('ad-city').value;
        const district = document.getElementById('ad-district').value;

        // Don't search if the main fields are empty
        if (!city || !district || !address) {
            console.log("Please fill all address fields to update the map.");
            if (typeof Swal !== 'undefined') {
                Swal.fire('Incomplete Address', 'Please fill in the City, District, and Street Address fields to find the location on the map.', 'warning');
            }
            return;
        }

        const fullAddress = `${address}, ${city}, ${district}, Sri Lanka`;

        // Use LocationIQ's Forward Geocoding endpoint
        fetch(`https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(fullAddress)}&format=json&countrycodes=lk&limit=1`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                // If we get a result, update the map to the exact location
                if (data && data.length > 0) {
                    updateMapAndFields(data[0].lat, data[0].lon);
                } else {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire('Location Not Found', 'We could not find that exact address. Please check the details and try again.', 'error');
                    } else {
                        alert("Location not found. Please check the address details.");
                    }
                }
            })
            .catch(error => console.error("Geocoding Error:", error));
    }

    // This function sets up listeners for the address fields to trigger on 'Enter' key
    function setupAddressListeners() {
        const cityInput = document.getElementById('ad-city');
        const districtInput = document.getElementById('ad-district');
        const addressInput = document.getElementById('ad-address');

        const handleKeyPress = (event) => {
            // Check if the key pressed was 'Enter'
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevents the form from submitting
                geocodeAddress(); // Call the function to update the map
            }
        };

        if (cityInput) cityInput.addEventListener('keydown', handleKeyPress);
        if (districtInput) districtInput.addEventListener('keydown', handleKeyPress);
        if (addressInput) addressInput.addEventListener('keydown', handleKeyPress);
    }

    // --- INITIALIZE ALL DYNAMIC FEATURES ---
    initializeMap();
    setupAddressListeners();

    // =================================================================
    // IMAGE PREVIEW & FORM SUBMISSION LOGIC
    // =================================================================
    // ... (Your existing, working logic for image previews and form submission goes here) ...

}); // End of window.addEventListener('load')