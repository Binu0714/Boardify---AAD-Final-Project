$(document).ready(function() {
    loadAddDetails();
});

function loadAddDetails() {
    const token = localStorage.getItem("token");

    if (!token || token === "undefined") {
        window.location.href = "LogIn.html";
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    console.log("adId:", id);

    if (!id || id === "undefined") {
        alert("Property ID not found!");
        window.location.href = "AllAds.html";
        return;
    }

    $.ajax({
        url: `http://localhost:8080/property/getPropertyById/${id}`,
        method: "GET",
        success: function (res) {
            console.log("Property details:", res);
            if (res.status === 200 && res.data) {
                const property = res.data;
                populatePropertyDetails(property);
                loadPropertyImages(property.photoUrls);
                populateSidebarDetails(res.data);
                loadMap(property);
            } else {
                alert("Property not found!");
            }
        },
        error: function (err) {
            console.error("Error fetching property:", err);
        }
    });
}

function populatePropertyDetails(property) {
    $("#ad-title").text(property.title);
    $("#breadcrumb-ad-title").text(property.title);
    $("#ad-location").text(property.city + ", " + property.district);
    $("#ad-type").text(property.propertyType);
    $("#ad-listed-for").text(property.listedFor);
    $("#ad-beds").text(property.noOfBeds);
    $("#ad-baths").text(property.noOfBaths);
    $("#ad-description").text(property.description);
    $("#ad-full-address").text(property.address);

    const amenityMap = {
        1: { name: "Wi-Fi", icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 18c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-5c2.21 0 4 1.79 4 4h2c0-3.31-2.69-6-6-6s-6 2.69-6 6h2c0-2.21 1.79-4 4-4zm0-5c4.42 0 8 3.58 8 8h2c0-5.52-4.48-10-10-10S2 10.48 2 16h2c0-4.42 3.58-8 8-8z"/></svg>' },
        2: { name: "Parking", icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 6v12h-2v-4H8v4H6V6h12zm-6 6h2v4h-2v-4zm0-6H8v4h4V6z"/></svg>' },
        3: { name: "Furnished", icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 21h16v-2H4v2zm0-4h16V7H4v10zm2-8h4v6H6V9z"/></svg>' },
        4: { name: "Bills Included", icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm4 0h2v-2H7v2zm4 0h8v-2h-8v2zm0 4h8v-2h-8v2zm-4 0h2v-2H7v2zm-4 0h2v-2H3v2z"/></svg>' },
        5: { name: "A/C", icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 22h12v-2H6v2zm0-8h12v-6H6v6z"/></svg>' },
        6: { name: "Attached Bathroom", icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 21h10V7H7v14zm2-12h6v10H9V9z"/></svg>' },
        7: { name: "Washing Machine", icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10v2H7V2zm-2 4h14v16H5V6zm7 2a5 5 0 100 10 5 5 0 000-10z"/></svg>' },
        8: { name: "Separate Entrance", icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 22h16V2H4v20zm2-18h12v16H6V4zm6 2a2 2 0 110 4 2 2 0 010-4z"/></svg>' },
        9: { name: "Hot Water", icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 00-7 7h2a5 5 0 1110 0h2a7 7 0 00-7-7zm0 10a3 3 0 100-6 3 3 0 000 6z"/></svg>' },
        10:{ name: "Kitchen Access", icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v2H4V4zm0 4h16v12H4V8zm2 2v8h12v-8H6z"/></svg>' },
        11:{ name: "CCTV", icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6zm10-5v4h-2v-4h2zm-20 0v4H0v-4h2zm10-9v2h-2V1h2zm0 20v2h-2v-2h2z"/></svg>' },
        12:{ name: "Meals Provided", icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 15h2v2h-2v-2zm0-10h2v8h-2V7z"/></svg>' },
    };


    const amenitiesContainer = $("#ad-amenities");
    amenitiesContainer.empty();

    if (property.amenityIds && property.amenityIds.length > 0) {
        property.amenityIds.forEach(id => {
            if (amenityMap[id]) {
                const html = `<div class="amenity-item">${amenityMap[id].icon}<span>${amenityMap[id].name}</span></div>`;
                amenitiesContainer.append(html);
            }
        });
    }
}

function loadPropertyImages(photoUrls) {
    const mainImage = $("#main-ad-image");
    const thumbnailContainer = $("#thumbnail-container");
    thumbnailContainer.empty();

    if (photoUrls && photoUrls.length > 0) {
        mainImage.attr("src", photoUrls[0]);

        photoUrls.forEach((url, index) => {
            const thumb = $(`<img src="${url}" class="thumbnail ${index === 0 ? 'active' : ''}" alt="Image ${index+1}">`);
            thumb.on("click", function() {
                mainImage.attr("src", url); // Change main image on click
                $(".thumbnail").removeClass("active");
                $(this).addClass("active");
            });
            thumbnailContainer.append(thumb);
        });
    } else {
        mainImage.attr("src", "https://dummyimage.com/1200x800/cccccc/000000&text=No+Image");
    }
}

function populateSidebarDetails(property) {
    $("#ad-price").text("Rs. " + property.price.toLocaleString());
    if(property.availability) {
        $("#ad-availability").text("Available");
    } else {
        $("#ad-availability").text("Booked");
    }


    if (property.ownerName) {
        $("#owner-name").text(property.ownerName);
    } else {
        $("#owner-name").text("Unknown");
    }

    if (property.ownerContact) {
        $("#owner-contact").text(property.ownerContact);
    } else {
        $("#owner-contact").text("Not Provided");
    }

    const loggedInUsername = localStorage.getItem("username");

    const requestButton = $("#request-btn");

    if (loggedInUsername && property.ownerName === loggedInUsername) {
        requestButton.text("This is Your Ad");
        requestButton.prop("disabled", true);
        requestButton.addClass("btn-disabled");
    }else {
        $(document).trigger('bookingButtonReady');
    }
}

function loadMap(property) {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || typeof L === 'undefined') {
        console.error("Map container not found or Leaflet library is missing.");
        return;
    }

    const lat = property.latitude;
    const lng = property.longitude;

    if (!lat || !lng) {
        mapContainer.innerHTML = "<p>Map location is not available for this property.</p>";
        return;
    }

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapContainer).setView([lat, lng], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    L.marker([lat, lng]).addTo(map);

    setTimeout(() => { map.invalidateSize() }, 100);
}








