// appNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreenClient from '../screens/HomeScreenClient';
import AdminHomeScreen from '../screens/AdminHomeScreen';
import LoginScreen from '../screens/LoginScreen'; // Asegúrate de que esta importación sea correcta
import CreateAccountClientScreen from '../screens/CreateAccountClientScreen';
import ClientMyAccountScreen from '../screens/ClientMyAccountScreen';
import { useUser } from '../services/UserContext';
import ClientServicesScreen from '../screens/ClientServicesScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// BottomTabNavigator para clientes
function ClientTabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="HomeScreenClient" component={HomeScreenClient} />
    </Tab.Navigator>
  );
}

// StackNavigator principal
export default function AppNavigator() {
  const { userId } = useUser();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userId ? (        
        <>
          <Stack.Screen name="ClientTabs" component={ClientTabNavigator} />
          <Stack.Screen name="AdminHomeScreen" component={AdminHomeScreen} />
          <Stack.Screen name="ClientMyAccountScreen" component={ClientMyAccountScreen} />
          <Stack.Screen name="ClientServicesScreen" component={ClientServicesScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="CreateAccountClientScreen" component={CreateAccountClientScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}