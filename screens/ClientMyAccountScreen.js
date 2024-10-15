import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ImageBackground, Switch, Image, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useUser } from '../services/UserContext'; // Asegúrate de que la ruta sea correcta
import { MaterialIcons } from '@expo/vector-icons'; // Asegúrate de tener la biblioteca de íconos instalada
import { useNavigation } from '@react-navigation/native'; // Asegúrate de tener react-navigation instalado
import avatar from '../assets/avatar.png'; // Importa la imagen de avatar

const ClientMyAccountScreen = () => {
    const { userId } = useUser(); // Usa el hook para obtener userId
    const navigation = useNavigation(); // Hook para la navegación

    // Estado para los campos editables
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [receiveNotifications, setReceiveNotifications] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userImage, setUserImage] = useState(null); // Estado para la imagen del usuario

    // Función para manejar el guardado de datos
    const handleSave = () => {
        console.log('Datos guardados:', { name, surname, email, phone, receiveNotifications, password });
    };

    const handleGoBack = () => {
        navigation.navigate('HomeScreenClient'); // Navega a HomeScreenClient
    };

    return (
        <ImageBackground
            source={require('../assets/background.jpg')} // Asegúrate de que la ruta de la imagen sea correcta
            style={styles.background}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <ScrollView >
                        <Text style={styles.title}>Mi Cuenta</Text>
                        
                        {/* Imagen de usuario */}
                        <View style={styles.imageContainer}>
                            <Image
                                source={userImage ? { uri: userImage } : avatar} // Muestra la imagen del usuario o el avatar por defecto
                                style={styles.userImage}
                            />
                            <TouchableOpacity style={styles.cameraButton}>
                                <MaterialIcons name="camera-alt" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
        
                        {userId ? (
                            <View style={styles.userInfo}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nombre"
                                    value={name}
                                    onChangeText={setName}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Apellidos"
                                    value={surname}
                                    onChangeText={setSurname}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Teléfono"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />
                                <View style={styles.switchContainer}>
                                    <Text style={styles.switchLabel}>Recibir Notificaciones</Text>
                                    <Switch
                                        value={receiveNotifications}
                                        onValueChange={setReceiveNotifications}
                                    />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Contraseña"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirmar Contraseña"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                />
                                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                    <Text style={styles.saveButtonText}>Guardar Datos</Text>
                                </TouchableOpacity>
        
                                {/* Botón para volver atrás */}
                                <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                                    <Text style={styles.backButtonText}>Volver</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Text style={styles.message}>No hay usuario logeado.</Text>
                        )}
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        flexGrow: 1,
        backgroundColor: 'rgba(211, 211, 211, 0.8)', // Gris claro al 80% de opacidad
        width: '90%', // Cambiado a 80%
        height: '70%', // Altura al 80% de la pantalla
        marginHorizontal: 10, // Márgenes izquierdo y derecho de 10
        marginVertical: 100, // Márgenes superior e inferior de 10
        borderRadius: 10,
        padding: 20,
        borderColor: 'black',
        borderWidth: 5, // Borde negro
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    userImage: {
        width: 100,
        height: 100,
        borderRadius: 50, // Imagen circular
        marginBottom: -30, // Para superponer el botón
    },
    cameraButton: {
        position: 'absolute',
        bottom: -20,
        right: 100,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 5,
        elevation: 3, // Sombra para el botón
    },
    userInfo: {
        marginTop: 10,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    switchLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: 'black',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
    },
    backButton: {
        backgroundColor: 'white',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20, // Espaciado superior para el botón de volver
    },
    backButtonText: {
        color: 'black',
        fontSize: 18,
    },
    message: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center',
    },
});

export default ClientMyAccountScreen