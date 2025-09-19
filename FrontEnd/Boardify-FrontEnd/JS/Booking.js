// This is the new, updated Booking.js

// --- 1. Wrap ALL of your existing code in a new listener ---
// This code will now ONLY run after 'ViewAd.js' makes its announcement.
$(document).on('bookingButtonReady', () => {

    console.log("Booking.js has received the 'bookingButtonReady' signal and is now running.");

    // --- 2. All of your original Booking.js code goes inside here ---
    const openPopupButton = document.getElementById('request-btn');
    const closePopupButton = document.getElementById('close-popup-btn');
    const popupOverlay = document.getElementById('popup-overlay');
    const bookingForm = document.getElementById('booking-request-form');
    const nameField = document.getElementById('requester-name');
    const requestDateField = document.getElementById('request-date');

    let elementThatOpenedModal = null;

    const openModal = () => {
        elementThatOpenedModal = document.activeElement;
        if (nameField) nameField.value = localStorage.getItem('username') || 'Guest';
        if (requestDateField) {
            const today = new Date();
            requestDateField.value = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }
        popupOverlay.classList.add('active');
        requestAnimationFrame(() => { closePopupButton.focus(); });
    };

    const closeModal = () => {
        popupOverlay.classList.remove('active');
        if (elementThatOpenedModal) elementThatOpenedModal.focus();
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        Swal.fire({
            title: 'Confirm Your Request',
            text: "A notification will be sent to the owner. Do you want to proceed?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, send it!'
        }).then((result) => {
            if (result.isConfirmed) {
                sendRequestToServer();
            }
        });
    };

    const sendRequestToServer = () => {
        const propertyId = new URLSearchParams(window.location.search).get('id');
        if (!propertyId) {
            Swal.fire('Error', 'Could not find the property ID.', 'error');
            return;
        }
        const requestData = { propertyId: parseInt(propertyId) };

        Swal.fire({ title: 'Sending Request...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        $.ajax({
            url: 'http://localhost:8080/booking/request',
            method: 'POST',
            contentType: 'application/json',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
            data: JSON.stringify(requestData)
        }).done(function(response) {
            popupOverlay.classList.remove('active');
            Swal.fire({
                title: 'Request Sent!',
                text: 'The property owner has been notified.',
                icon: 'success'
            }).then(() => {
                if (elementThatOpenedModal) elementThatOpenedModal.focus();
            });
        }).fail(function(err) {
            const errorMessage = err.responseJSON ? err.responseJSON.message : "An unknown error occurred.";
            Swal.fire('Request Failed', errorMessage, 'error');
        });
    };

    if (openPopupButton && closePopupButton && popupOverlay && bookingForm) {
        openPopupButton.addEventListener('click', openModal);
        closePopupButton.addEventListener('click', closeModal);
        bookingForm.addEventListener('submit', handleFormSubmit);
        popupOverlay.addEventListener('click', (event) => {
            if (event.target === popupOverlay) closeModal();
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && popupOverlay.classList.contains('active')) closeModal();
        });
    }
});