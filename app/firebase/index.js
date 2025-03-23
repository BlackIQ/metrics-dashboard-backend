import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCcpEGZ7zXjxAE1oxXcyDA-M6xDwfeyQb0",
  authDomain: "openhubble-cloud.firebaseapp.com",
  projectId: "openhubble-cloud",
  storageBucket: "openhubble-cloud.firebasestorage.app",
  messagingSenderId: "630599906091",
  appId: "1:630599906091:web:e157d67c4ef29e38ac0b6e",
  measurementId: "G-SGS0TFX63V",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { app, auth, analytics };
