import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCfGQujN0CPsesm07GtF83bux-xSZ_VJCQ",
    authDomain: "dodohabitweb.firebaseapp.com",
    projectId: "dodohabitweb",
    storageBucket: "dodohabitweb.firebasestorage.app",
    messagingSenderId: "242856787428",
    appId: "1:242856787428:web:a782381665a938eb4c5bf1",
    measurementId: "G-LQ78FG9K12"
};

console.log("Firebase Config Loaded:", {
    apiKey: firebaseConfig.apiKey ? "Present" : "MISSING",
    projectId: firebaseConfig.projectId,
    fullConfig: firebaseConfig
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
