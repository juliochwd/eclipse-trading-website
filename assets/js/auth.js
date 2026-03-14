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
        alertBox.textContent = '';
        const icon = document.createElement('i');
        icon.className = `fas ${iconClass}`;
        alertBox.appendChild(icon);
        alertBox.appendChild(document.createTextNode(` ${message}`));
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

                setTimeout(() => { window.location.href = 'login'; }, 2500);
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
                setTimeout(() => { window.location.href = 'login'; }, 3000);
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
            const origHtml = googleBtn.innerHTML;
            try {
                googleBtn.disabled = true;
                googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghubungkan...';

                if (IS_DEMO_MODE) {
                    // Demo mode: mock Google login
                    const authUser = { uid: 'google-demo-001', email: 'google.demo@eclipse.ai', displayName: 'Google Demo User', photoURL: null };
                    sessionStorage.setItem('eclipse_demo_user', JSON.stringify(authUser));
                    window.location.href = 'dashboard';
                    return;
                }

                const provider = new firebase.auth.GoogleAuthProvider();
                provider.addScope('email');
                provider.addScope('profile');

                try {
                    // Try popup first
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
                } catch (popupError) {
                    if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
                        // Fallback to redirect
                        await window.firebaseAuth.signInWithRedirect(provider);
                    } else {
                        throw popupError;
                    }
                }

            } catch (error) {
                console.error('Google Error:', error);
                showAlert(getErrorMessage(error.code), 'error');
                googleBtn.disabled = false;
                googleBtn.innerHTML = origHtml;
            }
        });

        // Handle redirect result on page load
        if (!IS_DEMO_MODE && window.firebaseAuth) {
            window.firebaseAuth.getRedirectResult().then(result => {
                if (result && result.user) {
                    // Redirect result handled by onAuthStateChanged
                    console.log('Google redirect login success');
                }
            }).catch(error => {
                if (error.code && error.code !== 'auth/no-current-user') {
                    showAlert(getErrorMessage(error.code), 'error');
                }
            });
        }
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
        const isAuthPage = ['login', 'register', 'forgot-password']
            .some(p => path.includes(p));

        if (user) {
            if (isAuthPage) {
                window.location.href = 'dashboard';
            }
        } else {
            const isProtectedPage = ['dashboard', 'trades', 'signals',
                'analytics', 'settings', 'admin'].some(p => path.includes(p));
            if (isProtectedPage) {
                window.location.href = 'login';
            }
        }
    });

    // ---- Error Messages ----
    function getErrorMessage(code) {
        const messages = {
            'auth/user-not-found': 'Email tidak terdaftar. Silakan daftar terlebih dahulu.',
            'auth/wrong-password': 'Password salah. Silakan coba lagi.',
            'auth/invalid-credential': 'Email atau password salah. Silakan coba lagi.',
            'auth/invalid-email': 'Format email tidak valid.',
            'auth/email-already-in-use': 'Email ini sudah terdaftar. Silakan login.',
            'auth/weak-password': 'Password terlalu lemah. Minimal 6 karakter.',
            'auth/network-request-failed': 'Gagal terhubung. Periksa koneksi internet Anda.',
            'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi beberapa menit.',
            'auth/popup-closed-by-user': 'Popup ditutup. Silakan coba lagi.',
            'auth/popup-blocked': 'Popup diblokir browser. Menggunakan metode redirect...',
            'auth/cancelled-popup-request': 'Permintaan dibatalkan. Silakan coba lagi.',
            'auth/operation-not-allowed': 'Metode login ini belum diaktifkan. Hubungi admin.',
            'auth/account-exists-with-different-credential': 'Email sudah digunakan dengan metode login lain.',
            'auth/user-disabled': 'Akun Anda telah dinonaktifkan. Hubungi admin.',
        };
        return messages[code] || `Terjadi kesalahan (${code || 'unknown'}). Silakan coba lagi.`;
    }
});
