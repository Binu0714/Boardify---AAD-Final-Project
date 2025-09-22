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


    setupImagePreviews();
    setupMapAndLocation();
    setupFormSubmission();
});

const LOCATIONIQ_API_KEY = "pk.96f2728aa09caeeee3fc53d7d44d1ab5";
let map;
let marker;
const initialPosition = [7.8731, 80.7718];

// image upload

function setupImagePreviews() {
    const imageUploadInput = document.getElementById('image-upload-input');
    const previewContainer = document.getElementById('image-preview-container');
    const uploadBox = document.getElementById('image-upload-box');
    const MAX_IMAGES = 10;
    let selectedFiles = [];

    if (!imageUploadInput) return;

    imageUploadInput.addEventListener('change', (e) => {
        const newFiles = Array.from(e.target.files);
        selectedFiles = [...selectedFiles, ...newFiles].slice(0, MAX_IMAGES);
        updateFileInput();
        renderPreviews();
    });

    function renderPreviews() {
        if (!previewContainer) return;
        previewContainer.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.classList.add('image-preview-item');
                previewItem.innerHTML = `<img src="${e.target.result}" alt="Preview ${index + 1}"><button type="button" class="remove-image-btn" data-index="${index}">&times;</button>`;
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
                removeImage(parseInt(e.target.dataset.index, 10));
            }
        });
    }
}

//map implementation
function setupMapAndLocation() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || typeof L === 'undefined') return;

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
        updateMapAndFields(event.target.getLatLng().lat, event.target.getLatLng().lng);
    });

    const cityInput = document.getElementById('ad-city');
    const districtInput = document.getElementById('ad-district');
    const addressInput = document.getElementById('ad-address');
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            geocodeAddress();
        }
    };
    if (cityInput) cityInput.addEventListener('keydown', handleKeyPress);
    if (districtInput) districtInput.addEventListener('keydown', handleKeyPress);
    if (addressInput) addressInput.addEventListener('keydown', handleKeyPress);
}

function updateMapAndFields(lat, lng, zoomLevel = 17) {
    if (!map || !marker) return;
    const newLatLng = new L.LatLng(lat, lng);
    marker.setLatLng(newLatLng);
    map.setView(newLatLng, zoomLevel);
    document.getElementById('latitude').value = lat;
    document.getElementById('longitude').value = lng;
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

// create an add

function setupFormSubmission() {
    const postAdForm = $('#post-ad-form');
    if (!postAdForm.length) return;

    postAdForm.on('submit', function(event) {
        event.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire('Authentication Error', 'You must be logged in.', 'error');
            return;
        }

        // Collect property data
        const propertyData = {
            title: $('#ad-title').val(),
            description: $('#ad-description').val(),
            nearestCampus: $('#ad-uni').val(),
            city: $('#ad-city').val(),
            district: $('#ad-district').val(),
            address: $('#ad-address').val(),
            propertyType: $('#ad-property-type').val(),
            listedFor: $('#ad-listed-for').val(),
            noOfBeds: parseInt($('#ad-bedrooms').val()) || 0,
            noOfBaths: parseInt($('#ad-bathrooms').val()) || 0,
            price: parseFloat($('#ad-price').val()) || 0,
            latitude: parseFloat($('#latitude').val()),
            longitude: parseFloat($('#longitude').val()),
            amenityIds: $('input[name="amenities"]:checked').map(function() {
                return parseInt($(this).val()); // Must be numbers (DB IDs)
            }).get()
        };

        // FormData for multipart request
        const formData = new FormData();
        formData.append('propertyData', new Blob([JSON.stringify(propertyData)], { type: "application/json" }));

        // Append images
        const imageFiles = $('#image-upload-input')[0].files;
        for (let i = 0; i < imageFiles.length; i++) {
            formData.append('image', imageFiles[i]);
        }

        if (imageFiles.length === 0) {
            Swal.fire('Error', 'Please upload at least one image.', 'error');
            return;
        }

        Swal.fire({
            title: 'Submitting...',
            text: 'Please wait.',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        $.ajax({
            url: 'http://localhost:8080/property/create',
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            data: formData,
            processData: false,
            contentType: false,

            success: function(response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Submitted for Approval!',
                    text: 'Your property has been sent to our admin team for review. You will be notified once it is approved.',
                    confirmButtonText: 'Great, Thanks!'
                }).then(() => {
                    window.location.href = 'AllAds.html';
                });
            },

            error: function(jqXHR) {
                const errorMessage = jqXHR.responseJSON?.message || 'Something went wrong.';
                Swal.fire('Error', errorMessage, 'error');
            }
        });
    });
}

