
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
        console.log(`Accepting request ID: ${requestId}`);

        Swal.fire('Accepted!', 'The request has been accepted.', 'success');
        notificationItem.remove();
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
});