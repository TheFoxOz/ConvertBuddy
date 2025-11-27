// scripts/firebase.js - Unified Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzVq-WhSd4w5oYp3S0LgJm4u2qxLqf-9Q",
  authDomain: "covertbuddy-c8b99.firebaseapp.com",
  projectId: "covertbuddy-c8b99",
  storageBucket: "covertbuddy-c8b99.firebasestorage.app",
  messagingSenderId: "826662486676",
  appId: "1:826662486676:web:988294692da3836d73aa81",
  measurementId: "G-1GXL1GWBL5"
};

// Initialize Firebase
let app;
let db;
let auth;
let analytics = null;
let isInitialized = false;

/**
 * Initialize Firebase services (called on first use)
 */
export async function initializeFirebase() {
  if (isInitialized) {
    return { app, db, auth, analytics };
  }

  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    // Sign in anonymously for history storage
    await signInAnonymously(auth);
    
    // Analytics (optional, may fail in some browsers)
    try {
      analytics = getAnalytics(app);
    } catch (e) {
      console.warn("Analytics not supported:", e);
    }

    isInitialized = true;
    console.log("Firebase initialized successfully");
    
    return { app, db, auth, analytics };
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    throw error;
  }
}

// Auto-initialize (but don't block)
initializeFirebase().catch(err => console.warn("Firebase auto-init failed:", err));

// Export instances (will be undefined until initialized)
export { app, db, auth, analytics };
