document.addEventListener('DOMContentLoaded', () => {

    function validateAndLoadDashboard() {
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


        } catch (error) {

            console.error('Invalid token:', error);
            window.location.href = "Login.html";
            return false;

        }

        return true;

    }

    if (validateAndLoadDashboard()) {

        setInterval(validateAndLoadDashboard, 10000);

    }




    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const requestsContainer = document.getElementById('booking-requests');
    const markAllBtn = document.getElementById('mark-all-read-btn');

    if (markAllBtn) {
        markAllBtn.addEventListener('click', function(e) {
            e.preventDefault();

            console.log("hegwduywdqiudhnj2")

            Swal.fire({
                title: 'Mark all notifications as read?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#28a745',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, mark all as read!'
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Processing...',
                        text: 'Please wait...',
                        allowOutsideClick: false,
                        didOpen: () => Swal.showLoading()
                    });

                    $.ajax({
                        url: 'http://localhost:8080/notification/markAsRead',
                        method: 'POST',
                        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                        success: function(res) {
                            Swal.fire('Done!', res.message || 'All notifications have been marked as read.', 'success');

                            document.querySelectorAll('.notification-item.unread').forEach(item => item.classList.remove('unread'));

                            updateTabCount('booking-requests', 0);
                            updateTabCount('my-inquiries', 0);
                        },
                        error: function(err) {
                            const errorMessage = err.responseJSON ? err.responseJSON.message : "An error occurred.";
                            Swal.fire('Failed', errorMessage, 'error');
                        }
                    });
                }
            });
        });
    }

    if (!requestsContainer) {
        console.error("The main '#booking-requests' container was not found.");
        return;
    }

    // ---- Tab Switching ----
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

                // Load data when switching tabs
                if (targetTabId === "booking-requests") {
                    loadBookingRequests();
                } else if (targetTabId === "my-inquiries") {
                    loadMyInquiries();
                }
            });
        });
    }

    // ---- Load Booking Requests ----
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
                    // ✅ Only requests where someone sent you a booking request
                    const bookingRequests = res.data.filter(notif =>
                        notif.message.includes("has sent a booking request")
                    );

                    updateTabCount('booking-requests', bookingRequests.length);

                    if (bookingRequests.length > 0) {
                        bookingRequests.forEach(notif => {
                            const notifHtml = createBookingRequestHtml(notif);
                            container.insertAdjacentHTML('beforeend', notifHtml);
                        });
                    } else {
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

        const container = document.getElementById('my-inquiries'); // ✅ FIXED
        if (!container) {
            console.error("The container '#my-inquiries' was not found on the page.");
            return;
        }

        $.ajax({
            url: 'http://localhost:8080/notification/unread',
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
            success: function(res) {
                container.innerHTML = '';

                if (res.status === 200 && res.data && res.data.length > 0) {
                    // Inquiries = NOT "sent you a booking request"
                    const myInquiries = res.data.filter(notif =>
                        !notif.message.includes("sent a booking request")
                    );

                    updateTabCount('my-inquiries', myInquiries.length);

                    if (myInquiries.length > 0) {
                        myInquiries.forEach(notif => {
                            const notifHtml = createMyInquiryHtml(notif);
                            container.insertAdjacentHTML('beforeend', notifHtml);
                        });
                    } else {
                        container.innerHTML = '<div class="empty-notification-message"><p>No new updates on your inquiries.</p></div>';
                    }
                } else {
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
        }

        return `
            <div class="notification-item ${isUnreadClass}">
              <div class="notification-icon-container">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2">
                     <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                     <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <div class="notification-content">
                <p class="notification-text">${styledMessageHtml}</p>
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
        let iconClass = 'pending';
        let iconSvg = '<svg>...</svg>';

        if (notif.message.toLowerCase().includes('accepted')) {
            iconClass = 'accepted';
            iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
        } else if (notif.message.toLowerCase().includes('declined')) {
            iconClass = 'rejected';
            iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
        }

        const styledMessage = notif.message
            .replace(/ACCEPTED/gi, '<strong class="status-accepted">ACCEPTED</strong>')
            .replace(/DECLINED/gi, '<strong class="status-declined">DECLINED</strong>');

        return `
        <div class="notification-item ${notif.isRead ? '' : 'unread'}">
          <div class="notification-icon-container ${iconClass}">
            ${iconSvg}
          </div>
          <div class="notification-content">
            <p class="notification-text">${styledMessage}</p>
            <span class="notification-time">${formatTimeAgo(notif.createdDate)}</span>
          </div>
        </div>
        `;
    }

    // ---- Helpers ----
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

    function handleAcceptRequest(requestId, notificationItem) {
        Swal.fire({
            title: 'Are you sure you want to accept?',
            text: "This will book the property and automatically decline other pending requests.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, Accept It!'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Processing Request...',
                    text: 'Please wait while we update the booking status.',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });

                $.ajax({
                    url: `http://localhost:8080/booking/accept/${requestId}`,
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                    success: function() {
                        Swal.fire('Accepted!', 'The booking request has been successfully accepted.', 'success');
                        notificationItem.remove();
                    },
                    error: function(err) {
                        const errorMessage = err.responseJSON ? err.responseJSON.message : "An unknown error occurred.";
                        Swal.fire('Action Failed', errorMessage, 'error');
                    }
                });
            }
        });
    }

    function handleDeclineRequest(requestId, notificationItem) {
        Swal.fire({
            title: 'Are you sure you want to decline?',
            text: "This will notify the seeker that their request was declined.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, Decline It!'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Processing...',
                    text: 'Please wait while we update the request status.',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });

                $.ajax({
                    url: `http://localhost:8080/booking/decline/${requestId}`,
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                    success: function() {
                        Swal.fire('Declined!', 'The booking request has been declined.', 'success');
                        notificationItem.remove();
                    },
                    error: function(err) {
                        const errorMessage = err.responseJSON ? err.responseJSON.message : "An unknown error occurred.";
                        Swal.fire('Action Failed', errorMessage, 'error');
                    }
                });
            }
        });
    }


    function formatTimeAgo(dateString) {
        if (!dateString) return '';
        const now = new Date();
        const past = new Date(dateString);
        const secondsPast = (now - past) / 1000;

        if (secondsPast < 60) return 'Just now';
        if (secondsPast < 3600) return `${Math.floor(secondsPast / 60)}m ago`;
        if (secondsPast < 86400) return `${Math.floor(secondsPast / 3600)}h ago`;
        return `${Math.floor(secondsPast / 86400)}d ago`;
    }

    function updateTabCount(tabName, count) {
        const tabButton = document.querySelector(`.tab-link[data-tab="${tabName}"]`);
        if (tabButton) {
            const tabTitle = tabButton.textContent.split('(')[0].trim();
            tabButton.textContent = `${tabTitle} (${count})`;
        }
    }

    // ---- Initial Load (default tab) ----
    loadBookingRequests(); // load requests first
});
