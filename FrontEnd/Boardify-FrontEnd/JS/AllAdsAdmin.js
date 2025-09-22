const allCities = new Set();
const allCampuses = new Set();
const allTypes = new Set();

let debounceTimer;

// --- Pagination globals ---
let allProperties = [];
let currentPage = 1;
const itemsPerPage = 8;

$(document).ready(function () {

    function validateAndLoadDashboard(requiredRole) {
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

            const userRole = tokenPayload.role;

            console.log(userRole);


            if (!userRole || userRole !== requiredRole) {
                alert("Access Denied: You do not have permission to view this page.");
                // Redirect to a more appropriate page, like the user dashboard or login
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

    if (validateAndLoadDashboard('ADMIN')) {

        setInterval(validateAndLoadDashboard, 10000);

    }


    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    const profileAvatar = document.getElementById('profile-avatar');
    const profileDropdown = document.getElementById('profile-dropdown');
    if (profileAvatar) {
        profileAvatar.addEventListener('click', (event) => {
            event.stopPropagation();
            profileDropdown.classList.toggle('active');
        });
    }

    document.addEventListener('click', (event) => {
        if (profileDropdown && !profileDropdown.contains(event.target) && !profileAvatar.contains(event.target)) {
            profileDropdown.classList.remove('active');
        }
    });

    loadInitialDataAndSetup();

    $('#main-search-input').on('keyup', function () {
        const keyword = $(this).val();
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            performSearch(keyword);
            updateSuggestions(keyword);
        }, 300);
    });

    $('#main-search-button').on('click', function () {
        const keyword = $('#main-search-input').val();
        performSearch(keyword);
        $('#suggestions-container').hide();
    });

    $(document).on('click', function(e) {
        if (!$(e.target).closest('.search-bar').length) {
            $('#suggestions-container').hide();
        }
    });

    // --- Pagination click handling ---
    $(document).on("click", ".page-link", function (e) {
        e.preventDefault();
        const page = parseInt($(this).data("page"));
        if (!isNaN(page) && page >= 1 && page <= Math.ceil(allProperties.length / itemsPerPage)) {
            renderAds(allProperties, page);
        }
    });
});

function loadInitialDataAndSetup() {
    $.ajax({
        url: "http://localhost:8080/property/AllAds",
        method: "GET",
        success: function (res) {
            if (res.status === 200 && res.data) {
                renderAds(res.data);
                res.data.forEach(p => {
                    if (p.city) allCities.add(p.city);
                    if (p.nearestCampus) allCampuses.add(p.nearestCampus);
                    if (p.propertyType) allTypes.add(p.propertyType);
                });
            }
        },
        error: function (err) {
            console.error("Error fetching initial properties:", err);
            $('#ads-grid-container').html('<p class="error-message">Could not load properties.</p>');
        }
    });
}

function performSearch(keyword) {
    const searchUrl = (keyword && keyword.trim() !== '')
        ? `http://localhost:8080/property/search?keyword=${encodeURIComponent(keyword)}`
        : "http://localhost:8080/property/getAllProperties";

    $.ajax({
        url: searchUrl,
        method: "GET",
        success: function (res) {
            if (res.status === 200 && res.data) {
                renderAds(res.data);
            }
        },
        error: function (err) {
            console.error("Error during search:", err);
        }
    });
}

function updateSuggestions(keyword) {
    const suggestionsContainer = $('#suggestions-container');
    if (!keyword || keyword.trim() === '') {
        suggestionsContainer.empty().hide();
        return;
    }
    suggestionsContainer.empty().show();
    const lowerCaseKeyword = keyword.toLowerCase();
    const citySuggestions = [...allCities].filter(c => c.toLowerCase().includes(lowerCaseKeyword));
    const campusSuggestions = [...allCampuses].filter(c => c.toLowerCase().includes(lowerCaseKeyword));
    const typeSuggestions = [...allTypes].filter(t => t.toLowerCase().includes(lowerCaseKeyword));

    const addSuggestion = (value, type) => {
        const suggestionItem = $(`<div class="suggestion-item"><b>${value}</b> in ${type}</div>`);
        suggestionItem.on('click', function() {
            $('#main-search-input').val(value);
            performSearch(value);
            suggestionsContainer.hide();
        });
        suggestionsContainer.append(suggestionItem);
    };

    citySuggestions.forEach(value => addSuggestion(value, 'City'));
    campusSuggestions.forEach(value => addSuggestion(value, 'University'));
    typeSuggestions.forEach(value => addSuggestion(value, 'Type'));

    if (suggestionsContainer.children().length === 0) {
        suggestionsContainer.hide();
    }
}

