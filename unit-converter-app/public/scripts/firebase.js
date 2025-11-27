// scripts/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAzVq-WhSd4w5oYp3S0LgJm4u2qxLqf-9Q",
  authDomain: "covertbuddy-c8b99.firebaseapp.com",
  projectId: "covertbuddy-c8b99",
  storageBucket: "covertbuddy-c8b99.firebasestorage.app",
  messagingSenderId: "826662486676",
  appId: "1:826662486676:web:988294692da3836d73aa81",
  measurementId: "G-1GXL1GWBL5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn("Analytics not supported:", e);
}

export { app, analytics, db };
