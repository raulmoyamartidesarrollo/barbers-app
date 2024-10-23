import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD8p3M6xhMZHY6wXazA-KWaiEAbwzxXm0E",
  authDomain: "fir-app-barbers.firebaseapp.com",
  projectId: "fir-app-barbers",
  storageBucket: "fir-app-barbers.appspot.com",
  messagingSenderId: "402857061695",
  appId: "1:402857061695:web:f388c39a2906b13f26778a",
  measurementId: "G-MQHQJK10DZ"
};

// Inicializar Firebase solo si no ha sido inicializado previamente
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();  // Si ya está inicializado, lo reutilizamos
}

// Inicializar Firebase Auth con persistencia si no ha sido inicializado
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  if (e.code === 'auth/already-initialized') {
    auth = getAuth(app);  // Si ya está inicializado, lo reutilizamos
  } else {
    console.error('Error inicializando Firebase Auth:', e);
  }
}

// Inicializar Firestore
const db = getFirestore(app);

export { auth, db };