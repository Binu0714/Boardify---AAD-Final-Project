// // This file contains the final, corrected logic for the Post Ad page with robust data parsing.
//
// window.addEventListener('load', () => {
//
//     // --- CONFIGURATION ---
//     // IMPORTANT: Make sure this is your real LocationIQ API key.
//     const LOCATIONIQ_API_KEY = "pk.96f2728aa09caeeee3fc53d7d44d1ab5";
//
//     // --- GLOBAL VARIABLES ---
//     let map;
//     let marker;
//     const initialPosition = [7.8731, 80.7718]; // Center of Sri Lanka
//     let debounceTimer;
//
//     // =================================================================
//     // HEADER & NAVIGATION LOGIC
//     // =================================================================
//     const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
//     const navMenu = document.getElementById('nav-menu');
//     if (mobileMenuToggle && navMenu) {
//         mobileMenuToggle.addEventListener('click', () => {
//             mobileMenuToggle.classList.toggle('active');
//             navMenu.classList.toggle('active');
//         });
//     }
//
//     const profileAvatar = document.getElementById('profile-avatar');
//     const profileDropdown = document.getElementById('profile-dropdown');
//     if (profileAvatar && profileDropdown) {
//         profileAvatar.addEventListener('click', (event) => {
//             event.stopPropagation();
//             profileAvatar.classList.toggle('active');
//             profileDropdown.classList.toggle('active');
//         });
//     }
//
//     document.addEventListener('click', (event) => {
//         if (profileDropdown && profileAvatar && !profileDropdown.contains(event.target) && !profileAvatar.contains(event.target)) {
//             profileAvatar.classList.remove('active');
//             profileDropdown.classList.remove('active');
//         }
//     });
//
//     window.addEventListener('scroll', () => {
//         const header = document.querySelector('.header');
//         if (header) {
//             if (window.scrollY > 50) { header.classList.add('scrolled'); }
//             else { header.classList.remove('scrolled'); }
//         }
//     });
//
//     window.handleLogout = function(event) {
//         event.preventDefault();
//         // Your existing logout logic here
//     };
//
//     // =================================================================
//     // IMAGE PREVIEW LOGIC
//     // =================================================================
//     const imageUploadInput = document.getElementById('image-upload-input');
//     const previewContainer = document.getElementById('image-preview-container');
//     const uploadBox = document.getElementById('image-upload-box');
//     const MAX_IMAGES = 5;
//     let selectedFiles = [];
//
//     if (imageUploadInput) {
//         imageUploadInput.addEventListener('change', (e) => {
//             const newFiles = Array.from(e.target.files);
//             selectedFiles = [...selectedFiles, ...newFiles].slice(0, MAX_IMAGES);
//             updateFileInput();
//             renderPreviews();
//         });
//     }
//
//     function renderPreviews() {
//         if (!previewContainer) return;
//         previewContainer.innerHTML = '';
//         selectedFiles.forEach((file, index) => {
//             const reader = new FileReader();
//             reader.onload = (e) => {
//                 const previewItem = document.createElement('div');
//                 previewItem.classList.add('image-preview-item');
//                 previewItem.innerHTML = `<img src="${e.target.result}" alt="Preview ${index + 1}"><button type="button" class="remove-image-btn" data-index="${index}">&times;</button>`;
//                 previewContainer.appendChild(previewItem);
//             };
//             reader.readAsDataURL(file);
//         });
//         if (uploadBox) {
//             uploadBox.style.display = selectedFiles.length >= MAX_IMAGES ? 'none' : 'flex';
//         }
//     }
//
//     function removeImage(indexToRemove) {
//         selectedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
//         updateFileInput();
//         renderPreviews();
//     }
//
//     function updateFileInput() {
//         const dataTransfer = new DataTransfer();
//         selectedFiles.forEach(file => dataTransfer.items.add(file));
//         imageUploadInput.files = dataTransfer.files;
//     }
//
//     if (previewContainer) {
//         previewContainer.addEventListener('click', (e) => {
//             if (e.target.classList.contains('remove-image-btn')) {
//                 removeImage(parseInt(e.target.dataset.index, 10));
//             }
//         });
//     }
//
//     // =================================================================
//     // MAP, LOCATION, and FORM LOGIC (DEFINITIVE VERSION)
//     // =================================================================
//
//     function initializeMap() {
//         const mapContainer = document.getElementById('map');
//         if (mapContainer && typeof L !== 'undefined') {
//             delete L.Icon.Default.prototype._getIconUrl;
//             L.Icon.Default.mergeOptions({
//                 iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//                 iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//                 shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
//             });
//             map = L.map(mapContainer).setView(initialPosition, 8);
//             L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
//             map.invalidateSize();
//             marker = L.marker(initialPosition, { draggable: true }).addTo(map);
//             marker.on('dragend', (event) => {
//                 updateMapAndFields(event.target.getLatLng().lat, event.target.getLatLng().lng);
//             });
//         }
//     }
//
//     function updateMapAndFields(lat, lng, zoomLevel = 17) {
//         const newLatLng = new L.LatLng(lat, lng);
//         marker.setLatLng(newLatLng);
//         map.setView(newLatLng, zoomLevel);
//         document.getElementById('latitude').value = lat;
//         document.getElementById('longitude').value = lng;
//     }
//
//     function geocodeFullAddress() {
//         const address = document.getElementById('ad-address').value;
//         const city = document.getElementById('ad-city').value;
//         const district = document.getElementById('ad-district').value;
//         if (!city || !district || !address) return;
//
//         const fullAddress = `${address}, ${city}, ${district}, Sri Lanka`;
//
//         fetch(`https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(fullAddress)}&format=json&countrycodes=lk&limit=1`)
//             .then(response => {
//                 if (!response.ok) { throw new Error('Geocoding network response was not ok'); }
//                 return response.json();
//             })
//             .then(data => {
//                 if (data && data.length > 0) {
//                     updateMapAndFields(data[0].lat, data[0].lon);
//                 }
//             })
//             .catch(error => console.error("Geocoding Error:", error));
//     }
//
//     function setupAutocomplete() {
//         if (typeof autoComplete === 'undefined' || !document.getElementById('ad-city')) return;
//
//         new autoComplete({
//             selector: "#ad-city",
//             resultsList: { render: true },
//             debounce: 500,
//             data: {
//                 src: async (query) => {
//                     if (query.length < 3) return [];
//                     try {
//                         const source = await fetch(`https://api.locationiq.com/v1/autocomplete?key=${LOCATIONIQ_API_KEY}&q=${query}&countrycodes=lk&limit=7&addressdetails=1&normalizecity=1`);
//                         if (!source.ok) { throw new Error('Autocomplete network response was not ok. Check API Key.'); }
//                         const data = await source.json();
//                         // Pre-process the data to make it reliable
//                         return data.map(item => {
//                             const city = item.address.city || item.address.town || item.address.village || item.address.hamlet || item.name;
//                             const district = item.address.county || '';
//                             item.search_key = `${city} ${district}`.trim();
//                             return item;
//                         });
//                     } catch (error) {
//                         console.error("Autocomplete Error:", error);
//                         return [];
//                     }
//                 },
//                 keys: ["search_key"], // Search in our new, clean key
//                 cache: false
//             },
//             resultItem: {
//                 element: (item, data) => {
//                     // Display the clean, formatted name to the user
//                     const city = data.value.address.city || data.value.address.town || data.value.address.village || data.value.name;
//                     const district = data.value.address.county || data.value.address.state || 'N/A';
//                     item.innerHTML = `<span>${city}, ${district}</span>`;
//                 },
//                 highlight: true
//             },
//             events: {
//                 input: {
//                     selection: (event) => {
//                         const selection = event.detail.selection.value;
//                         const cityInput = document.getElementById('ad-city');
//                         const districtInput = document.getElementById('ad-district');
//
//                         // Use the robust logic to fill the fields correctly
//                         const city = selection.address.city || selection.address.town || selection.address.village || selection.name;
//                         const district = selection.address.county || selection.address.state || '';
//
//                         cityInput.value = city;
//                         districtInput.value = district;
//
//                         // Map is NOT updated here, respecting your request.
//                     }
//                 }
//             }
//         });
//     }
//
//     function setupStreetAddressListener() {
//         const addressInput = document.getElementById('ad-address');
//         if (addressInput) {
//             addressInput.addEventListener('input', () => {
//                 clearTimeout(debounceTimer);
//                 debounceTimer = setTimeout(geocodeFullAddress, 1500);
//             });
//         }
//     }
//
//     // --- INITIALIZE ALL FEATURES ---
//     initializeMap();
//     setupAutocomplete();
//     setupStreetAddressListener();
//
//     // =================================================================
//     // FORM SUBMISSION LOGIC
//     // =================================================================
//     const postAdForm = document.getElementById('post-ad-form');
//     if (postAdForm) {
//         // Your form submission logic here
//     }
//
// }); // End of window.addEventListener('load')

