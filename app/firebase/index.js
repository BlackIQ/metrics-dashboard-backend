// Firebase
import { initializeApp } from "firebase/app";

// Authentication imports
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCcpEGZ7zXjxAE1oxXcyDA-M6xDwfeyQb0",
  authDomain: "openhubble-cloud.firebaseapp.com",
  projectId: "openhubble-cloud",
  storageBucket: "openhubble-cloud.firebasestorage.app",
  messagingSenderId: "630599906091",
  appId: "1:630599906091:web:e157d67c4ef29e38ac0b6e",
  measurementId: "G-SGS0TFX63V",
};

// App
const app = initializeApp(firebaseConfig);

// Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Exports
export { app, auth, googleProvider };
