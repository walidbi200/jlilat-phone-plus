document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    // Redirect if already logged in
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            window.location.href = "index.html";
        }
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Success! Redirect will be handled by the observer above.
            })
            .catch((error) => {
                loginError.textContent = "Erreur: " + error.message;
            });
    });
});
