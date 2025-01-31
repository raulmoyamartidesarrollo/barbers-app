import AppNavigator from './navigation/AppNavigator';
import { auth } from './services/Firebase';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; 
import { UserProvider } from './services/UserContext'; 
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
import { useFonts } from 'expo-font';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionsGranted, setPermissionsGranted] = useState(false); 
  const [permissionsRequested, setPermissionsRequested] = useState(false);

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
  
    if (existingStatus === 'denied') {
      Alert.alert(
        "Notificaciones Desactivadas",
        "Has desactivado las notificaciones. Para recibir notificaciones, habilítalas en la configuración del sistema."
      );
      setPermissionsRequested(true); // No solicitar permisos nuevamente
      return;
    }
  
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
  
    if (finalStatus === 'granted') {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo Push Token:', token);
      setPermissionsGranted(true);
    } else {
      Alert.alert(
        "Notificaciones Desactivadas",
        "Has desactivado las notificaciones. Puedes habilitarlas en la configuración del sistema."
      );
    }
  
    setPermissionsRequested(true); // No solicitar permisos nuevamente
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      // Solo registra las notificaciones si el usuario está logueado
      if (user && !permissionsRequested) {
        registerForPushNotificationsAsync();
      }
    });

    return () => unsubscribe(); // Limpiar el listener de Firebase
  }, [permissionsRequested]);

  if (loading) {
    return null; // Muestra un indicador de carga si es necesario
  }

  return (
    <UserProvider value={{ user }}>
      <PaperProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </UserProvider>
  );
};

export default App;