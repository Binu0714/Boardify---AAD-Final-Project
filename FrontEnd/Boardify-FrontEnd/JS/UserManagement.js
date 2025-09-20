document.addEventListener('DOMContentLoaded', () => {
    // --- Basic Page Setup (Menu, Dropdown) ---
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    const profileAvatar = document.getElementById('profile-avatar');
    const profileDropdown = document.getElementById('profile-dropdown');
    if (profileAvatar) {
        profileAvatar.addEventListener('click', (event) => {
            event.stopPropagation();
            profileDropdown.classList.toggle('active');
        });
    }

    document.addEventListener('click', (event) => {
        if (profileDropdown && !profileDropdown.contains(event.target) && !profileAvatar.contains(event.target)) {
            profileDropdown.classList.remove('active');
        }
    });


    // --- Core logic for User Management Page ---

    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "Login.html";
        return;
    }

    const userTableBody = document.getElementById('user-table-body');

    function getInitials(name) {
        if (!name) return '';
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    async function fetchAndRenderUsers() {
        try {
            const response = await fetch("http://localhost:8080/admin/users", {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const apiResponse = await response.json();
            const users = apiResponse.data;

            userTableBody.innerHTML = '';

            if (users && users.length > 0) {
                users.forEach(user => {
                    const avatarContent = getInitials(user.username);
                    const roleName = user.role.name || user.role;
                    const displayRole = roleName.replace('ROLE_', '');
                    const roleClass = displayRole === 'ADMIN' ? 'owner' : 'seeker';

                    // --- *** NEW LOGIC FOR THE ACTION BUTTON *** ---
                    let actionsCellHTML;

                    if (displayRole === 'ADMIN') {
                        // If the user is an ADMIN, show a disabled button/text.
                        actionsCellHTML = `
                            <button class="btn-text-disabled" disabled title="System administrators cannot be deleted.">
                                Not Allowed
                            </button>
                        `;
                    } else {
                        // Otherwise, show the active delete button.
                        actionsCellHTML = `
                            <button class="btn-icon btn-icon-danger" title="Delete User" data-user-id="${user.id}" data-user-name="${user.username}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        `;
                    }
                    // --- *** END OF NEW LOGIC *** ---


                    // --- Create the Table Row HTML, now using the actionsCellHTML variable ---
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>#${user.id}</td>
                        <td>
                            <div class="user-profile-cell">
                                <div class="user-avatar">${avatarContent}</div>
                                <span class="user-name">${user.username}</span>
                            </div>
                        </td>
                        <td>${user.email}</td>
                        <td>${user.mobile || 'N/A'}</td>
                        <td><span class="role-tag ${roleClass}">${displayRole}</span></td>
                        <td class="actions-cell">
                            ${actionsCellHTML}
                        </td>
                    `;
                    userTableBody.appendChild(row);
                });
            } else {
                userTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No users found.</td></tr>';
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
            userTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error loading users. Please try again.</td></tr>';
            Swal.fire('Error', 'Could not load user data from the server.', 'error');
        }
    }


    // --- Event Delegation for Delete Buttons ---
    // NO CHANGES NEEDED HERE. The listener only targets '.btn-icon-danger',
    // so it will automatically ignore the admin rows.
    userTableBody.addEventListener('click', function(event) {
        const deleteButton = event.target.closest('.btn-icon-danger');

        if (deleteButton) {
            event.preventDefault();
            const userId = deleteButton.dataset.userId;
            const userName = deleteButton.dataset.userName;

            Swal.fire({
                title: 'Are you sure?',
                text: `You are about to delete "${userName}". This action cannot be undone!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    const userRow = deleteButton.closest('tr');
                    userRow.style.transition = 'opacity 0.5s ease';
                    userRow.style.opacity = '0';
                    setTimeout(() => userRow.remove(), 500);

                    Swal.fire('Deleted!', `User "${userName}" has been removed.`, 'success');
                }
            });
        }
    });

    // --- Initial Load ---
    fetchAndRenderUsers();
});