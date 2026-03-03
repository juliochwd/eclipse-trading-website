// Firebase configuration placeholder
// Instructions: Copy .env.example to .env and replace with your Firebase project credentials
// Since this is a vanilla JS project running on GitHub Pages, we will use a global configuration object.
// IMPORTANT: In a production environment, you should secure your Firebase API keys and restrict domains in the Firebase Console.

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Check if Firebase is available in the global scope (imported via CDN in HTML)
let app, auth, db;

try {
    // Initialize Firebase
    if (window.firebase) {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        console.log("Firebase initialized successfully");
    } else {
        console.warn("Firebase SDK not detected. Make sure to include Firebase scripts in your HTML.");
    }
} catch (error) {
    console.error("Error initializing Firebase:", error);
}

// Export for other scripts if modules are used, otherwise rely on globals
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;
