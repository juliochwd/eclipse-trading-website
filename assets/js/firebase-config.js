/**
 * Firebase Configuration & Demo Mode
 * Eclipse Delta Trading Platform
 *
 * - If Firebase credentials are real → Full Firebase Auth + Firestore
 * - If credentials are placeholder → Demo/Mock mode (sessionStorage-based auth)
 *
 * Demo Credentials: demo@eclipse.ai / demo123
 */

const firebaseConfig = {
    apiKey: "AIzaSyDol3Uulg9x8XXyEyPyh5fmHGY0bQr1YVE",
    authDomain: "eclipse-55b44.firebaseapp.com",
    projectId: "eclipse-55b44",
    storageBucket: "eclipse-55b44.firebasestorage.app",
    messagingSenderId: "419074122460",
    appId: "1:419074122460:web:862912407d2cc49d130a19",
    measurementId: "G-JP5VX9WKSY"
};

// Detect if this is a placeholder config
const IS_DEMO_MODE = firebaseConfig.apiKey === "YOUR_API_KEY";

let app, auth, db;

// ============================================================
// MOCK AUTH (Demo Mode)
// ============================================================
const DEMO_USERS = {
    'demo@eclipse.ai': { password: 'demo123', name: 'Demo Trader', role: 'user', uid: 'demo-uid-001' },
    'admin@eclipse.ai': { password: 'admin123', name: 'Admin Eclipse', role: 'admin', uid: 'admin-uid-001' }
};

const MOCK_AUTH_KEY = 'eclipse_demo_user';

const mockAuth = {
    _listeners: [],
    _currentUser: null,

    _init() {
        const saved = sessionStorage.getItem(MOCK_AUTH_KEY);
        if (saved) {
            this._currentUser = JSON.parse(saved);
        }
        // Notify listeners after a tick (simulates async)
        setTimeout(() => {
            this._listeners.forEach(cb => cb(this._currentUser));
        }, 100);
    },

    onAuthStateChanged(callback) {
        this._listeners.push(callback);
        const saved = sessionStorage.getItem(MOCK_AUTH_KEY);
        const user = saved ? JSON.parse(saved) : null;
        setTimeout(() => callback(user), 150);
        return () => { this._listeners = this._listeners.filter(l => l !== callback); };
    },

    async signInWithEmailAndPassword(email, password) {
        const user = DEMO_USERS[email.toLowerCase()];
        if (!user || user.password !== password) {
            const err = new Error('Demo auth: wrong credentials');
            err.code = 'auth/wrong-password';
            throw err;
        }
        const authUser = { uid: user.uid, email, displayName: user.name, photoURL: null };
        sessionStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(authUser));
        this._currentUser = authUser;
        this._listeners.forEach(cb => cb(authUser));
        return { user: authUser };
    },

    async createUserWithEmailAndPassword(email, password) {
        if (DEMO_USERS[email.toLowerCase()]) {
            const err = new Error('Email already in use');
            err.code = 'auth/email-already-in-use';
            throw err;
        }
        const uid = 'user-' + Date.now();
        const authUser = { uid, email, displayName: email.split('@')[0], photoURL: null };
        sessionStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(authUser));
        this._currentUser = authUser;
        this._listeners.forEach(cb => cb(authUser));
        return {
            user: {
                ...authUser,
                updateProfile: async ({ displayName }) => { authUser.displayName = displayName; },
                sendEmailVerification: async () => { }
            },
            additionalUserInfo: { isNewUser: true }
        };
    },

    async sendPasswordResetEmail(email) {
        // Demo: always succeed
        return true;
    },

    async setPersistence() { return; },

    async signOut() {
        sessionStorage.removeItem(MOCK_AUTH_KEY);
        this._currentUser = null;
        this._listeners.forEach(cb => cb(null));
    },

    signInWithPopup: async () => {
        // Simulate Google sign in with demo user
        const authUser = { uid: 'google-demo-001', email: 'google.demo@eclipse.ai', displayName: 'Google Demo User', photoURL: null };
        sessionStorage.setItem(MOCK_AUTH_KEY, JSON.stringify(authUser));
        mockAuth._currentUser = authUser;
        mockAuth._listeners.forEach(cb => cb(authUser));
        return { user: authUser, additionalUserInfo: { isNewUser: false } };
    }
};

// ============================================================
// MOCK FIRESTORE (Demo Mode)
// ============================================================
const mockDb = {
    _data: {},
    collection(name) {
        return {
            doc: (id) => ({
                get: async () => {
                    const key = `${name}/${id}`;
                    const val = this._data[key] || { role: 'user', trading: { balance: 15011.02, totalProfit: 15011.02, winRate: 61.7 } };
                    return { exists: true, data: () => val };
                },
                set: async (val) => { this._data[`${name}/${id}`] = val; },
                update: async (val) => {
                    const key = `${name}/${id}`;
                    this._data[key] = { ...this._data[key], ...val };
                }
            }),
            get: async () => ({
                docs: Object.entries(this._data)
                    .filter(([k]) => k.startsWith(name + '/'))
                    .map(([k, v]) => ({ id: k.split('/')[1], data: () => v, exists: true }))
            }),
            orderBy: () => ({ limit: () => ({ get: async () => ({ docs: [] }) }) })
        };
    }
};

// ============================================================
// INITIALIZE
// ============================================================
if (IS_DEMO_MODE) {
    console.warn('🔧 Eclipse: Running in DEMO MODE. No real Firebase credentials detected.');
    auth = mockAuth;
    db = mockDb;
    mockAuth._init();
} else {
    try {
        if (window.firebase) {
            app = firebase.initializeApp(firebaseConfig);
            auth = firebase.auth();
            db = firebase.firestore();
            console.log('✅ Firebase initialized successfully');
        }
    } catch (error) {
        console.error('Firebase init error:', error);
        auth = mockAuth;
        db = mockDb;
        mockAuth._init();
    }
}

// ============================================================
// GOOGLE AUTH PROVIDER (only if real firebase)
// ============================================================
if (!IS_DEMO_MODE && window.firebase) {
    window.GoogleAuthProvider = firebase.auth.GoogleAuthProvider;
} else {
    window.GoogleAuthProvider = function () { };
}

// Exports
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;
window.ECLIPSE_DEMO_MODE = IS_DEMO_MODE;

// Inject demo banner
if (IS_DEMO_MODE) {
    document.addEventListener('DOMContentLoaded', () => {
        const body = document.body;
        const existingBanner = document.getElementById('demo-mode-banner');
        if (existingBanner) return;

        const banner = document.createElement('div');
        banner.id = 'demo-mode-banner';
        banner.innerHTML = `
            <i class="fas fa-flask"></i>
            <strong>Demo Mode</strong> — Gunakan <code>demo@eclipse.ai</code> / <code>demo123</code> untuk login.
            <a href="https://console.firebase.google.com" target="_blank" rel="noopener">Setup Firebase →</a>
            <button onclick="this.parentElement.remove()" style="background:none;border:none;color:inherit;cursor:pointer;margin-left:auto;font-size:1rem;">✕</button>
        `;
        banner.style.cssText = `
            position:fixed; bottom:0; left:0; right:0; z-index:9999;
            background:linear-gradient(90deg,#1e293b,#334155);
            color:#f8fafc; padding:10px 20px; font-size:13px;
            display:flex; align-items:center; gap:10px;
            border-top:2px solid #6366f1;
        `;
        body.appendChild(banner);
    });
}
