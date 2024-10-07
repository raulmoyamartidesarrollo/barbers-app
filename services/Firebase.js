import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import React from 'react';
import { View } from 'react-native';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native'; // Asegúrate de tener React Navigation configurado
import AppNavigator from '../navigation/AppNavigator';


const firebaseConfig = {
    apiKey: "AIzaSyD8p3M6xhMZHY6wXazA-KWaiEAbwzxXm0E",
    authDomain: "fir-app-barbers.firebaseapp.com",
    projectId: "fir-app-barbers",
    storageBucket: "fir-app-barbers.appspot.com",
    messagingSenderId: "402857061695",
    appId: "1:402857061695:web:f388c39a2906b13f26778a",
    measurementId: "G-MQHQJK10DZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, auth, firestore };


