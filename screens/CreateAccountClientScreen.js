import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth, db, firestore } from '../services/Firebase'; // Importa 'auth' y 'db' correctamente
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Importa el método para crear usuario
import { doc, setDoc } from 'firebase/firestore'; // Importa los métodos para Firestore
import colors from '../services/colors'; // Asegúrate de que la ruta sea correcta

const CreateAccountClientScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleCreateAccount = async () => {
        // Verificar que el email no esté vacío
        if (!email) {
            Alert.alert('Error', 'Por favor ingresa un correo electrónico.');
            return;
        }

        // Verificar que el formato del email sea correcto
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Por favor ingresa un correo electrónico válido.');
            return;
        }

        // Verificar que las contraseñas coincidan
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden.');
            return;
        }

        try {
            // Crear cuenta con Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Cuenta creada exitosamente:", user);

            // Crear un documento en la colección 'usaurios'
            await setDoc(doc(firestore, 'usuarios', user.uid), {
                apellidos: '',
                email: user.email, // Usa el email del registro
                nombre: '',
                telefono: '',
               
            });

            // Solo redirigir al HomeScreenClient si se crea el usuario en Firestore
            Alert.alert(
                'Registro exitoso',
                'Te has registrado correctamente.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Redirigir al usuario a HomeScreenClient
                            navigation.navigate('HomeScreenClient');
                        }
                    }
                ]
            );
        } catch (error) {
            // Manejo de errores durante la creación de la cuenta
            console.error("Error al crear cuenta:", error);
            Alert.alert('Error', error.message);
        }
    };

    return (
        <ImageBackground 
            source={require('../assets/background.jpg')} 
            style={styles.background}
        >
            <View style={styles.overlay} />
            <View style={styles.container}>
                <Text style={styles.title}>Crear Cuenta</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#888" // Color del placeholder
                />
                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor="#888" // Color del placeholder
                />
                <TextInput
                    style={styles.input}
                    placeholder="Confirmar Contraseña"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholderTextColor="#888" // Color del placeholder
                />
                <TouchableOpacity
                    onPress={handleCreateAccount}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Crear Cuenta</Text>
                </TouchableOpacity>
                <View style={styles.separatorContainer}>
                    <View style={styles.separator} />
                    <Text style={styles.separatorText}>ó</Text>
                    <View style={styles.separator} />
                </View>
                <Text style={styles.socialText}>Crear cuenta con</Text>
                <View style={styles.socialButtons}>
                    <TouchableOpacity style={styles.socialButton}>
                        <FontAwesome name="google" size={24} color="red" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                        <FontAwesome name="facebook" size={24} color="blue" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                        <FontAwesome name="apple" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(128, 128, 128, 0.5)', // Capa gris transparente
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16, // Espaciado interno
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
        color: colors.white, // Color del texto del título
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 25, // Separación de 5 entre los inputs
        paddingHorizontal: 8,
        backgroundColor: '#fff', // Fondo blanco para los inputs
        borderRadius: 5, // Esquinas redondeadas
    },
    button: {
        backgroundColor: colors.primary, // Usar color negro
        padding: 10,
        borderRadius: 25,
        marginBottom: 12,
    },
    buttonText: {
        color: colors.white, // Texto blanco
        textAlign: 'center',
        fontSize: 16,
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10, // Ajustado para estar más juntos
    },
    separator: {
        flex: 1,
        height: 1,
        backgroundColor: '#ccc',
    },
    separatorText: {
        marginHorizontal: 8,
        fontSize: 16,
        color: '#888',
    },
    socialText: {
        textAlign: 'center',
        marginVertical: 10, // Espaciado superior e inferior
        fontSize: 16,
        color: colors.white,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    socialButton: {
        padding: 15,
        backgroundColor:'#000',
        borderRadius:'50'
    },
});

export default CreateAccountClientScreen;