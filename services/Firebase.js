import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import React from 'react';
import { View } from 'react-native';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native'; // Asegúrate de tener React Navigation configurado
import AppNavigator from '../navigation/AppNavigator';


const firebaseConfig = {
    apiKey: 'AIzaSyDPMgqcXtH8YI7VFmV8jjgY6KyUvN6TMy0',
    authDomain: 'new-barberia-app.firebaseapp.com',
    projectId: 'new-barberia-app',
    storageBucket: 'new-barberia-app.appspot.com',
    messagingSenderId: '438437046396',
    appId: '1:438437046396:web:someappid',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, auth, firestore };