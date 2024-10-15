// services/Firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, signOut} from 'firebase/auth'; // Cambiado para usar initializeAuth
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Asegúrate de tener AsyncStorage instalado

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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firebase Auth con persistencia
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage), // Configura la persistencia con AsyncStorage
});

// Inicializar Firestore
const firestore = getFirestore(app);

export { auth, firestore };