// This is the complete code for your PostAdd.js file

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


    // --- CONFIGURATION ---
    const LOCATIONIQ_API_KEY = "pk.96f2728aa09caeeee3fc53d7d44d1ab5"; // <-- IMPORTANT: PASTE YOUR API KEY HERE

    // --- GLOBAL VARIABLES for the map ---
    let map;
    let marker;
    const initialPosition = [7.8731, 80.7718]; // Center of Sri Lanka

    // =================================================================
    // IMAGE PREVIEW LOGIC
    // =================================================================
    const imageUploadInput = document.getElementById('image-upload-input');
    const previewContainer = document.getElementById('image-preview-container');
    const uploadBox = document.getElementById('image-upload-box');
    const MAX_IMAGES = 5;
    let selectedFiles = [];

    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', (e) => {
            const newFiles = Array.from(e.target.files);
            selectedFiles = [...selectedFiles, ...newFiles].slice(0, MAX_IMAGES);
            updateFileInput();
            renderPreviews();
        });
    }

    function renderPreviews() {
        if (!previewContainer) return;
        previewContainer.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.classList.add('image-preview-item');
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Image preview">
                    <button type="button" class="remove-image-btn" data-index="${index}">&times;</button>
                `;
                previewContainer.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        });
        if (uploadBox) {
            uploadBox.style.display = selectedFiles.length >= MAX_IMAGES ? 'none' : 'flex';
        }
    }

    function removeImage(indexToRemove) {
        selectedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
        updateFileInput();
        renderPreviews();
    }

    function updateFileInput() {
        const dataTransfer = new DataTransfer();
        selectedFiles.forEach(file => dataTransfer.items.add(file));
        imageUploadInput.files = dataTransfer.files;
    }

    if (previewContainer) {
        previewContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-image-btn')) {
                const index = parseInt(e.target.dataset.index, 10);
                removeImage(index);
            }
        });
    }

    // =================================================================
    // LOCATIONIQ & LEAFLET MAP LOGIC
    // =================================================================

    // --- MAP INITIALIZATION ---
    function initializeMap() {
        if (document.getElementById('map')) {
            map = L.map('map').setView(initialPosition, 8);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            }).addTo(map);
            marker = L.marker(initialPosition, { draggable: true }).addTo(map);
            marker.on('dragend', (event) => {
                const position = event.target.getLatLng();
                updateMapAndFields(position.lat, position.lng);
            });
        }
    }

    // --- MAP & FIELD UPDATE HELPER ---
    function updateMapAndFields(lat, lng) {
        const newLatLng = new L.LatLng(lat, lng);
        marker.setLatLng(newLatLng);
        map.setView(newLatLng, 15);
        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lng;
    }

    // --- AUTOCOMPLETE SETUP ---
    function setupAutocomplete() {
        if (typeof autoComplete === 'undefined' || !document.getElementById('ad-city')) return;

        new autoComplete({
            selector: "#ad-city",
            placeHolder: "Start typing a city name...",
            data: {
                src: async (query) => {
                    if (query.length < 3) return [];
                    try {
                        const source = await fetch(`https://api.locationiq.com/v1/autocomplete?key=${LOCATIONIQ_API_KEY}&q=${query}&countrycodes=lk&limit=5&dedupe=1`);
                        if (!source.ok) throw new Error('Network response was not ok');
                        const data = await source.json();
                        return data;
                    } catch (error) {
                        console.error("Autocomplete Error:", error);
                        return [];
                    }
                },
                keys: ["display_name"],
                cache: false
            },
            resultItem: {
                highlight: true
            },
            events: {
                input: {
                    selection: (event) => {
                        const selection = event.detail.selection.value;
                        const cityName = selection.address.city || selection.address.town || selection.address.village || '';
                        const districtName = selection.address.county || selection.address.state || '';

                        // Set the input values
                        const cityInput = document.getElementById('ad-city');
                        if (cityInput) cityInput.value = cityName;

                        const districtInput = document.getElementById('ad-district');
                        if(districtInput) districtInput.value = districtName;

                        // Trigger the map update
                        updateMapAndFields(selection.lat, selection.lon);
                    }
                }
            }
        });
    }

    // =================================================================
    // FORM SUBMISSION LOGIC
    // =================================================================
    const postAdForm = document.getElementById('post-ad-form');
    if (postAdForm) {
        postAdForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // FormData will collect all form fields, including the files from the input
            const formData = new FormData(postAdForm);

            console.log('--- Form Data Ready to be Sent to API ---');
            for (let [key, value] of formData.entries()) {
                // If the value is a File object, log its name. Otherwise, log the value.
                if (value instanceof File) {
                    console.log(`${key}:`, value.name);
                } else {
                    console.log(`${key}:`, value);
                }
            }

            alert('Ad submitted! Check the browser console (F12) for the form data.');

            // --- HERE IS WHERE YOU WOULD MAKE YOUR API CALL ---
            /*
            const token = localStorage.getItem("token"); // Get token for authentication

            fetch('http://localhost:8080/api/properties/add', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token
                    // NOTE: Do NOT set 'Content-Type': 'multipart/form-data'.
                    // The browser will do it automatically for FormData and set the correct boundary.
                },
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
                // Redirect to the new property's page or the dashboard
                // window.location.href = '/dashboard.html';
            })
            .catch(error => {
                console.error('Error:', error);
                // Show an error message to the user
            });
            */
        });
    }

    // --- INITIALIZE ALL FEATURES ---
    initializeMap();
    setupAutocomplete();

}); // End of DOMContentLoaded