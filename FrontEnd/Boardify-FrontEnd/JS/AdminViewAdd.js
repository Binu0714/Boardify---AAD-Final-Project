$(document).ready(function() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "Login.html";
        return;
    }

    // 1. Get the Property ID from the URL query string.
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');

    if (!propertyId) {
        Swal.fire('Error', 'No property ID was provided in the URL.', 'error').then(() => {
            window.location.href = 'Listings.html'; // Go back to the list
        });
        return;
    }

    // 2. Fetch the specific ad's details and populate the page.
    fetchPropertyDetails(propertyId);

    $('#approve-btn').on('click', function() {
        handleApproval(propertyId);
    });

    $('#reject-btn').on('click', function() {
        handleRejection(propertyId);
    });
});


function fetchPropertyDetails(propertyId) {
    $.ajax({
        url: `http://localhost:8080/property/getPropertyById/${propertyId}`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` },
        success: function(res) {
            if (res.status === 200 && res.data) {
                populatePage(res.data);
            } else {
                Swal.fire('Error', res.message || 'Could not find property details.', 'error');
            }
        },
        error: function() {
            Swal.fire('Error', 'Failed to fetch property details from the server.', 'error');
        }
    });
}

function populatePage(p) {
    // Breadcrumbs and Titles
    $('#breadcrumb-ad-title').text(p.title);
    $('#ad-title').text(p.title);
    $('#ad-location').text(`${p.city}, ${p.district}`);

    // Image Gallery
    if (p.photoUrls && p.photoUrls.length > 0) {
        $('#main-ad-image').attr('src', p.photoUrls[0]);
        const thumbnailContainer = $('#thumbnail-container');
        thumbnailContainer.empty();
        p.photoUrls.forEach(url => {
            thumbnailContainer.append(`<img src="${url}" alt="Thumbnail" class="thumbnail">`);
        });
    }

    // Property Details
    $('#ad-type').text(p.propertyType);
    $('#ad-listed-for').text(p.listedFor);
    $('#ad-beds').text(p.noOfBeds);
    $('#ad-baths').text(p.noOfBaths);

    // Description and Address
    $('#ad-description').text(p.description);
    $('#ad-full-address').text(p.address);

    // Sidebar
    $('#ad-price').text(`Rs. ${p.price.toLocaleString()}`);
    $('#owner-name').text(p.ownerName);
    $('#owner-contact').text(p.ownerContact);

    // (Optional but recommended) Initialize map with location
    // if (p.latitude && p.longitude) { initMap(p.latitude, p.longitude); }
}


function handleApproval(propertyId) {
    Swal.fire({
        title: 'Approve this listing?',
        text: "It will become visible to all users.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        confirmButtonText: 'Yes, approve it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:8080/property/approve/${propertyId}`,
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` },
                success: function() {
                    Swal.fire('Approved!', 'The property is now live.', 'success').then(() => {
                        window.location.href = 'Listings.html'; // Redirect back to the list
                    });
                },
                error: function() {
                    Swal.fire('Error!', 'Could not approve the property.', 'error');
                }
            });
        }
    });
}

function handleRejection(propertyId) {
    Swal.fire({
        title: 'Reject this listing?',
        text: "This will permanently delete the property.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Yes, reject it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:8080/property/reject/${propertyId}`,
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` },
                success: function() {
                    Swal.fire('Rejected!', 'The property has been deleted.', 'success').then(() => {
                        window.location.href = 'Listings.html';
                    });
                },
                error: function() {
                    Swal.fire('Error!', 'Could not reject the property.', 'error');
                }
            });
        }
    });
}