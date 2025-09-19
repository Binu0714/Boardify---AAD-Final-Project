
document.addEventListener('DOMContentLoaded', () => {

    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const requestsContainer = document.getElementById('booking-requests');

    if (!requestsContainer) {
        console.error("The main '#booking-requests' container was not found.");
        return;
    }

    if (tabLinks.length > 0) {
        tabLinks.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTabId = tab.dataset.tab;
                const targetTabContent = document.getElementById(targetTabId);
                tabLinks.forEach(link => link.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                tab.classList.add('active');
                if (targetTabContent) {
                    targetTabContent.classList.add('active');
                }
            });
        });
    }

    function loadBookingRequests() {
        const token = localStorage.getItem('token');
        if (!token) return;

        const container = document.getElementById('booking-requests');
        if (!container) return;

        $.ajax({
            url: 'http://localhost:8080/notification/unread',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
            success: function(res) {

                console.log("Data from backend:", res.data);

                container.innerHTML = '';

                if (res.status === 200 && res.data && res.data.length > 0) {
                    let count = 0;
                    res.data.forEach(notif => {
                        if (notif.message.includes("booking request")) {
                            const notifHtml = createBookingRequestHtml(notif);
                            container.insertAdjacentHTML('beforeend', notifHtml);
                            count++;
                        }
                    });
                    updateTabCount('booking-requests', count);
                    if (count === 0) {
                        container.innerHTML = '<div class="empty-notification-message"><p>No new booking requests.</p></div>';
                    }
                } else {
                    container.innerHTML = '<div class="empty-notification-message"><p>No new booking requests.</p></div>';
                    updateTabCount('booking-requests', 0);
                }
            },
            error: function(err) {
                console.error("Failed to load notifications:", err);
            }
        });
    }

    function loadMyInquiries() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No token found. User is not logged in.");
            return;
        }

        const container = document.getElementById('booking-requests');
        if (!container) {
            console.error("The container '#my-inquiries' was not found on the page.");
            return;
        }

        $.ajax({
            url: 'http://localhost:8080/notification/unread',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
            success: function(res) {
                // Clear any static example content from the container
                container.innerHTML = '';

                if (res.status === 200 && res.data && res.data.length > 0) {

                    // --- THE FIX IS HERE ---
                    // Filter the results to get ONLY inquiry status updates
                    const myInquiries = res.data.filter(notif =>
                        !notif.message.includes("sent you a booking request")
                    );

                    // Update the count in the tab button
                    updateTabCount('my-inquiries', myInquiries.length);

                    if (myInquiries.length > 0) {
                        // Loop through the filtered list and build the HTML
                        myInquiries.forEach(notif => {
                            const notifHtml = createMyInquiryHtml(notif);
                            container.insertAdjacentHTML('beforeend', notifHtml);
                        });
                    } else {
                        // Show a message if there are no inquiry updates
                        container.innerHTML = '<div class="empty-notification-message"><p>No new updates on your inquiries.</p></div>';
                    }

                } else {
                    // This handles when there are no unread notifications at all
                    container.innerHTML = '<div class="empty-notification-message"><p>No new updates on your inquiries.</p></div>';
                    updateTabCount('my-inquiries', 0);
                }
            },
            error: function(err) {
                console.error("Failed to load notifications:", err);
                container.innerHTML = '<div class="empty-notification-message"><p>Error loading inquiries. Please try again.</p></div>';
            }
        });
    }

    function createBookingRequestHtml(notif) {
        const iconHtml = `
        <div class="notification-icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" 
                 stroke="currentColor" stroke-width="2">
                 <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                 <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
        </div>
    `;

        const isUnreadClass = notif.isRead ? '' : 'unread';

        const fullMessage = notif.message || "";

        const match = fullMessage.match(/^(.*?) has sent a booking request for your ad: '?(.+?)'?$/);

        let styledMessageHtml = fullMessage; // fallback

        if (match) {
            const senderName = match[1];
            const propertyTitle = match[2];

            styledMessageHtml = `
            <strong>${senderName}</strong> has sent a booking request for your ad: 
            <a href="${notif.link || '#'}" class="notification-link">"${propertyTitle}"</a>.
        `;

            console.log("Sender:", senderName);
            console.log("Property Title:", propertyTitle);
        } else {
            console.warn("Message did not match expected format:", fullMessage);
        }

        return `
            <div class="notification-item ${isUnreadClass}">
              ${iconHtml}
              <div class="notification-content">
                <p class="notification-text">
                  ${styledMessageHtml}
                </p>
                <span class="notification-time">${formatTimeAgo(notif.createdDate)}</span>
              </div>
              <div class="notification-actions">
                  <button class="btn-action decline" data-request-id="${notif.bookingRequestId}">Decline</button>
                  <button class="btn-action accept" data-request-id="${notif.bookingRequestId}">Accept</button>
              </div>
            </div>
        `;
    }

    function createMyInquiryHtml(notif) {
        let iconClass = 'pending'; // Default
        let iconSvg = '<svg>...</svg>'; // Your pending/default icon SVG

        // Determine the icon and styling based on the message content
        if (notif.message.toLowerCase().includes('accepted')) {
            iconClass = 'accepted';
            iconSvg = '<svg xmlns="http://www.w.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
        } else if (notif.message.toLowerCase().includes('declined')) {
            iconClass = 'rejected';
            iconSvg = '<svg xmlns="http://www.w.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
        }

        // We will make the status ("ACCEPTED") bold if found.
        const styledMessage = notif.message
            .replace(/ACCEPTED/gi, '<strong class="status-accepted">ACCEPTED</strong>')
            .replace(/DECLINED/gi, '<strong class="status-declined">DECLINED</strong>');

        return `
        <div class="notification-item ${notif.isRead ? '' : 'unread'}">
          <div class="notification-icon-container ${iconClass}">
            ${iconSvg}
          </div>
          <div class="notification-content">
            <p class="notification-text">
              ${styledMessage}
            </p>
            <span class="notification-time">${notif.timeAgo}</span>
          </div>
        </div>
    `;
    }

    requestsContainer.addEventListener('click', function(event) {
        const button = event.target.closest('.btn-action');
        if (button) {
            const notificationItem = button.closest('.notification-item');
            const requestId = button.dataset.requestId;

            if (button.classList.contains('accept')) {
                handleAcceptRequest(requestId, notificationItem);
            } else if (button.classList.contains('decline')) {
                handleDeclineRequest(requestId, notificationItem);
            }
        }
    });

    // In your Notifications.js file

    /**
     * Handles the logic for accepting a booking request.
     * It shows a confirmation, sends the request to the backend,
     * and provides clear feedback to the user.
     *
     * @param {string} requestId - The ID of the booking request to accept.
     * @param {HTMLElement} notificationItem - The HTML element of the notification, to be removed on success.
     */
    function handleAcceptRequest(requestId, notificationItem) {
        // For debugging, confirm we have the correct ID.
        console.log(`User initiated "Accept" for request ID: ${requestId}`);

        // --- Step 1: Confirm the Action ---
        // Use SweetAlert2 to ask the user if they are sure before making a permanent change.
        Swal.fire({
            title: 'Are you sure you want to accept?',
            text: "This will book the property and automatically decline other pending requests.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#28a745', // A positive green color
            cancelButtonColor: '#6c757d', // A neutral gray
            confirmButtonText: 'Yes, Accept It!'
        }).then((result) => {

            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Processing Request...',
                    text: 'Please wait while we update the booking status.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                // --- Step 3: Make the AJAX Call to the Backend ---
                $.ajax({
                    // The URL is now correct and matches your BookingController's full path.
                    url: `http://localhost:8080/booking/accept/${requestId}`,
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    success: function(response) {
                        // --- Step 4 (Success): Show a success message and update the UI ---
                        Swal.fire(
                            'Accepted!',
                            'The booking request has been successfully accepted.',
                            'success'
                        );

                        // Remove the notification from the list for instant visual feedback.
                        notificationItem.remove();

                        // TODO: You might want to update the notification count here.
                        // e.g., updateTabCount('booking-requests', newCount);
                    },
                    error: function(err) {
                        console.error("Failed to accept request:", err);

                        // Get the specific error message from the backend response, or show a generic one.
                        const errorMessage = err.responseJSON ? err.responseJSON.message : "An unknown error occurred.";

                        // --- Step 4 (Failure): Show a helpful error message ---
                        Swal.fire(
                            'Action Failed',
                            errorMessage,
                            'error'
                        );
                    }
                });
            }
        });
    }

    function handleDeclineRequest(requestId, notificationItem) {
        console.log(`Declining request ID: ${requestId}`);

        Swal.fire('Declined', 'The request has been declined.', 'info');
        notificationItem.remove();
    }

    function formatTimeAgo(dateString) {
        if (!dateString) return '';
        const now = new Date();
        const past = new Date(dateString);
        const secondsPast = (now.getTime() - past.getTime()) / 1000;

        if (secondsPast < 60) return 'Just now';
        if (secondsPast < 3600) return `${Math.floor(secondsPast / 60)}m ago`;
        if (secondsPast < 86400) return `${Math.floor(secondsPast / 3600)}h ago`;
        return `${Math.floor(secondsPast / 86400)}d ago`;
    }

    function updateTabCount(tabName, count) {
        const tabButton = document.querySelector(`.tab-link[data-tab="${tabName}"]`);
        if(tabButton) {
            const tabTitle = tabButton.textContent.split('(')[0].trim();
            tabButton.textContent = `${tabTitle} (${count})`;
        }
    }

    loadBookingRequests();
    loadMyInquiries();
});