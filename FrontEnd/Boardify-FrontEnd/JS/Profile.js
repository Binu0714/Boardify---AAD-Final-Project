$(document).ready(function() {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);

    if (!token) {
        Swal.fire({
            icon: 'error',
            title: 'Not Logged In',
            text: 'Please log in first!',
            confirmButtonText: 'OK'
        }).then(() => {
            window.location.href = "LogIn.html";
        });
        return;
    }

    $.ajax({
        url: "http://localhost:8080/user/current",
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function(response) {
            console.log("Profile response:", response);

            if (Number(response.status) === 200) {
                const user = response.data;

                $("#profile-username").val(user.username);
                $("#profile-email").val(user.email);
                $("#profile-mobile").val(user.mobile);

                if (user.profilePicUrl) {
                    $("#profilePicImg").attr("src", user.profilePicUrl);
                } else {
                    $("#profilePicImg").attr("src", "default-profile.png");
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.message,
                    confirmButtonText: 'Retry'
                });
            }
        },
        error: function(xhr) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: xhr.responseJSON?.message || 'Failed to load profile. Please try again.',
                confirmButtonText: 'Retry'
            });
        }
    });
});
