import AppNavigator from './navigation/AppNavigator';
import { auth } from './services/Firebase';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { UserProvider } from './services/UserContext'; // Importa el contexto de usuario

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
    return null; // Muestra un indicador de carga si es necesario
  }

  return (
    <UserProvider value={{ user }}>
      <PaperProvider>
        <NavigationContainer>
          <AppNavigator/> 
        </NavigationContainer>
      </PaperProvider>
    </UserProvider>
  );
};

export default App;