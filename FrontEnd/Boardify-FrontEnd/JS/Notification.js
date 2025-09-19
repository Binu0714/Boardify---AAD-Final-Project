// This script runs once the entire HTML document is loaded.
document.addEventListener('DOMContentLoaded', () => {

    // --- Select all necessary elements for the tab functionality ---
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    // Safety check
    if (tabLinks.length === 0) {
        return;
    }

    // --- Add a click event listener to each tab button ---
    tabLinks.forEach(tab => {
        tab.addEventListener('click', () => {

            // 1. Get the target tab's ID from the button's data-attribute
            const targetTabId = tab.dataset.tab;
            const targetTabContent = document.getElementById(targetTabId);

            // 2. Remove the 'active' class from all tab links and content panels
            tabLinks.forEach(link => link.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // 3. Add the 'active' class to the clicked tab and its corresponding content panel
            tab.classList.add('active');
            if (targetTabContent) {
                targetTabContent.classList.add('active');
            }
        });
    });


    // --- TODO: DYNAMICALLY LOAD NOTIFICATIONS ---
    // In a real application, you would now have two separate AJAX calls.
    // One to fetch "Booking Requests" and populate the '#booking-requests' div.
    // Another to fetch "My Inquiries" and populate the '#my-inquiries' div.
    // You would then show the "empty-notification-message" in any tab that has zero results.

});