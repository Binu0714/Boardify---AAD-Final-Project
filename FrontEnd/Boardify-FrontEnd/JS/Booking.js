document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Select all necessary elements from the page ---
    const openPopupButton = document.getElementById('request-btn');
    const closePopupButton = document.getElementById('close-popup-btn');
    const popupOverlay = document.getElementById('popup-overlay');
    const bookingForm = document.getElementById('booking-request-form');
    const requestDateField = document.getElementById('request-date');

    // --- 2. Define functions for modal actions ---

    /** Opens the modal and auto-fills the date. */
    const openModal = () => {
        // Auto-fill the date in a readable format.
        const today = new Date();
        requestDateField.value = today.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        // Add 'active' class to trigger the CSS fade-in animation.
        popupOverlay.classList.add('active');
    };

    /** Closes the modal. */
    const closeModal = () => {
        // Remove 'active' class to trigger the CSS fade-out animation.
        popupOverlay.classList.remove('active');
    };

    /** Handles the form submission. */
    const handleFormSubmit = (event) => {
        // Prevent the page from reloading.
        event.preventDefault();

        // Gather form data into an object.
        const bookingData = {
            name: document.getElementById('requester-name').value,
            mobile: document.getElementById('requester-mobile').value,
            email: document.getElementById('requester-email').value,
            message: document.getElementById('requester-message').value,
            requestDate: new Date().toISOString()
        };

        console.log('Form Submitted. Data to send:', bookingData);

        // TODO: Add your AJAX call here to send 'bookingData' to your backend.

        alert('Request sent successfully!');
        closeModal();
    };


    // --- 3. Attach Event Listeners ---
    // Safety check to ensure the script doesn't crash on pages without these elements.
    if (openPopupButton && closePopupButton && popupOverlay && bookingForm) {

        openPopupButton.addEventListener('click', openModal);
        closePopupButton.addEventListener('click', closeModal);
        bookingForm.addEventListener('submit', handleFormSubmit);

        // Add listener to close the modal by clicking the background.
        popupOverlay.addEventListener('click', (event) => {
            if (event.target === popupOverlay) {
                closeModal();
            }
        });
    }
});