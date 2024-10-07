import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import colors from '../services/colors'; // Asegúrate de que la ruta sea correcta
import Icon from 'react-native-vector-icons/FontAwesome'; // Asegúrate de importar FontAwesome


const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const auth = getAuth();

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigation.navigate('ClientHomeScreen');
        } catch (error) {
            setError(error.message);
        }
    };

    const handlePasswordReset = async () => {
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

                <Text style={styles.separator}>ó</Text>

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
});

export default LoginScreen;