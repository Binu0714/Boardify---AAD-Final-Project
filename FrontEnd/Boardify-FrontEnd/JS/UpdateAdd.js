$(document).ready(function() {

    function validateAndLoadDashboard() {
        let token = localStorage.getItem('token');

        if (!token) {

            window.location.href = "Login.html";
            return false;

        }

        const tokenParts = token.split('.');

        if (tokenParts.length !== 3) {
            window.location.href = "Login.html";
            return false;
        }

        try {
            const tokenPayload = JSON.parse(atob(tokenParts[1]));

            const currentTimestamp = Math.floor(Date.now() / 1000);
            // console.log("Current timestamp:", currentTimestamp);
            // console.log("Token expiration timestamp:", tokenPayload.exp);

            if (tokenPayload.exp && currentTimestamp >= tokenPayload.exp) {
                alert('Session expired. Please login again.');
                localStorage.removeItem('authToken');
                window.location.href = "Login.html";
                return false;
            }


        } catch (error) {

            console.error('Invalid token:', error);
            window.location.href = "Login.html";
            return false;

        }

        return true;

    }

    if (validateAndLoadDashboard()) {

        setInterval(validateAndLoadDashboard, 10000);

    }


    initializeApp();
});

const LOCATIONIQ_API_KEY = "pk.96f2728aa09caeeee3fc53d7d44d1ab5";
let map;
let marker;
let existingPhotoUrls = []; // To keep track of photos already saved from the database
let newFiles = [];        // To keep track of NEW files added by the user in this session


function initializeApp() {
    const propertyId = getPropertyIdFromUrl();
    if (!propertyId) {
        Swal.fire('Error', 'No property ID found in URL. Redirecting to your ads.', 'error')
            .then(() => window.location.href = 'MyAds.html');
        return;
    }

    loadPropertyData(propertyId);
    setupImagePreviews();
    setupFormSubmission(propertyId);
}

function getPropertyIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function loadPropertyData(propertyId) {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "LogIn.html";
        return;
    }

    $.ajax({
        url: `http://localhost:8080/property/getPropertyById/${propertyId}`,
        method: "GET",
        headers: { 'Authorization': 'Bearer ' + token },
        success: function(response) {
            if (response.status === 200 && response.data) {
                const property = response.data;
                populateForm(property);
            } else {
                Swal.fire('Error', 'Property data could not be found.', 'error');
            }
        },
        error: function(err) {
            console.error("Error fetching property:", err);
            Swal.fire('Error', 'Could not load property data from the server.', 'error');
        }
    });
}

function populateForm(property) {
    $('#ad-title').val(property.title);
    $('#ad-description').val(property.description);
    $('#ad-price').val(property.price);
    $('#ad-uni').val(property.nearestCampus || "");
    $('#ad-property-type').val(property.propertyType);
    $('#ad-listed-for').val(property.listedFor);
    $('#ad-bedrooms').val(property.noOfBeds);
    $('#ad-bathrooms').val(property.noOfBaths);

    $('#ad-city').val(property.city);
    $('#ad-district').val(property.district);
    $('#ad-address').val(property.address);
    $('#latitude').val(property.latitude);
    $('#longitude').val(property.longitude);

    if (property.availability) {
        $('#status-available').prop('checked', true);
    } else {
        $('#status-booked').prop('checked', true);
    }

    if (property.amenityIds && property.amenityIds.length > 0) {
        property.amenityIds.forEach(id => {
            $(`input[name="amenities"][value="${id}"]`).prop('checked', true);
        });
    }

    if (property.photoUrls && property.photoUrls.length > 0) {
        existingPhotoUrls = property.photoUrls;
        renderPreviews();
    }
    setupMapAndLocation(property.latitude, property.longitude);
}

