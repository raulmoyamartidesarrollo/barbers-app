import AppNavigator from './navigation/AppNavigator';
import { app, auth, firestore} from './services/Firebase';
import {NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import LoginScreen from './screens/LoginScreen';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
          setLoading(false);
      });

      return () => unsubscribe(); // Limpia el listener
  }, []);

  if (loading) {
      // Puedes mostrar un indicador de carga aquí
      return null;
  }

  return (
      <NavigationContainer>
          {user ? <AppNavigator /> : <LoginScreen />}
      </NavigationContainer>
  );
};

export default App;