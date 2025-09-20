let allMyAds = [];
let currentPage = 1;
const itemsPerPage = 4;

$(document).ready(function () {
    loadMyAds();

    // Pagination click handling
    $(document).on("click", ".page-link", function (e) {
        e.preventDefault();
        const page = parseInt($(this).data("page"));
        if (!isNaN(page) && page >= 1 && page <= Math.ceil(allMyAds.length / itemsPerPage)) {
            renderMyAds(allMyAds, page);
        }
    });
});

function loadMyAds() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "LogIn.html";
        return;
    }

    $.ajax({
        url: "http://localhost:8080/property/myAds",
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
        success: function (res) {
            console.log("API response:", res);

            if (res.status === 200 && res.data) {
                allMyAds = res.data;
                renderMyAds(allMyAds, 1); // Load first page
            }
        },
        error: function (err) {
            console.error("Error fetching properties:", err);
        }
    });
}

// --- Render ads with pagination ---
function renderMyAds(properties, page = 1) {
    allMyAds = properties;
    currentPage = page;

    const container = $("#ads-grid-container");
    container.empty();

    if (properties.length === 0) {
        container.html('<p class="no-results-message">No ads found.</p>');
        $("#pagination-container").empty();
        return;
    }

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedAds = properties.slice(start, end);

    const amenityMap = {
        1: "Wi-Fi", 2: "Parking", 3: "Furnished", 4: "Bills Included", 5: "A/C",
        6: "Attached Bathroom", 7: "Washing Machine", 8: "Separate Entrance",
        9: "Hot Water", 10: "Kitchen Access", 11: "CCTV", 12: "Meals Provided"
    };

    paginatedAds.forEach(p => {
        const amenities = (p.amenityIds || [])
            .slice(0, 2)
            .map(id => `<span class="feature-tag">${amenityMap[id] || "Amenity"}</span>`)
            .join(" ");

        const coverImage = (p.photoUrls && p.photoUrls.length > 0)
            ? p.photoUrls[0]
            : "https://dummyimage.com/400x250/cccccc/000000&text=No+Image";

        const badgeText = p.availability ? "Available" : "Booked";

        const card = $(`
            <div class="ad-card" data-id="${p.id}">
                <div class="ad-image">
                    <img src="${coverImage}" alt="${p.title}" class="ad-cover" />
                    <div class="ad-badge ${p.availability ? "available" : "booked"}">${badgeText}</div>
                </div>
                <div class="ad-content">
                    <h3 class="ad-title">${p.title}</h3>
                    <div class="ad-location">${p.city}, ${p.district}</div>
                    <div class="ad-stats">
                        <span>${p.noOfBeds} Beds</span>
                        <span>${p.noOfBaths} Baths</span>
                    </div>
                    <div class="ad-features">${amenities}</div>
                    <div class="ad-footer">
                        <div class="ad-price">Rs. ${p.price}<span>/month</span></div>
                        <div class="ad-posted">Just now</div>
                    </div>
                </div>
                <div class="my-ad-actions">
                    <a href="../Html/UpdateAdd.html?id=${p.id}" class="btn-action edit">Edit</a>
                    <a href="#" class="btn-action delete" data-id="${p.id}">Delete</a>
                </div>
            </div>
        `);

        card.find(".ad-image, .ad-title").on("click", function () {
            const id = $(this).closest(".ad-card").data("id");
            window.location.href = `viewAdd.html?id=${id}`;
        });

        card.find(".delete").on("click", function (e) {
            e.stopPropagation();
            deleteAd($(this).data("id"));
        });

        container.append(card);
    });

    renderPagination(properties.length, page);
}

// --- Render pagination controls ---
function renderPagination(totalItems, page) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = $("#pagination-container");
    paginationContainer.empty();

    if (totalPages <= 1) return;

    const prevClass = page === 1 ? "disabled" : "";
    paginationContainer.append(`<a href="#" class="page-link ${prevClass}" data-page="${page - 1}">Previous</a>`);

    for (let i = 1; i <= totalPages; i++) {
        const activeClass = page === i ? "active" : "";
        paginationContainer.append(`<a href="#" class="page-link ${activeClass}" data-page="${i}">${i}</a>`);
    }

    const nextClass = page === totalPages ? "disabled" : "";
    paginationContainer.append(`<a href="#" class="page-link ${nextClass}" data-page="${page + 1}">Next</a>`);
}

// --- Delete function remains unchanged ---
function deleteAd(adId) {
    const token = localStorage.getItem("token");

    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:8080/property/delete/${adId}`,
                method: "DELETE",
                headers: { 'Authorization': `Bearer ${token}` },
                success: function() {
                    Swal.fire('Deleted!', 'Your ad has been deleted.', 'success');
                    loadMyAds();
                },
                error: function() {
                    Swal.fire('Error deleting ad!', '', 'error');
                }
            });
        }
    });
}
