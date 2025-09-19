function handleLogout(event) {
    event.preventDefault();

    // Clear specific keys
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    // add more if needed

    // Or nuke everything
    localStorage.clear();

    console.log("Storage after logout:", localStorage);

    window.location.href = "LogIn.html";
}
