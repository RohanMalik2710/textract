//firebase.config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD2J7-TIhiUIRRWecuzZd6vrypIQXopbM0",
  authDomain: "water-watch-83148.firebaseapp.com",
  projectId: "water-watch-83148",
  storageBucket: "water-watch-83148.appspot.com",
  messagingSenderId: "648813457450",
  appId: "1:648813457450:web:68b1b43dbbce2ddca25353",
  measurementId: "G-H30ZDFL27G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
