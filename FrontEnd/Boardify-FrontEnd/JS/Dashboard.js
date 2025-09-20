$(document).ready(function() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("fuck you...")
        window.location.href = "LogIn.html";
        return;
    }

    const payload = parseJwt(token);
    const username = payload.sub;

    $("#dashboard-username").text(username + "!");

    checkAndShowNotifications();

});

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to parse JWT token:", e);
        return null;
    }
}

function checkAndShowNotifications() {
    const token = localStorage.getItem('token');
    if (!token) {
        return;
    }

    $.ajax({
        url: 'http://localhost:8080/notification/unread',
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        success: function(res) {
            if (res.status === 200 && res.data && res.data.length > 0) {
                const notificationCount = res.data.length;

                Swal.fire({
                    title: 'Welcome Back!',
                    html: `You have <strong>${notificationCount}</strong> new notification(s).`,
                    icon: 'info',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#aaa',
                    cancelButtonText: 'Dismiss',
                    confirmButtonText: 'View Notifications'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'Notification.html';
                    }
                });
            }
        },
        error: function(err) {
            console.error("Could not check for notifications:", err);
        }
    });
}