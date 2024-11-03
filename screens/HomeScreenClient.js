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

    const handleNavigation = (screen) => {
        navigation.navigate(screen);
    };

    const handleLogout = () => {
        Alert.alert(
            'Cerrar sesión',
            '¿Estás seguro de que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: () => {
                        signOut(auth).then(() => {
                            console.log('Sesión cerrada');
                            navigation.navigate('Login');
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
        <ImageBackground
            source={require('../assets/fondo_generico.png')}
            style={styles.backgroundImage}
            resizeMode='cover'
        >
            <View style={styles.overlay} />
            <View style={styles.container}>
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
                    {lastBooking.status === 'pendiente' && (
                        <TouchableOpacity style={styles.editOption} onPress={() => { /* Lógica para editar cita */ }}>
                            <Icon name="pencil" size={20} color="white" />
                            <Text style={styles.editText}>Editar cita</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.content}>
                    <TouchableOpacity style={styles.circleOption} onPress={() => handleNavigation('MybookingsClient')}>
                        <Icon name="calendar" size={30} color="black" />
                        <Text>Mis citas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.circleOption} onPress={() => handleNavigation('ClientRequestAppointment')}>
                        <Icon name="plus" size={30} color="black" />
                        <Text>Pedir cita</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.circleOption} onPress={() => handleNavigation('ClientMyAccountScreen')}>
                        <Icon name="user" size={30} color="black" />
                        <Text>Mi Cuenta</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.circleOption} onPress={() => handleNavigation('ClientHairSalonScreen')}>
                        <Icon name="scissors" size={30} color="black" />
                        <Text>Peluquería</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.circleOption} onPress={() => handleNavigation('ClientServicesScreen')}>
                        <Icon name="list" size={30} color="black" />
                        <Text>Servicios</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.circleOption} onPress={() => handleNavigation('ClientContactScreen')}>
                        <Icon name="phone" size={30} color="black" />
                        <Text>Contacto</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.logoutOption} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Cerrar sesión</Text>
                    <Icon name="sign-out" size={20} color="white" style={styles.logoutIcon} />
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        width: '80%', // Ocupa el 80% del ancho disponible
        marginLeft: '10%', // Margen izquierdo del 10%
        marginRight: '10%', // Margen derecho del 10%
        padding: 20,
        backgroundColor: 'rgba(169, 169, 169, 0.8)',
        borderRadius: 15,
        elevation: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
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
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    circleOption: {
        width: '28%',
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '2%',
        elevation: 3,
    },
    logoutOption: {
        width: '80%', // Ocupa el 80% del ancho
        marginLeft: '10%', // Margen izquierdo del 10%
        marginRight: '10%', // Margen derecho del 10%
        flexDirection: 'row', // Alineación horizontal
        justifyContent: 'center', // Centrar contenido
        alignItems: 'center', // Centrar verticalmente
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 55,
        elevation: 3,
    },
    logoutText: {
        color: '#000',
    },
    logoutIcon: {
        marginLeft: 20, // Separación de 5 entre el texto y el icono
        color: '#000',
    },
    editOption: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'black',
        borderRadius: 15,
        marginTop: 10,
        elevation: 3,
    },
    editText: {
        color: 'white',
        marginLeft: 5,
    },
});

