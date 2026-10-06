// Import only the parts of Firebase we use
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAaR5pXiWGsyI3_1ZCEWIuP74TmEAjhZck",
  authDomain: "at-bat.firebaseapp.com",
  projectId: "at-bat",
  storageBucket: "at-bat.firebasestorage.app",
  messagingSenderId: "282329602776",
  appId: "1:282329602776:web:bdfc488344fb4c543a55ad",
  measurementId: "G-9CZL8DSD0F"
};

// Start Firebase once, and share the login part with the rest of the app
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)