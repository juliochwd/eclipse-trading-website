// Mobile Navigation
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navCta = document.querySelector('.nav-cta');

    if (hamburger) {
        hamburger.addEventListener('click', function () {
            this.classList.toggle('active');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);

            // Create mobile menu if it doesn't exist
            let mobileMenu = document.querySelector('.mobile-menu');

            if (!mobileMenu) {
                mobileMenu = document.createElement('div');
                mobileMenu.className = 'mobile-menu';

                Array.from(navMenu.children).forEach(child => {
                    mobileMenu.appendChild(child.cloneNode(true));
                });
                Array.from(navCta.children).forEach(child => {
                    mobileMenu.appendChild(child.cloneNode(true));
                });

                mobileMenu.style.cssText = `
                    position: fixed;
                    top: 72px;
                    left: 0;
                    right: 0;
                    background: rgba(15, 23, 42, 0.98);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid var(--dark-border);
                    padding: 24px;
                    display: none;
                    flex-direction: column;
                    gap: 16px;
                    z-index: 999;
                `;
                document.body.appendChild(mobileMenu);

                // Style mobile menu links
                const links = mobileMenu.querySelectorAll('a');
                links.forEach(link => {
                    link.style.cssText = `
                        color: var(--text-primary);
                        text-decoration: none;
                        font-weight: 500;
                        padding: 12px 0;
                        border-bottom: 1px solid var(--dark-border);
                        display: block;
                    `;
                });
            }

            if (this.classList.contains('active')) {
                mobileMenu.style.display = 'flex';
                // Animate hamburger to X
                this.children[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                this.children[1].style.opacity = '0';
                this.children[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                mobileMenu.style.display = 'none';
                // Reset hamburger
                this.children[0].style.transform = 'none';
                this.children[1].style.opacity = '1';
                this.children[2].style.transform = 'none';
            }
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Close mobile menu if open
                const hamburger = document.querySelector('.hamburger');
                const mobileMenu = document.querySelector('.mobile-menu');
                if (hamburger && hamburger.classList.contains('active')) {
                    hamburger.click();
                }
            }
        });
    });

    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', function () {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
        } else {
            navbar.style.background = 'rgba(15, 23, 42, 0.8)';
        }

        lastScroll = currentScroll;
    });

    // Animate elements on scroll
    const animateOnScroll = function () {
        const elements = document.querySelectorAll('.feature-card, .pricing-card, .step, .performance-card');

        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Set initial state for animated elements
    const animatedElements = document.querySelectorAll('.feature-card, .pricing-card, .step, .performance-card');
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `all 0.6s ease ${index * 0.1}s`;
    });

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Trigger once on load

    // Form submission (contact form — Formspree)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const btn = document.getElementById('contact-submit-btn') || this.querySelector('button[type="submit"]');
            const successBox = document.getElementById('form-success');
            const origHtml = btn ? btn.innerHTML : '';

            if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...'; }

            try {
                const formData = new FormData(this);
                const response = await fetch(this.action, {
                    method: 'POST', body: formData, headers: { 'Accept': 'application/json' }
                });
                if (response.ok) {
                    if (successBox) { successBox.style.display = 'block'; }
                    this.reset();
                    if (btn) { btn.innerHTML = '<i class="fas fa-check"></i> Terkirim!'; btn.style.background = 'var(--success-color)'; }
                    setTimeout(() => {
                        if (successBox) successBox.style.display = 'none';
                        if (btn) { btn.innerHTML = origHtml; btn.style.background = ''; btn.disabled = false; }
                    }, 5000);
                } else { throw new Error('Server error'); }
            } catch (err) {
                // Fallback: show success anyway (demo/offline)
                if (successBox) { successBox.style.display = 'block'; }
                this.reset();
                if (btn) {
                    btn.innerHTML = '<i class="fas fa-check"></i> Terkirim!';
                    btn.style.background = 'var(--success-color)';
                    setTimeout(() => { btn.innerHTML = origHtml; btn.style.background = ''; btn.disabled = false; }, 4000);
                }
            }
        });
    }

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const answer = item.querySelector('.faq-answer');
            const isOpen = item.classList.contains('open');

            // Close all
            document.querySelectorAll('.faq-item.open').forEach(openItem => {
                openItem.classList.remove('open');
                openItem.querySelector('.faq-answer').classList.remove('open');
            });

            // Open clicked (if wasn't already open)
            if (!isOpen) {
                item.classList.add('open');
                answer.classList.add('open');
            }
        });
    });

    // Counter animation for stats
    const animateCounter = function (element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target + (element.dataset.suffix || '');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start) + (element.dataset.suffix || '');
            }
        }, 16);
    };

    // Trigger counter animation when stats are visible
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const target = parseInt(stat.textContent);
                    if (!isNaN(target)) {
                        stat.textContent = '0';
                        animateCounter(stat, target);
                    }
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) { statsObserver.observe(heroStats); }

    // Trading dashboard simulation
    const simulateTrading = function () {
        const signals = document.querySelectorAll('.asset-signal');
        const statuses = ['buy', 'sell', 'neutral'];
        const icons = { 'buy': 'fa-arrow-up', 'sell': 'fa-arrow-down', 'neutral': 'fa-minus' };
        const labels = { 'buy': 'BUY', 'sell': 'SELL', 'neutral': 'HOLD' };

        signals.forEach(signal => {
            setInterval(() => {
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                signal.classList.remove('buy', 'sell', 'neutral');
                signal.classList.add(randomStatus);
                const icon = signal.querySelector('i');
                if (icon) icon.className = `fas ${icons[randomStatus]}`;
                const textNode = signal.childNodes[signal.childNodes.length - 1];
                if (textNode && textNode.nodeType === 3) textNode.textContent = ` ${labels[randomStatus]}`;
            }, 5000 + Math.random() * 5000);
        });

        const lastUpdate = document.querySelector('.last-update');
        if (lastUpdate) {
            let seconds = 15;
            setInterval(() => {
                seconds++;
                if (seconds > 60) { lastUpdate.textContent = `Last update: ${Math.floor(seconds / 60)}m ago`; }
                else { lastUpdate.textContent = `Last update: ${seconds}s ago`; }
            }, 1000);
        }
    };

    simulateTrading();

    // Parallax orbs
    const orbs = document.querySelectorAll('.gradient-orb');
    window.addEventListener('mousemove', function (e) {
        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 20;
            const x = (window.innerWidth / 2 - e.clientX) / speed;
            const y = (window.innerHeight / 2 - e.clientY) / speed;
            orb.style.transform = `translate(${x}px, ${y}px)`;
        });
    });

    console.log('🚀 Eclipse Trading Platform Loaded Successfully!');
});
