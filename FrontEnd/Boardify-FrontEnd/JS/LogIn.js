$("#login-form").submit(function (event) {
   event.preventDefault();

   const username = $("#name").val();
   const password = $("#password").val();

    $.ajax({
        url: "http://localhost:8080/user/login",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            username: username,
            password: password
        }),
        success: function (response) {
            console.log("Login response:", response);

            const token = response.data?.accessToken;

            if (token) {
                localStorage.setItem("token", token);
                Swal.fire({
                    icon: 'success',
                    title: 'Login Successful',
                    text: 'Redirecting...'
                }).then(() => {
                    window.location.href = "Dashboard.html";
                });
            } else {
                Swal.fire("Login Failed", "Token not found!", "error");
            }
        },
        error: function (xhr) {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: xhr.responseJSON?.message || "Something went wrong."
            });
        }
    });
});