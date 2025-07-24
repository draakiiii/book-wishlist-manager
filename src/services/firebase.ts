// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNVULfkfb77peQh7Y_LEguqNOiWSAHF5w",
  authDomain: "book-manager-1861b.firebaseapp.com",
  projectId: "book-manager-1861b",
  storageBucket: "book-manager-1861b.firebasestorage.app",
  messagingSenderId: "899173432766",
  appId: "1:899173432766:web:0ce14cfb20f0c2a2d94def",
  measurementId: "G-WQ0RP6111V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('Firebase initialized successfully');

export { app, analytics, auth, db };