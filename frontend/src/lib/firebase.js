import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAlxZVGARWULUKoSTyriLeHGrGeki17qNA",
  authDomain: "laporkeun-chat.firebaseapp.com",
  projectId: "laporkeun-chat",
  storageBucket: "laporkeun-chat.firebasestorage.app",
  messagingSenderId: "224405993757",
  appId: "1:224405993757:web:23cedbd5c921285d95c9f4",
  measurementId: "G-JC123E5XP0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);