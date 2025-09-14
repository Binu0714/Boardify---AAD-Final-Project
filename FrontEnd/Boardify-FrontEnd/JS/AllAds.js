$(document).ready(function () {
    loadPosts();
});

function loadPosts() {
    $.ajax({
        url: "http://localhost:8080/property/getAllProperties", // your API endpoint
        method: "GET",
        success: function (res) {
            console.log("API response:", res);

            if (res.status === 200 && res.data) {
                const container = $("#ads-grid-container");
                container.empty();

                // Map of amenity IDs to names
                const amenityMap = {
                    1: "Wi-Fi",
                    2: "Parking",
                    3: "Furnished",
                    4: "Bills Included",
                    5: "A/C",
                    6: "Attached Bathroom",
                    7: "Washing Machine",
                    8: "Separate Entrance",
                    9: "Hot Water",
                    10: "Kitchen Access",
                    11: "CCTV",
                    12: "Meals Provided"
                };

                res.data.forEach(p => {
                    // Limit to 3 amenities
                    const amenities = (p.amenityIds || [])
                        .slice(0, 2)
                        .map(id => `<span class="feature-tag">${amenityMap[id] || "Amenity"}</span>`)
                        .join(" ");

                    // First image as cover
                    const coverImage = (p.photoUrls && p.photoUrls.length > 0)
                        ? p.photoUrls[0]
                        : "https://dummyimage.com/400x250/cccccc/000000&text=No+Image";


                    // Availability badge
                    const badgeText = p.availability ? "Available" : "Booked";

                    // Build ad card
                    const card = `
                        <div class="ad-card">
                            <div class="ad-image">
                                <img src="${coverImage}" alt="${p.title}" class="ad-cover" />
                                <div class="ad-badge ${p.availability ? "available" : "booked"}">
                                    ${badgeText}
                                </div>
                                <div class="ad-favorite">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                </div>
                            </div>
                            <div class="ad-content">
                                <h3 class="ad-title">${p.title}</h3>
                                <div class="ad-location">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    ${p.city}, ${p.district}
                                </div>
                                <div class="ad-stats">
                                    <span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M2 22v-6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6H2zM2 12V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6H2z"/>
                                        </svg>${p.noOfBeds} Beds
                                    </span>
                                    <span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M2 12h20M7 2v10M17 2v10M2 12a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4v-2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
                                        </svg>${p.noOfBaths} Baths
                                    </span>
                                </div>
                                <div class="ad-features">${amenities}</div>
                                <div class="ad-footer">
                                    <div class="ad-price">Rs. ${p.price}<span>/month</span></div>
                                    <div class="ad-posted">Just now</div>
                                </div>
                            </div>
                        </div>
                    `;

                    container.append(card);
                });
            }
        },
        error: function (err) {
            console.error("Error fetching properties:", err);
        }
    });
}
