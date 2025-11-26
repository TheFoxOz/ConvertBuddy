// scripts/firebase.js

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
// Import other Firebase services when needed:
// import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
// import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

// Your Firebase configuration
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
const app = initializeApp(firebaseConfig);

// Optional analytics
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn("Analytics not supported in this environment");
}

export { app, analytics };
