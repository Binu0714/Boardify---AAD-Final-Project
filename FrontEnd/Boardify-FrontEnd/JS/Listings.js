document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu & Profile Dropdown (Standard for all admin pages) ---
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


    // --- Listing Approval Logic ---
    const approveButtons = document.querySelectorAll('.btn-approve');
    approveButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Find the main wrapper for the card and its actions
            const cardWrapper = this.closest('.admin-card-wrapper');
            const adTitle = cardWrapper.querySelector('.ad-title').textContent;

            Swal.fire({
                title: 'Approve Listing?',
                text: `Are you sure you want to approve "${adTitle}"? This will make it visible to all users.`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#16a34a',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, Approve It!'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Animate and remove the entire card wrapper
                    cardWrapper.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    cardWrapper.style.opacity = '0';
                    cardWrapper.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        cardWrapper.remove();
                    }, 500);

                    Swal.fire('Approved!', `"${adTitle}" has been verified and is now live.`, 'success');
                }
            });
        });
    });


    // --- Listing Rejection Logic ---
    const rejectButtons = document.querySelectorAll('.btn-reject');
    rejectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cardWrapper = this.closest('.admin-card-wrapper');
            const adTitle = cardWrapper.querySelector('.ad-title').textContent;

            Swal.fire({
                title: 'Reject Listing?',
                text: `Are you sure you want to reject "${adTitle}"? This action cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, Reject It!'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Animate and remove the entire card wrapper
                    cardWrapper.style.transition = 'opacity 0.5s ease';
                    cardWrapper.style.opacity = '0';
                    setTimeout(() => {
                        cardWrapper.remove();
                    }, 500);

                    Swal.fire('Rejected!', `"${adTitle}" has been rejected and removed from the queue.`, 'success');
                }
            });
        });
    });

});