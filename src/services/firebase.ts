// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCjxTUYzhtM-WkZNpiDfOBgiZ5Frh0E0w4",
  authDomain: "projectt01-cvvh-damsen.firebaseapp.com",
  projectId: "projectt01-cvvh-damsen",
  storageBucket: "projectt01-cvvh-damsen.appspot.com",
  messagingSenderId: "448164861081",
  appId: "1:448164861081:web:1334fbda741e659ba85408",
  measurementId: "G-20JMK5TK0F",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