// --- Updated renderAds with pagination ---
function renderAds(properties, page = 1) {
    allProperties = properties;
    currentPage = page;

    const container = $("#ads-grid-container");
    container.empty();

    if (properties.length === 0) {
        container.html('<p class="no-results-message">No properties found matching your criteria.</p>');
        $("#pagination-container").empty();
        return;
    }

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = properties.slice(start, end);

    paginatedItems.forEach(p => {
        const card = createAdCard(p);

        // 🔴 attach delete on card click
        card.on("click", function () {
            handleDeleteProperty(p.id, p.title, card);
        });

        container.append(card);
    });

    renderPagination(properties.length, page);
}

// --- Pagination rendering ---
function renderPagination(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = $("#pagination-container");
    paginationContainer.empty();

    if (totalPages <= 1) return;

    const prevClass = currentPage === 1 ? "disabled" : "";
    paginationContainer.append(`<a href="#" class="page-link ${prevClass}" data-page="${currentPage - 1}">Previous</a>`);

    for (let i = 1; i <= totalPages; i++) {
        const activeClass = currentPage === i ? "active" : "";
        paginationContainer.append(`<a href="#" class="page-link ${activeClass}" data-page="${i}">${i}</a>`);
    }

    const nextClass = currentPage === totalPages ? "disabled" : "";
    paginationContainer.append(`<a href="#" class="page-link ${nextClass}" data-page="${currentPage + 1}">Next</a>`);
}

// --- Card creator ---
function createAdCard(p) {
    const amenityMap = {
        1: "Wi-Fi", 2: "Parking", 3: "Furnished", 4: "Bills Included", 5: "A/C",
        6: "Attached Bathroom", 7: "Washing Machine", 8: "Separate Entrance",
        9: "Hot Water", 10: "Kitchen Access", 11: "CCTV", 12: "Meals Provided"
    };
    const amenities = (p.amenityIds || []).slice(0, 2).map(id => `<span class="feature-tag">${amenityMap[id] || ""}</span>`).join(" ");
    const coverImage = (p.photoUrls && p.photoUrls.length > 0) ? p.photoUrls[0] : "https://dummyimage.com/400x250/cccccc/000000&text=No+Image";
    const badgeText = p.availability ? "Available" : "Booked";

    const card = $(`
        <div class="ad-card" data-id="${p.id}">
            <div class="ad-image">
                <img src="${coverImage}" alt="${p.title}" class="ad-cover" />
                <div class="ad-badge ${p.availability ? 'available' : 'booked'}">${badgeText}</div>
            </div>
            <div class="ad-content">
                <h3 class="ad-title">${p.title}</h3>
                <div class="ad-location">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    ${p.city}, ${p.district}
                </div>
                <div class="ad-stats">
                    <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 22v-6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6H2zM2 12V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6H2z"/></svg>${p.noOfBeds} Beds</span>
                    <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M7 2v10M17 2v10M2 12a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4v-2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/></svg>${p.noOfBaths} Baths</span>
                </div>
                <div class="ad-features">${amenities}</div>
                <div class="ad-footer">
                    <div class="ad-price">Rs. ${p.price}<span>/month</span></div>
                </div>
            </div>
            
        </div>
    `);

    return card;
}

function handleDeleteProperty(propertyId, propertyTitle, cardElement) {
    Swal.fire({
        title: 'Are you sure?',
        html: `You are about to permanently delete:<br><b>"${propertyTitle}"</b>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:8080/property/delete/${propertyId}`,
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` },
                success: function() {
                    Swal.fire('Deleted!', `"${propertyTitle}" has been removed.`, 'success');
                    cardElement.fadeOut(500, function() {
                        $(this).remove();
                    });
                },
                error: function(err) {
                    const errorMsg = err.responseJSON?.message || 'Could not delete the property.';
                    Swal.fire('Error!', errorMsg, 'error');
                }
            });
        }
    });
}
