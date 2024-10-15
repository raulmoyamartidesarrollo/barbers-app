import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

export default function ClientBottomNavigation() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Inicio" component={HomeScreenClient} />
      <Tab.Screen name="Servicios" component={ClientServicesScreen} />
      <Tab.Screen name="Pedir Cita" component={ClientRequestAppointmentScreen} />
      <Tab.Screen name="Mi Cuenta" component={ClientMyAccountScreen} />
      <Tab.Screen name="Peluquería" component={ClientBarberShopScreen} />
    </Tab.Navigator>
  );
}