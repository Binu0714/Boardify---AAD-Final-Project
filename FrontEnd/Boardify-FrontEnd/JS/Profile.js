$(document).ready(function() {
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



    loadUser();
    updateUser();
    updatePassword();
});

function loadUser() {
    const baseUrl = "http://localhost:8080/";
    const token = localStorage.getItem("token");

    if (!token) {
        Swal.fire({
            icon: 'error',
            title: 'Not Logged In',
            text: 'Please log in first!',
            confirmButtonText: 'OK'
        }).then(() => window.location.href = "LogIn.html");
        return;
    }

    $.ajax({
        url: baseUrl + "user/current",
        method: "GET",
        headers: { "Authorization": "Bearer " + token },
        success: function (response) {
            if (Number(response.status) === 200) {
                const user = response.data;

                $("#sidebar-username").text(user.username);
                $("#sidebar-email").text(user.email);
                $("#sidebar-mobile").text(user.mobile);

                $("#profile-username").val(user.username);
                $("#profile-email").val(user.email);
                $("#profile-mobile").val(user.mobile);

                if (user.profilePicUrl) {
                    const fullImgUrl = baseUrl + user.profilePicUrl.replace(/^\/+/, '') + "?t=" + new Date().getTime();
                    $("#form-avatar-preview").attr("src", fullImgUrl);
                    $("#sidebar-avatar").attr("src", fullImgUrl);
                } else {
                    $("#form-avatar-preview").attr("src", "../assets/user.png");
                    $("#sidebar-avatar").attr("src", "../assets/user.png");
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
        error: function (xhr) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: xhr.responseJSON?.message || 'Failed to load profile. Please try again.',
                confirmButtonText: 'Retry'
            });
        }
    });
}

function updateUser() {
    const baseUrl = "http://localhost:8080/";

    $("#avatar-upload-input").on("change", function (e) {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            $("#form-avatar-preview").attr("src", previewUrl);
        }
    });

    $("#profile-update-form").on("submit", function (event) {
        event.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire("Error", "Not logged in", "error");
            return;
        }

        const formData = new FormData();
        formData.append("email", $("#profile-email").val());
        formData.append("mobile", $("#profile-mobile").val());

        const fileInput = $("#avatar-upload-input")[0];
        if (fileInput && fileInput.files.length > 0) {
            formData.append("file", fileInput.files[0]);
        }

        $.ajax({
            url: baseUrl + "user/update",
            method: "PUT",
            headers: { "Authorization": "Bearer " + token },
            data: formData,
            processData: false,
            contentType: false,

            success: function (response) {
                Swal.fire({
                    icon: "success",
                    title: "Update Successful",
                    text: "Profile updated successfully!",
                    confirmButtonText: "OK"
                }).then(() => {
                    if (response.data && response.data.profilePicUrl) {
                        const fullImgUrl = baseUrl + response.data.profilePicUrl.replace(/^\/+/, '') + "?t=" + new Date().getTime();
                        $("#form-avatar-preview").attr("src", fullImgUrl);
                        $("#sidebar-avatar").attr("src", fullImgUrl);
                    }
                    if (response.data) {
                        $("#sidebar-email").text(response.data.email);
                        $("#sidebar-mobile").text(response.data.mobile);
                    }
                });
            },

            error: function () {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to update profile. Please try again.",
                    confirmButtonText: "Retry"
                });
            }
        });
    });
}

function updatePassword() {
    $("#password-update-form").on("submit", function (event) {
        event.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire("Error", "Not logged in", "error");
            return;
        }

        const currentPassword = $("#current-password").val();
        const newPassword = $("#new-password").val();
        const confirmPassword = $("#confirm-password").val();

        if (newPassword !== confirmPassword) {
            Swal.fire("Error", "Passwords do not match", "error");
            return;
        }

        Swal.fire({
            title: "Are you sure?",
            text: "Your password will be changed.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#4facfe",
            cancelButtonColor: "#E62727",
            confirmButtonText: "Yes, change it!"
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: "http://localhost:8080/user/updatePassword",
                    method: "PUT",
                    headers: {
                        "Authorization": "Bearer " + token,
                        "Content-Type": "application/json"
                    },
                    data: JSON.stringify({
                        currentPassword: currentPassword,
                        newPassword: newPassword,
                        confirmPassword: confirmPassword
                    }),
                    success: function (response) {
                        Swal.fire({
                            icon: "success",
                            title: "Password Updated",
                            text: "Your password has been changed successfully!"
                        }).then(() => {
                            $("#current-password").val("");
                            $("#new-password").val("");
                            $("#confirm-password").val("");
                        });
                    },
                    error: function (xhr) {
                        Swal.fire("Error", xhr.responseJSON?.message || "Failed to update password", "error");
                    }
                });
            }
        });
    });
}







