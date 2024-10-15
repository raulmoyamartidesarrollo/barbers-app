// services/HomeScreenClient.js
import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../services/Firebase'; // Asegúrate de importar auth desde Firebase
import { signOut } from 'firebase/auth'; // Importa signOut desde Firebase Auth
import { useUser } from '../services/UserContext';

export default function HomeScreenClient() {
    const navigation = useNavigation();

    const lastBooking = {
        date: '2024-10-15',
        time: '14:00',
        service: 'Corte de cabello',
        status: 'realizada',
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'realizada':
                return 'green';
            case 'pendiente':
                return 'orange';
            case 'cancelada':
                return 'red';
            default:
                return 'black';
        }
    };

    const handleMyBookings = () => {
        navigation.navigate('MybookingsClient');
    };

    const handleBookingNow = () => {
        navigation.navigate('BookingNow');
    };

    const handleMyAccount = () => {
        navigation.navigate('ClientMyAccountScreen');
    };

    const handleHairSalon = () => {
        navigation.navigate('ClientHairSalonScreen');
    };

    const handleServices = () => {
        navigation.navigate('ClientServicesScreen');
    };

    const handleContact = () => {
        navigation.navigate('ClientContactScreen');
    };

 
    const handleLogout = () => {
      Alert.alert(
          'Cerrar sesión',
          '¿Estás seguro de que deseas cerrar sesión?',
          [
              {
                  text: 'Cancelar',
                  style: 'cancel',
              },
              {
                  text: 'Confirmar',
                  onPress: () => {
                      signOut(auth).then(() => {
                          console.log('Sesión cerrada');
                          logout(); // Llama a la función logout para restablecer el estado
                          navigation.navigate('Login'); // Asegúrate de usar el nombre correcto aquí
                      }).catch((error) => {
                          console.error('Error al cerrar sesión:', error);
                      });
                  },
              },
          ],
          { cancelable: false }
      );
  };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {}}>
                    <Icon name="user" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.imageContainer}>
                <ImageBackground
                    source={require('../assets/background.jpg')}
                    style={styles.backgroundImage}
                    resizeMode='cover'
                >
                    <View style={styles.overlay} />

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Última cita</Text>
                        <Text style={styles.cardText}>Fecha: {lastBooking.date}</Text>
                        <Text style={styles.cardText}>Hora: {lastBooking.time}</Text>
                        <Text style={styles.cardText}>Servicio: {lastBooking.service}</Text>
                        <Text style={styles.cardText}>
                            Estado: <Text style={[styles.cardStatus, { color: getStatusColor(lastBooking.status) }]}>
                                {lastBooking.status}
                            </Text>
                        </Text>
                    </View>
                </ImageBackground>
            </View>

            <View style={styles.content}>
                <TouchableOpacity style={styles.circleOption} onPress={handleMyBookings}>
                    <Icon name="calendar" size={30} color="black" />
                    <Text>Mis citas</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.circleOption} onPress={handleBookingNow}>
                    <Icon name="plus" size={30} color="black" />
                    <Text>Pedir cita</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.circleOption} onPress={handleMyAccount}>
                    <Icon name="user" size={30} color="black" />
                    <Text>Mi Cuenta</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.circleOption} onPress={handleHairSalon}>
                    <Icon name="scissors" size={30} color="black" />
                    <Text>Peluquería</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.circleOption} onPress={handleServices}>
                    <Icon name="list" size={30} color="black" />
                    <Text>Servicios</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.circleOption} onPress={handleContact}>
                    <Icon name="phone" size={30} color="black" />
                    <Text>Contacto</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutOption} onPress={handleLogout}>
                <Icon name="sign-out" size={20} color="white" />
                <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        backgroundColor: 'black',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    card: {
        position: 'absolute',
        top: '50%',
        left: '5%',
        right: '5%',
        marginTop: -100,
        padding: 20,
        backgroundColor: 'rgba(169, 169, 169, 0.8)',
        borderRadius: 15,
        elevation: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#fff',
    },
    cardText: {
        fontSize: 16,
        color: '#fff',
        marginVertical: 5,
    },
    cardStatus: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 20,
    },
    circleOption: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 10,
        elevation: 3,
    },
    logoutOption: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'black', // Fondo negro
        borderRadius: 15,
        margin: 10,
        elevation: 3,
    },
    logoutText: {
        color: 'white', // Texto blanco
        marginLeft: 5,
    },
    separator: {
        height: 3,
        backgroundColor: 'black',
        marginVertical: 10,
    },
    credits: {
        textAlign: 'center',
        color: 'black',
        marginVertical: 10,
    },
});