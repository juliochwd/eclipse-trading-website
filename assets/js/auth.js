/**
 * Authentication Module - Eclipse Delta
 * Supports both real Firebase Auth and Demo Mode
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const resetForm = document.getElementById('reset-form');
    const googleBtn = document.getElementById('google-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const alertBox = document.getElementById('auth-alert');

    if (!window.firebaseAuth) {
        showAlert('Koneksi layanan autentikasi gagal.', 'error');
        return;
    }

    // ---- Helper: Show Alert ----
    function showAlert(message, type = 'error') {
        if (!alertBox) return;
        alertBox.className = `alert alert-${type} show`;
        const iconClass = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
        alertBox.innerHTML = `<i class="fas ${iconClass}"></i> ${message}`;
        setTimeout(() => alertBox.classList.remove('show'), 5000);
    }

    function setLoading(btn, loading, originalHtml) {
        if (loading) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
        } else {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
        }
    }

    // ---- Login Form ----
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.email.value.trim();
            const password = loginForm.password.value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const origHtml = submitBtn.innerHTML;

            try {
                setLoading(submitBtn, true);

                if (!IS_DEMO_MODE) {
                    const persistence = loginForm.remember?.checked
                        ? firebase.auth.Auth.Persistence.LOCAL
                        : firebase.auth.Auth.Persistence.SESSION;
                    await window.firebaseAuth.setPersistence(persistence);
                }

                await window.firebaseAuth.signInWithEmailAndPassword(email, password);
                showAlert('Login berhasil! Mengarahkan...', 'success');

            } catch (error) {
                console.error('Login Error:', error);
                showAlert(getErrorMessage(error.code), 'error');
                setLoading(submitBtn, false, origHtml);
            }
        });
    }

    // ---- Register Form ----
    if (registerForm) {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const strengthBar = document.getElementById('strength-bar');
        const strengthText = document.getElementById('strength-text');

        if (passwordInput && strengthBar) {
            passwordInput.addEventListener('input', () => {
                const val = passwordInput.value;
                let strength = 0;
                if (val.length > 5) strength++;
                if (val.length > 7) strength++;
                if (/[A-Z]/.test(val)) strength++;
                if (/[0-9]/.test(val)) strength++;
                if (/[^A-Za-z0-9]/.test(val)) strength++;

                const levels = [
                    { width: '20%', color: '#ef4444', label: 'Sangat Lemah' },
                    { width: '20%', color: '#ef4444', label: 'Sangat Lemah' },
                    { width: '40%', color: '#f59e0b', label: 'Lemah' },
                    { width: '60%', color: '#eab308', label: 'Sedang' },
                    { width: '80%', color: '#22c55e', label: 'Kuat' },
                    { width: '100%', color: '#10b981', label: 'Sangat Kuat' },
                ];
                const level = levels[strength] || levels[0];
                strengthBar.style.width = level.width;
                strengthBar.style.backgroundColor = level.color;
                if (strengthText) strengthText.textContent = level.label;
            });
        }

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = registerForm.fullname.value.trim();
            const email = registerForm.email.value.trim();
            const password = passwordInput?.value || '';
            const confirmPassword = confirmPasswordInput?.value || '';
            const terms = registerForm.terms?.checked;
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const origHtml = submitBtn.innerHTML;

            if (password !== confirmPassword) return showAlert('Password tidak cocok.', 'error');
            if (!terms) return showAlert('Anda harus menyetujui syarat & ketentuan.', 'error');
            if (password.length < 6) return showAlert('Password minimal 6 karakter.', 'error');

            try {
                setLoading(submitBtn, true);
                const credential = await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
                await credential.user.updateProfile?.({ displayName: fullName });

                if (window.firebaseDb) {
                    await window.firebaseDb.collection('users').doc(credential.user.uid).set({
                        email, name: fullName, role: 'user',
                        createdAt: new Date().toISOString(),
                        trading: { balance: 0, totalProfit: 0, winRate: 0 }
                    });
                }

                if (!IS_DEMO_MODE) await credential.user.sendEmailVerification?.();

                showAlert(IS_DEMO_MODE
                    ? 'Akun demo berhasil dibuat! Silakan login.'
                    : 'Pendaftaran berhasil! Silakan cek email untuk verifikasi.',
                    'success');

                setTimeout(() => { window.location.href = 'login.html'; }, 2500);
            } catch (error) {
                console.error('Register Error:', error);
                showAlert(getErrorMessage(error.code), 'error');
                setLoading(submitBtn, false, origHtml);
            }
        });
    }

    // ---- Password Reset ----
    if (resetForm) {
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = resetForm.email.value.trim();
            const submitBtn = resetForm.querySelector('button[type="submit"]');
            const origHtml = submitBtn.innerHTML;

            try {
                setLoading(submitBtn, true);
                await window.firebaseAuth.sendPasswordResetEmail(email);
                showAlert(IS_DEMO_MODE
                    ? 'Demo: Email reset (simulasi) telah dikirim.'
                    : 'Link reset dikirim! Cek email Anda.',
                    'success');
                setTimeout(() => { window.location.href = 'login.html'; }, 3000);
            } catch (error) {
                console.error('Reset Error:', error);
                showAlert(getErrorMessage(error.code), 'error');
                setLoading(submitBtn, false, origHtml);
            }
        });
    }

    // ---- Google Sign-In ----
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            try {
                googleBtn.disabled = true;
                googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghubungkan...';

                let provider;
                if (!IS_DEMO_MODE && window.firebase) {
                    provider = new firebase.auth.GoogleAuthProvider();
                }
                const result = await window.firebaseAuth.signInWithPopup(provider);

                if (result.additionalUserInfo?.isNewUser && window.firebaseDb) {
                    await window.firebaseDb.collection('users').doc(result.user.uid).set({
                        email: result.user.email,
                        name: result.user.displayName,
                        photoURL: result.user.photoURL,
                        role: 'user',
                        createdAt: new Date().toISOString(),
                        trading: { balance: 0, totalProfit: 0, winRate: 0 }
                    });
                }
            } catch (error) {
                console.error('Google Error:', error);
                showAlert(getErrorMessage(error.code), 'error');
                googleBtn.disabled = false;
                googleBtn.innerHTML = '<img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google"> Google';
            }
        });
    }

    // ---- Logout (for auth pages) ----
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await window.firebaseAuth.signOut().catch(console.error);
        });
    }

    // ---- Auth State Listener ----
    window.firebaseAuth.onAuthStateChanged((user) => {
        const path = window.location.pathname;
        const isAuthPage = ['login.html', 'register.html', 'forgot-password.html']
            .some(p => path.includes(p));

        if (user) {
            if (isAuthPage) {
                window.location.href = 'dashboard.html';
            }
        } else {
            const isProtectedPage = ['dashboard.html', 'trades.html', 'signals.html',
                'analytics.html', 'settings.html', 'admin.html'].some(p => path.includes(p));
            if (isProtectedPage) {
                window.location.href = 'login.html';
            }
        }
    });

    // ---- Error Messages ----
    function getErrorMessage(code) {
        const messages = {
            'auth/user-not-found': 'Email tidak terdaftar. Silakan daftar terlebih dahulu.',
            'auth/wrong-password': 'Password salah. Silakan coba lagi.',
            'auth/email-already-in-use': 'Email ini sudah terdaftar. Silakan login.',
            'auth/weak-password': 'Password terlalu lemah. Minimal 6 karakter.',
            'auth/invalid-email': 'Format email tidak valid.',
            'auth/network-request-failed': 'Gagal terhubung. Periksa koneksi internet Anda.',
            'auth/too-many-requests': 'Terlalu banyak percobaan. Silakan tunggu sebentar.',
            'auth/popup-closed-by-user': 'Popup ditutup sebelum selesai.',
        };
        return messages[code] || 'Terjadi kesalahan. Silakan coba lagi.';
    }
});
