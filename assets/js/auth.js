/**
 * Authentication Module
 * Handles Firebase Auth UI, Sign-in, Sign-up, Google OAuth, and Session
 */

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const resetForm = document.getElementById('reset-form');
    const googleBtn = document.getElementById('google-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const alertBox = document.getElementById('auth-alert');

    // Check if auth is available
    if (!window.firebaseAuth) {
        showAlert('Firebase connection error. Please try again later.', 'error');
        return;
    }

    // Helper: Show Alert
    function showAlert(message, type = 'error') {
        if (!alertBox) return;
        alertBox.textContent = message;
        alertBox.className = `alert alert-${type} show`;

        // Add icon based on type
        const icon = document.createElement('i');
        icon.className = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
        alertBox.prepend(icon);

        setTimeout(() => {
            alertBox.classList.remove('show');
        }, 5000);
    }

    // Email/Password Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            const rememberMe = loginForm.remember ? loginForm.remember.checked : false;
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

                // Set persistence
                const persistence = rememberMe
                    ? firebase.auth.Auth.Persistence.LOCAL
                    : firebase.auth.Auth.Persistence.SESSION;

                await window.firebaseAuth.setPersistence(persistence);
                await window.firebaseAuth.signInWithEmailAndPassword(email, password);

                // Redirect on success is handled by auth state listener
            } catch (error) {
                console.error("Login Error:", error);
                showAlert(getErrorMessage(error.code), 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Masuk';
            }
        });
    }

    // Email/Password Register
    if (registerForm) {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const strengthBar = document.getElementById('strength-bar');
        const strengthText = document.getElementById('strength-text');

        // Password strength indicator
        if (passwordInput && strengthBar) {
            passwordInput.addEventListener('input', () => {
                const val = passwordInput.value;
                let strength = 0;

                if (val.length > 5) strength += 1;
                if (val.length > 7) strength += 1;
                if (/[A-Z]/.test(val)) strength += 1;
                if (/[0-9]/.test(val)) strength += 1;
                if (/[^A-Za-z0-9]/.test(val)) strength += 1;

                switch(strength) {
                    case 0:
                    case 1:
                        strengthBar.style.width = '20%';
                        strengthBar.style.backgroundColor = '#ff5252';
                        strengthText.textContent = 'Sangat Lemah';
                        break;
                    case 2:
                        strengthBar.style.width = '40%';
                        strengthBar.style.backgroundColor = '#ff9800';
                        strengthText.textContent = 'Lemah';
                        break;
                    case 3:
                        strengthBar.style.width = '60%';
                        strengthBar.style.backgroundColor = '#ffc107';
                        strengthText.textContent = 'Sedang';
                        break;
                    case 4:
                        strengthBar.style.width = '80%';
                        strengthBar.style.backgroundColor = '#4caf50';
                        strengthText.textContent = 'Kuat';
                        break;
                    case 5:
                        strengthBar.style.width = '100%';
                        strengthBar.style.backgroundColor = '#10b981';
                        strengthText.textContent = 'Sangat Kuat';
                        break;
                }
            });
        }

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = registerForm.fullname.value;
            const email = registerForm.email.value;
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const terms = registerForm.terms.checked;
            const submitBtn = registerForm.querySelector('button[type="submit"]');

            if (password !== confirmPassword) {
                showAlert('Password tidak cocok.', 'error');
                return;
            }

            if (!terms) {
                showAlert('Anda harus menyetujui syarat & ketentuan.', 'error');
                return;
            }

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

                const userCredential = await window.firebaseAuth.createUserWithEmailAndPassword(email, password);

                // Update profile with full name
                await userCredential.user.updateProfile({
                    displayName: fullName
                });

                // Initialize user document in Firestore
                if (window.firebaseDb) {
                    await window.firebaseDb.collection('users').doc(userCredential.user.uid).set({
                        email: email,
                        name: fullName,
                        role: 'user',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        trading: { balance: 0, totalProfit: 0, winRate: 0 }
                    });
                }

                // Send verification email
                await userCredential.user.sendEmailVerification();

                showAlert('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);

            } catch (error) {
                console.error("Register Error:", error);
                showAlert(getErrorMessage(error.code), 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Daftar Sekarang';
            }
        });
    }

    // Password Reset
    if (resetForm) {
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = resetForm.email.value;
            const submitBtn = resetForm.querySelector('button[type="submit"]');

            try {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

                await window.firebaseAuth.sendPasswordResetEmail(email);
                showAlert('Tautan reset password telah dikirim ke email Anda.', 'success');

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
            } catch (error) {
                console.error("Reset Password Error:", error);
                showAlert(getErrorMessage(error.code), 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-envelope"></i> Kirim Link Reset';
            }
        });
    }

    // Google Sign-In
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                const result = await window.firebaseAuth.signInWithPopup(provider);

                // Check if new user and create firestore doc
                if (result.additionalUserInfo && result.additionalUserInfo.isNewUser && window.firebaseDb) {
                    await window.firebaseDb.collection('users').doc(result.user.uid).set({
                        email: result.user.email,
                        name: result.user.displayName,
                        photoURL: result.user.photoURL,
                        role: 'user',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        trading: { balance: 0, totalProfit: 0, winRate: 0 }
                    });
                }
                // Redirect handled by state listener
            } catch (error) {
                console.error("Google Sign-In Error:", error);
                showAlert(getErrorMessage(error.code), 'error');
            }
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await window.firebaseAuth.signOut();
                // Redirect handled by state listener
            } catch (error) {
                console.error("Logout Error:", error);
            }
        });
    }

    // Auth State Listener
    window.firebaseAuth.onAuthStateChanged((user) => {
        const path = window.location.pathname;
        const isAuthPage = path.includes('login.html') || path.includes('register.html') || path.includes('forgot-password.html');

        if (user) {
            // User is signed in.
            if (isAuthPage) {
                window.location.href = 'dashboard.html';
            }
        } else {
            // No user is signed in.
            if (!isAuthPage && !path.endsWith('/') && !path.includes('index.html')) {
                // Redirect to login if trying to access protected pages like dashboard
                window.location.href = 'login.html';
            }
        }
    });

    // Error Message Mapper
    function getErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/user-not-found':
                return 'Pengguna tidak ditemukan. Silakan periksa kembali email Anda.';
            case 'auth/wrong-password':
                return 'Password salah. Silakan coba lagi.';
            case 'auth/email-already-in-use':
                return 'Email ini sudah terdaftar.';
            case 'auth/weak-password':
                return 'Password terlalu lemah.';
            case 'auth/invalid-email':
                return 'Format email tidak valid.';
            case 'auth/network-request-failed':
                return 'Terjadi masalah jaringan. Periksa koneksi internet Anda.';
            case 'auth/too-many-requests':
                return 'Terlalu banyak percobaan. Silakan coba lagi nanti.';
            default:
                return 'Terjadi kesalahan. Silakan coba lagi.';
        }
    }
});
