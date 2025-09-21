$(document).ready(function() {
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

    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "Login.html";
        return;
    }

    fetchAndRenderPendingAds();
});

/**
 * Fetches unverified ads from the API and renders them as clickable cards.
 */
function fetchAndRenderPendingAds() {
    const gridContainer = $('#pending-ads-grid');

    $.ajax({
        url: "http://localhost:8080/property/unverified",
        method: "GET",
        headers: { 'Authorization': `Bearer ${localStorage.getItem("token")}` },
        success: function(res) {
            gridContainer.empty();
            if (res.status === 200 && res.data && res.data.length > 0) {
                res.data.forEach(property => {
                    // Create the standard ad card using the helper function.
                    const adCard = createAdCard(property);
                    // Add the card directly to the grid.
                    gridContainer.append(adCard);
                });
            } else {
                gridContainer.html('<p class="no-results-message">No listings are currently pending approval.</p>');
            }
        },
        error: function(err) {
            gridContainer.html('<p class="error-message">Could not load pending listings.</p>');
        }
    });
}


function createAdCard(p) {
    const amenityMap = { 1: "Wi-Fi", 2: "Parking", 3: "Furnished", 4: "Bills Included", 5: "A/C", 6: "Attached Bathroom", 7: "Washing Machine", 8: "Separate Entrance", 9: "Hot Water", 10: "Kitchen Access", 11: "CCTV", 12: "Meals Provided" };
    const amenities = (p.amenityIds || []).slice(0, 2).map(id => `<span class="feature-tag">${amenityMap[id] || ""}</span>`).join(" ");
    const coverImage = (p.photoUrls && p.photoUrls.length > 0) ? p.photoUrls[0] : "https://dummyimage.com/400x250/cccccc/000000&text=No+Image";

    const card = $(`
        <div class="ad-card" data-id="${p.id}" style="cursor: pointer;">
            <div class="ad-image">
                <img src="${coverImage}" alt="${p.title}" class="ad-cover" />
                <div class="ad-badge unverified">Unverified</div>
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

    // --- This is the key change: the entire card is now a link ---
    card.on("click", function () {
        const propertyId = $(this).data("id");
        // Navigate to the admin detail view page, passing the ID in the URL.
        window.location.href = `AdminViewAdd.html?id=${propertyId}`;
    });

    return card;
}