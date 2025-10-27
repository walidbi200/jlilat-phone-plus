// login.js - Handle user authentication with modern UI

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const loginButton = loginForm.querySelector('.login-btn-modern');
    const loginLoading = document.getElementById('login-loading');

    // Redirect if already logged in
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log('User already logged in, redirecting to app...');
            window.location.href = "index.html";
        }
    });

    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        loginError.textContent = '';
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Show loading state
        loginButton.style.display = 'none';
        loginLoading.style.display = 'flex';
        
        try {
            // Sign in with Firebase Authentication
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            console.log('Login successful:', userCredential.user.email);
            
            // Success! Redirect will be handled by the onAuthStateChanged observer above
        } catch (error) {
            console.error('Login error:', error);
            
            // Hide loading, show button
            loginButton.style.display = 'flex';
            loginLoading.style.display = 'none';
            
            // Display user-friendly error messages in French
            let errorMessage = '';
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Adresse e-mail invalide.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Ce compte a été désactivé.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'Aucun compte trouvé avec cet e-mail.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Mot de passe incorrect.';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'E-mail ou mot de passe incorrect.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Erreur de connexion. Vérifiez votre connexion Internet.';
                    break;
                default:
                    errorMessage = `Erreur de connexion: ${error.message}`;
            }
            
            loginError.textContent = errorMessage;
            
            // Shake the form on error
            loginForm.style.animation = 'none';
            setTimeout(() => {
                loginForm.style.animation = 'shake 0.5s ease';
            }, 10);
        }
    });
});
