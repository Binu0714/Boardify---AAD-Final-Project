// This file is responsible for handling all authentication-related header updates.

$(document).ready(function() {
    // This function will run automatically on every page that includes this script.
    updateUserHeaderFromToken();
});

/**
 * Reads the JWT from localStorage, parses it, and updates the user's
 * name and avatar initials in the shared site header.
 */
function updateUserHeaderFromToken() {
    const token = localStorage.getItem("token");

    // If there's no token, we don't need to do anything.
    // The page-specific script (like Dashboard.js) will handle the redirect.
    if (!token) {
        return;
    }

    try {
        const payload = parseJwt(token);

        // Check if the payload and the username ('sub' claim) exist.
        if (payload && payload.sub) {
            const username = payload.sub; // e.g., "John Smith"

            // --- Update all HTML elements that display the user's name ---

            // 1. Update the name in the profile dropdown header.
            const dropdownUsernameElement = $("#dropdown-username");
            if (dropdownUsernameElement.length) {
                dropdownUsernameElement.text(username);
            }

            // 2. Update the name in the main dashboard welcome message.
            const dashboardUsernameElement = $("#dashboard-username");
            if (dashboardUsernameElement.length) {
                dashboardUsernameElement.text(username + "!");
            }

            // --- Update the profile avatar with the user's initials ---
            const avatarElement = $("#profile-avatar");
            if (avatarElement.length) {
                const initials = getInitials(username);
                avatarElement.text(initials);
            }
        }
    } catch (e) {
        console.error("Failed to parse JWT or update header:", e);
    }
}

/**
 * Gets the initials from a full name for the avatar.
 * Example: "John Smith" -> "JS"
 * Example: "John" -> "JO"
 * @param {string} name - The user's full name.
 * @returns {string} The calculated initials.
 */
function getInitials(name) {
    if (!name || typeof name !== 'string') return '';

    const parts = name.trim().split(' ');
    if (parts.length > 1) {
        // Use the first letter of the first and last parts.
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    // If only one name, use the first two letters.
    return name.substring(0, 2).toUpperCase();
}

/**
 * Parses a JWT token to extract its payload.
 * @param {string} token - The JWT token string from localStorage.
 * @returns {object|null} The parsed payload object or null if parsing fails.
 */
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        // Don't log the error here, the calling function will handle it.
        return null;
    }
}