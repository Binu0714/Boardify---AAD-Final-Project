document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Toggle ---
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // --- Profile Dropdown Toggle ---
    const profileAvatar = document.getElementById('profile-avatar');
    const profileDropdown = document.getElementById('profile-dropdown');

    if (profileAvatar) {
        profileAvatar.addEventListener('click', (event) => {
            event.stopPropagation();
            profileDropdown.classList.toggle('active');
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (profileDropdown && !profileDropdown.contains(event.target) && !profileAvatar.contains(event.target)) {
            profileDropdown.classList.remove('active');
        }
    });


    // --- Delete User Confirmation ---
    const deleteButtons = document.querySelectorAll('.btn-icon-danger');

    deleteButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();

            // Find the closest table row to the button clicked
            const userRow = this.closest('tr');
            const userName = userRow.querySelector('.user-name').textContent;

            Swal.fire({
                title: 'Are you sure?',
                text: `You are about to delete the user "${userName}". This action cannot be undone!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    // In a real application, you would make an API call here.
                    // For this demo, we'll just remove the row from the table.
                    userRow.style.transition = 'opacity 0.5s ease';
                    userRow.style.opacity = '0';
                    setTimeout(() => {
                        userRow.remove();
                    }, 500);


                    Swal.fire(
                        'Deleted!',
                        `User "${userName}" has been removed.`,
                        'success'
                    );
                }
            });
        });
    });

});