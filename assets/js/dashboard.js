/**
 * Dashboard Module
 * Handles UI interactions, Chart.js initialization, and real-time data updates
 */

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const userDisplayNames = document.querySelectorAll('.user-display-name');
    const userRoleDisplays = document.querySelectorAll('.user-display-role');
    const userAvatars = document.querySelectorAll('.user-avatar');
    const logoutBtn = document.getElementById('dashboard-logout');

    // Sidebar Toggle for Mobile
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }

    // Auth State Check & User Data Load
    if (window.firebaseAuth) {
        window.firebaseAuth.onAuthStateChanged(async (user) => {
            if (!user) {
                window.location.href = 'login.html';
                return;
            }

            // Update UI with basic user info
            const displayName = user.displayName || user.email.split('@')[0];
            userDisplayNames.forEach(el => el.textContent = displayName);

            const initials = displayName.substring(0, 2).toUpperCase();
            userAvatars.forEach(el => el.textContent = initials);

            // Fetch extra user data from Firestore if available
            if (window.firebaseDb) {
                try {
                    const doc = await window.firebaseDb.collection('users').doc(user.uid).get();
                    if (doc.exists) {
                        const data = doc.data();
                        userRoleDisplays.forEach(el => el.textContent = data.role === 'admin' ? 'Administrator' : 'Trader');

                        // Update overview cards if user has trading data saved
                        if(data.trading) {
                            // Update values here if desired, otherwise rely on mock data simulation below
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        });
    }

    // Logout
    if (logoutBtn && window.firebaseAuth) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await window.firebaseAuth.signOut();
            } catch (error) {
                console.error("Logout error:", error);
            }
        });
    }

    // ------------------------------------------------------------------------
    // Chart.js Initialization (Performance Chart)
    // ------------------------------------------------------------------------
    const ctx = document.getElementById('performance-chart');
    if (ctx && window.Chart) {
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.font.family = "'Inter', sans-serif";

        const performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'P&L ($)',
                    data: [2500, 3800, 3200, 5100, 7800, 10500, 15011.02],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#6366f1',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#1e293b',
                        titleColor: '#f8fafc',
                        bodyColor: '#e2e8f0',
                        borderColor: '#334155',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    // ------------------------------------------------------------------------
    // Simulate Real-time Data Updates (Mocking Firestore listeners)
    // ------------------------------------------------------------------------
    const currentPriceMNQ = document.getElementById('price-mnq');
    const pnlMNQ = document.getElementById('pnl-mnq');

    // Simulate MNQ price movement
    if (currentPriceMNQ && pnlMNQ) {
        let basePrice = 17540.25;
        let entryPrice = 17520.50;

        setInterval(() => {
            // Random walk simulation
            const change = (Math.random() - 0.45) * 2; // slight upward bias
            basePrice += change;

            // Calculate PnL (simulated multiplier 2)
            const pnl = (basePrice - entryPrice) * 2;

            // Update UI
            currentPriceMNQ.textContent = basePrice.toFixed(2);
            pnlMNQ.textContent = (pnl >= 0 ? '+$' : '-$') + Math.abs(pnl).toFixed(2);

            if (pnl >= 0) {
                pnlMNQ.className = 'text-success font-weight-bold';
            } else {
                pnlMNQ.className = 'text-danger font-weight-bold';
            }
        }, 2000);
    }
});
