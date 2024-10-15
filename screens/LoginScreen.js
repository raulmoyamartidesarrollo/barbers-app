import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, Platform, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, getDoc, doc } from 'firebase/firestore'; // Asegúrate de importar Firestore
import colors from '../services/colors'; // Asegúrate de que la ruta sea correcta
import Icon from 'react-native-vector-icons/FontAwesome'; // Asegúrate de importar FontAwesome
import { useUser } from '../services/UserContext'; // Importa el contexto

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setUserId } = useUser();  // Obtén la función setUserId del contexto

    const auth = getAuth();

    const handleLogin = async () => {
        try {
            // Iniciar sesión con Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Inicio de sesión exitoso:", user);

            // Actualizar el userId en el contexto
            setUserId(user.uid);

            // Verificar el tipo de usuario en Firestore
            const db = getFirestore();
            const userDoc = await getDoc(doc(db, 'usuarios', user.uid));

            if (userDoc.exists()) {
                // Si el documento existe en la colección 'usuarios'
                navigation.navigate('HomeScreenClient');
            } else {
                // Si no existe en 'usuarios', verifica en 'peluqueros'
                const peluqueroDoc = await getDoc(doc(db, 'peluqueros', user.uid));

                if (peluqueroDoc.exists()) {
                    // Si el documento existe en la colección 'peluqueros'
                    navigation.navigate('AdminHomeScreen');
                } else {
                    // Si el usuario no pertenece a ninguna colección
                    Alert.alert('Error', 'El usuario no está registrado en ninguna colección.');
                }
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            Alert.alert('Error', error.message);
        }
    };

    const handlePasswordReset = async () => {
        if (!email) {
            Alert.alert('Error', 'Por favor, introduce tu correo electrónico para restablecer la contraseña.');
            return;
        }

        try {
            await auth.sendPasswordResetEmail(email);
            alert('Se ha enviado un correo electrónico para restablecer la contraseña.');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <ImageBackground 
            source={require('../assets/background.jpg')} 
            style={styles.background}
        >
            <View style={styles.overlay} />
            <View style={styles.container}>
                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    mode="outlined"
                />
                <TextInput
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                    mode="outlined"
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}

                <Button 
                    mode="contained" 
                    onPress={handleLogin} 
                    style={styles.button}
                    labelStyle={styles.buttonLabel}
                >
                    Iniciar sesión
                </Button>
                <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('CreateAccountClientScreen')}
                    style={styles.button}
                    labelStyle={styles.buttonLabel}
                >
                    Crear cuenta
                </Button>

                <Text style={styles.resetPassword} onPress={handlePasswordReset}>
                    ¿Has perdido la contraseña?
                </Text>

                <View style={styles.separatorContainer}>
                    <View style={styles.line} />
                    <Text style={styles.separatorText}>ó</Text>
                    <View style={styles.line} />
                </View>

                <View style={styles.socialContainer}>
                    <Button 
                        mode="contained" 
                        style={styles.socialButton} 
                        labelStyle={styles.buttonLabel}
                        icon={() => <Icon name="facebook" size={20} color={colors.white} />} // Icono de Facebook
                    />
                    <Button 
                        mode="contained" 
                        style={styles.socialButton} 
                        labelStyle={styles.buttonLabel}
                        icon={() => <Icon name="google" size={20} color={colors.white} />} // Icono de Google
                    />
                    {Platform.OS === 'ios' && (
                        <Button 
                            mode="contained" 
                            style={styles.socialButton} 
                            labelStyle={styles.buttonLabel}
                            icon={() => <Icon name="apple" size={20} color={colors.white} />} // Icono de Apple
                        />
                    )}
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
        padding: 0,
        borderRadius: 10,
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 16,
        backgroundColor: colors.primary, // Usar color negro
    },
    buttonLabel: {
        color: colors.white, // Texto blanco
    },
    error: {
        color: 'red',
        marginBottom: 16,
    },
    resetPassword: {
        color: 'blue',
        marginTop: 16,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    separator: {
        textAlign: 'center',
        marginVertical: 16,
        color: colors.white, // Ajustar el color según necesites
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Distribuir botones en la fila
        marginTop: 8,
    },
    socialButton: {
        flex: 1, // Tomar el mismo espacio
        marginHorizontal: 4, // Espaciado entre los botones
        backgroundColor: colors.primary, // Usar color negro
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    line: {
        flex: 1,
        height: 2,
        backgroundColor: colors.white,  // El color de la línea
        marginHorizontal: 8,  // Espaciado entre la línea y la "ó"
    },
    separatorText: {
        textAlign: 'center',
        color: colors.white,  // El color de la "ó"
    },
});

export default LoginScreen;