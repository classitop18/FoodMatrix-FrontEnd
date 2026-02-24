
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBVxyhXcdJSLVj95djitGgOHQWZUcBrI",
    authDomain: "foodmatrix-64771.firebaseapp.com",
    projectId: "foodmatrix-64771",
    storageBucket: "foodmatrix-64771.firebasestorage.app",
    messagingSenderId: "381741296749",
    appId: "1:381741296749:web:65554bf06ee49782826364",
    measurementId: "G-VGBZGS4DXT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);