function setupImagePreviews() {
    const imageUploadInput = document.getElementById('image-upload-input');
    const previewContainer = document.getElementById('image-preview-container');
    const uploadBox = document.getElementById('image-upload-box');
    const MAX_IMAGES = 10;

    if (!imageUploadInput) return;

    imageUploadInput.addEventListener('change', (e) => {
        const addedFiles = Array.from(e.target.files);
        newFiles = [...newFiles, ...addedFiles];
        renderPreviews();
    });

    window.renderPreviews = function() {
        if (!previewContainer) return;
        previewContainer.innerHTML = '';

        const allImages = [...existingPhotoUrls, ...newFiles];
        const displayImages = allImages.slice(0, MAX_IMAGES);

        displayImages.forEach((item, index) => {
            const previewItem = document.createElement('div');
            previewItem.classList.add('image-preview-item');

            const src = (typeof item === 'string') ? item : URL.createObjectURL(item);

            previewItem.innerHTML = `<img src="${src}" alt="Preview ${index + 1}"><button type="button" class="remove-image-btn" data-index="${index}">&times;</button>`;
            previewContainer.appendChild(previewItem);
        });

        if (uploadBox) {
            uploadBox.style.display = displayImages.length >= MAX_IMAGES ? 'none' : 'flex';
        }
    }

    if (previewContainer) {
        previewContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-image-btn')) {
                const indexToRemove = parseInt(e.target.dataset.index, 10);

                if (indexToRemove < existingPhotoUrls.length) {
                    existingPhotoUrls.splice(indexToRemove, 1);
                } else {
                    const newFileIndex = indexToRemove - existingPhotoUrls.length;
                    newFiles.splice(newFileIndex, 1);
                }
                renderPreviews();
            }
        });
    }
}

function setupMapAndLocation(lat, lng) {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || typeof L === 'undefined') return;

    if (map) { map.remove(); }

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    map = L.map(mapContainer).setView([lat, lng], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
    marker = L.marker([lat, lng], { draggable: true }).addTo(map);

    marker.on('dragend', (event) => {
        const position = event.target.getLatLng();
        updateMapAndFields(position.lat, position.lng);
    });

    const addressInput = document.getElementById('ad-address');
    if (addressInput) {
        addressInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                geocodeAddress();
            }
        });
    }
}

function updateMapAndFields(lat, lng, zoomLevel = 17) {
    if (!map || !marker) return;
    const newLatLng = new L.LatLng(lat, lng);
    marker.setLatLng(newLatLng);
    map.setView(newLatLng, zoomLevel);
    $('#latitude').val(lat);
    $('#longitude').val(lng);
}

function geocodeAddress() {
    const address = $('#ad-address').val();
    const city = $('#ad-city').val();
    const district = $('#ad-district').val();
    if (!city || !district || !address) return;
    const fullAddress = `${address}, ${city}, ${district}, Sri Lanka`;

    fetch(`https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(fullAddress)}&format=json&countrycodes=lk&limit=1`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                updateMapAndFields(data[0].lat, data[0].lon);
            } else {
                Swal.fire('Location Not Found', 'Please check the address details.', 'error');
            }
        })
        .catch(error => console.error("Geocoding Error:", error));
}

// update add

function setupFormSubmission(propertyId) {
    $('#post-ad-form').on('submit', function (e) {
        e.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "LogIn.html";
            return;
        }

        console.log("Property ID:", propertyId);
        console.log(token);

        const propertyData = {
            id: propertyId,
            title: $('#ad-title').val(),
            description: $('#ad-description').val(),
            price: $('#ad-price').val(),
            propertyType: $('#ad-property-type').val(),
            listedFor: $('#ad-listed-for').val(),
            noOfBeds: parseInt($('#ad-bedrooms').val()),
            noOfBaths: parseInt($('#ad-bathrooms').val()),
            nearestCampus: $('#ad-uni').val(),
            availability: $('input[name="availability"]:checked').val() === 'true',
            city: $('#ad-city').val(),
            district: $('#ad-district').val(),
            address: $('#ad-address').val(),
            latitude: $('#latitude').val(),
            longitude: $('#longitude').val(),
            amenityIds: $('input[name="amenities"]:checked').map(function() {
                return parseInt($(this).val());
            }).get(),
            photoUrls: existingPhotoUrls
        };

        const formData = new FormData();
        formData.append('propertyData', new Blob([JSON.stringify(propertyData)], { type: "application/json" }));

        newFiles.forEach(file => {
            formData.append('image', file);
        });

        Swal.fire({ title: 'Updating...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        $.ajax({
            url: `http://localhost:8080/property/update/${propertyId}`,
            method: "PUT",
            headers: { 'Authorization': 'Bearer ' + token },
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
                Swal.fire('Success!', 'Property updated successfully!', 'success')
                    .then(() => window.location.href = 'MyAdds.html');
            },
            error: function (err) {
                Swal.fire('Error', 'Failed to update property.', 'error');
            }
        });
    });
}