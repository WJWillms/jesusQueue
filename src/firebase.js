// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHh1Y2L5NJ2GgBAmp1nqAs16fo6ixPOXY",
  authDomain: "jesusqueue.firebaseapp.com",
  databaseURL: "https://jesusqueue-default-rtdb.firebaseio.com",
  projectId: "jesusqueue",
  storageBucket: "jesusqueue.firebasestorage.app",
  messagingSenderId: "811923705970",
  appId: "1:811923705970:web:c8c9547e4504b98448f2eb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);