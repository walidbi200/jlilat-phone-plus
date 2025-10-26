// login.js - Handle user authentication

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

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
        
        try {
            // Sign in with Firebase Authentication
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            console.log('Login successful:', userCredential.user.email);
            // Redirect will be handled by the onAuthStateChanged observer above
        } catch (error) {
            console.error('Login error:', error);
            
            // Display user-friendly error messages
            let errorMessage = 'Erreur de connexion. ';
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage += 'Adresse email invalide.';
                    break;
                case 'auth/user-disabled':
                    errorMessage += 'Ce compte a été désactivé.';
                    break;
                case 'auth/user-not-found':
                    errorMessage += 'Aucun compte trouvé avec cet email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage += 'Mot de passe incorrect.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage += 'Trop de tentatives. Réessayez plus tard.';
                    break;
                default:
                    errorMessage += error.message;
            }
            
            loginError.textContent = errorMessage;
        }
    });
});

