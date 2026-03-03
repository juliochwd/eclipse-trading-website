const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const targetNav = `<div class="nav-cta">
                <a href="#contact" class="btn btn-primary">Mulai Sekarang</a>
            </div>`;
const replacementNav = `<div class="nav-cta">
                <a href="login.html" class="btn btn-outline" id="nav-login-btn">Masuk</a>
                <a href="#contact" class="btn btn-primary" id="nav-cta-btn">Mulai Sekarang</a>
                <button id="lang-toggle" class="btn btn-outline" style="padding: 0.5rem 1rem; margin-left: 0.5rem;" title="Switch Language">
                    <i class="fas fa-globe"></i> <span id="current-lang">ID</span>
                </button>
            </div>`;

html = html.replace(targetNav, replacementNav);

// Add Firebase and i18n scripts before the end of body
const scriptTag = `<script src="assets/js/app.js"></script>`;
const newScripts = `
    <!-- Firebase SDKs -->
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>

    <!-- Custom Scripts -->
    <script src="assets/js/firebase-config.js"></script>
    <script src="assets/js/i18n.js"></script>
    <script src="assets/js/app.js"></script>
`;

html = html.replace(scriptTag, newScripts);

fs.writeFileSync('index.html', html);
