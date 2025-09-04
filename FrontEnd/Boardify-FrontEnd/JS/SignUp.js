$("#signup-form").submit(function (event) {
    event.preventDefault();

    let username = $("#name").val();
    let email = $("#email").val();
    let password = $("#password").val();
    let mobile = $("#mobile").val();

    let user = {
        username: username,
        password: password,
        email: email,
        mobile: mobile,
        role: "USER"
    };

    $.ajax({
        url: "http://localhost:8080/user/register",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(user),

        success: function (response) {
            Swal.fire({
                icon: 'success',
                title: 'Registration Successful',
                text: 'Redirecting to login page...',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = "LogIn.html";
            });
        },
        error: function () {
            Swal.fire({
                icon: 'error',
                title: 'Registration Failed',
                text: 'Please try again later.',
                confirmButtonText: 'Retry'
            });
        }
    });
});