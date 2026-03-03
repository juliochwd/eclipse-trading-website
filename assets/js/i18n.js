/**
 * Internationalization (i18n) Module
 * Handles language switching between Indonesian (ID) and English (EN)
 */

document.addEventListener('DOMContentLoaded', () => {
    const translations = {
        'id': {
            'nav.features': 'Fitur',
            'nav.performance': 'Performa',
            'nav.how': 'Cara Kerja',
            'nav.pricing': 'Harga',
            'nav.login': 'Masuk',
            'nav.dashboard': 'Dashboard',
            'nav.cta': 'Mulai Sekarang',
            'hero.badge': 'Quantum v8.0 - Rilis Terbaru',
            'hero.title.pre': 'Trading Futures Otomatis dengan',
            'hero.title.gradient': 'Kecerdasan Kuantum',
            'hero.subtitle': 'Sistem trading algoritmik canggih untuk Micro Nasdaq, Gold, Oil, dan Forex Futures. Analisis real-time 24/7 dengan risk management ketat.',
            'hero.btn.demo': 'Demo Gratis',
            'hero.btn.learn': 'Pelajari Lebih',
        },
        'en': {
            'nav.features': 'Features',
            'nav.performance': 'Performance',
            'nav.how': 'How it Works',
            'nav.pricing': 'Pricing',
            'nav.login': 'Login',
            'nav.dashboard': 'Dashboard',
            'nav.cta': 'Get Started',
            'hero.badge': 'Quantum v8.0 - Latest Release',
            'hero.title.pre': 'Automated Futures Trading with',
            'hero.title.gradient': 'Quantum Intelligence',
            'hero.subtitle': 'Advanced algorithmic trading system for Micro Nasdaq, Gold, Oil, and Forex Futures. 24/7 real-time analysis with strict risk management.',
            'hero.btn.demo': 'Free Demo',
            'hero.btn.learn': 'Learn More',
        }
    };

    let currentLang = localStorage.getItem('eclipse_lang') || 'id';
    const langToggle = document.getElementById('lang-toggle');
    const currentLangText = document.getElementById('current-lang');

    // Auth State Integration
    const navLoginBtn = document.getElementById('nav-login-btn');
    if (window.firebaseAuth && navLoginBtn) {
        window.firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                navLoginBtn.href = 'dashboard.html';
                navLoginBtn.textContent = currentLang === 'en' ? translations['en']['nav.dashboard'] : translations['id']['nav.dashboard'];
            }
        });
    }

    function applyLanguage(lang) {
        // Simple element-based text replacement for demo purposes.
        // In a full enterprise app, we'd use data-i18n attributes on elements.

        // Navigation
        const navLinks = document.querySelectorAll('.nav-menu a');
        if (navLinks.length >= 4) {
            navLinks[0].textContent = translations[lang]['nav.features'];
            navLinks[1].textContent = translations[lang]['nav.performance'];
            navLinks[2].textContent = translations[lang]['nav.how'];
            navLinks[3].textContent = translations[lang]['nav.pricing'];
        }

        if (navLoginBtn && !window.firebaseAuth?.currentUser) {
            navLoginBtn.textContent = translations[lang]['nav.login'];
        }

        const navCtaBtn = document.getElementById('nav-cta-btn');
        if (navCtaBtn) navCtaBtn.textContent = translations[lang]['nav.cta'];

        // Hero
        const heroBadge = document.querySelector('.hero-badge span');
        if (heroBadge) heroBadge.textContent = translations[lang]['hero.badge'];

        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            heroTitle.innerHTML = `${translations[lang]['hero.title.pre']} <span class="gradient-text">${translations[lang]['hero.title.gradient']}</span>`;
        }

        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle) heroSubtitle.textContent = translations[lang]['hero.subtitle'];

        const demoBtn = document.querySelector('.hero-cta .btn-primary');
        if (demoBtn) demoBtn.innerHTML = `<i class="fas fa-play"></i> ${translations[lang]['hero.btn.demo']}`;

        const learnBtn = document.querySelector('.hero-cta .btn-secondary');
        if (learnBtn) learnBtn.innerHTML = `<i class="fas fa-info-circle"></i> ${translations[lang]['hero.btn.learn']}`;

        // Update Toggle Text
        if (currentLangText) {
            currentLangText.textContent = lang.toUpperCase();
        }
    }

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            currentLang = currentLang === 'id' ? 'en' : 'id';
            localStorage.setItem('eclipse_lang', currentLang);
            applyLanguage(currentLang);
        });
    }

    // Initialize
    applyLanguage(currentLang);
});
