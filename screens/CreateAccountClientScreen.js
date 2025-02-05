import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Image, ImageBackground } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth, db, firestore } from '../services/Firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import colors from '../services/colors';
import * as Google from 'expo-auth-session/providers/google';

const CreateAccountClientScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleCreateAccount = async () => {
        if (!email) {
            Alert.alert('Error', 'Por favor ingresa un correo electrónico.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Por favor ingresa un correo electrónico válido.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden.');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Cuenta creada exitosamente:", user);

            await setDoc(doc(firestore, 'usuarios', user.uid), {
                apellidos: '',
                email: user.email,
                nombre: '',
                telefono: '',
            });

            Alert.alert(
                'Registro exitoso',
                'Te has registrado correctamente.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.navigate('HomeScreenClient');
                        }
                    }
                ]
            );
        } catch (error) {
            console.error("Error al crear cuenta:", error);
            Alert.alert('Error', error.message);
        }
    };

    return (
        <ImageBackground 
            source={require('../assets/fondo_generico.png')} 
            style={styles.background}
        >
            {/* Botón de volver atrás */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <FontAwesome name="arrow-left" size={24} color="#fff" />
                <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>

            <View style={styles.container}>
                <Text style={styles.title}>Crear Cuenta</Text>
                <Image source={require('../assets/logo_sin_fondo_blanco.png')} style={styles.logo} />

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#fff"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor="#fff"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Confirmar Contraseña"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholderTextColor="#fff"
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
    backButton: {
        position: 'absolute',
        top: 40,  // Ajuste para la parte superior de la pantalla
        left: 20, // Ajuste para la parte izquierda de la pantalla
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButtonText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 16,
    },
    container: {
        justifyContent: 'center',
        padding: 16,
        alignItems: 'center',
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
        color: '#fff',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 25,
        paddingHorizontal: 8,
        backgroundColor: '#000',
        borderRadius: 5,
        color: '#fff',
        width: '100%',
    },
    button: {
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: 25,
        marginBottom: 12,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    separator: {
        flex: 1,
        height: 1,
        backgroundColor: '#fff',
    },
    separatorText: {
        marginHorizontal: 8,
        fontSize: 16,
        color: '#fff',
    },
    socialText: {
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 16,
        color: '#fff',
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    socialButton: {
        padding: 15,
        backgroundColor: '#000',
        borderRadius: 50,
    },
});

export default CreateAccountClientScreen;