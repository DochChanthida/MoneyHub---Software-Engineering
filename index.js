// Ensure the user is logged in before accessing the loan application page
document.querySelector('.apply-btn').addEventListener('click', (event) => {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage

    if (!token) {
        // If no token is found, prevent navigation and redirect to the login page
        event.preventDefault();
        alert('You need to log in to apply for a loan.');
        window.location.href = 'moneyhub-signin-page.html'; // Redirect to the login page
    }
});


document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage

    if (token) {
        try {
            // Fetch the user's profile from the backend
            const response = await fetch('http://localhost:3000/api/profile', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const user = await response.json();

                // Update the profile picture in the navigation bar
                const userIcon = document.querySelector('.user-icon img');
                userIcon.src = user.image ? `../backend/${user.image}` : 'assets/images/default-profile.png';
                userIcon.alt = `${user.first_name || 'User'}'s Profile Picture`;
            } else {
                console.error('Failed to fetch user profile.');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    }
});