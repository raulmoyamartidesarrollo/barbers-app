import React, { useState } from 'react';
import { View, StyleSheet, Platform, Alert, Image } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import colors from '../services/colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useUser } from '../services/UserContext';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setUserId } = useUser();

    const auth = getAuth();

    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            setUserId(user.uid);

            const db = getFirestore();
            const userDoc = await getDoc(doc(db, 'usuarios', user.uid));

            if (userDoc.exists()) {
                navigation.navigate('HomeScreenClient');
            } else {
                const peluqueroDoc = await getDoc(doc(db, 'peluqueros', user.uid));
                if (peluqueroDoc.exists()) {
                    navigation.navigate('AdminHomeScreen');
                } else {
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
        
        <View style={styles.background}>
            <View style={styles.overlay} />
            <View style={styles.container}>
                
                <Image source={require('../assets/new_logo_fondo_negro.png')} style={styles.logo} />

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
                        icon={() => <Icon name="facebook" size={20} color={colors.white} />}
                    />
                    <Button 
                        mode="contained" 
                        style={styles.socialButton} 
                        labelStyle={styles.buttonLabel}
                        icon={() => <Icon name="google" size={20} color={colors.white} />}
                    />
                    {Platform.OS === 'ios' && (
                        <Button 
                            mode="contained" 
                            style={styles.socialButton} 
                            labelStyle={styles.buttonLabel}
                            icon={() => <Icon name="apple" size={20} color={colors.white} />}
                        />
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#000', // Fondo negro
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Capa negra semitransparente
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 0,
        borderRadius: 10,
    },
    logo: {
        width: 200, // Ancho del logo
        height: 200, // Alto del logo
        alignSelf: 'center',
        marginBottom: 24,
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 16,
        backgroundColor: colors.primary,
    },
    buttonLabel: {
        color: colors.white,
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
        color: colors.white,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    socialButton: {
        flex: 1,
        marginHorizontal: 4,
        backgroundColor: colors.primary,
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    line: {
        flex: 1,
        height: 2,
        backgroundColor: colors.white,
        marginHorizontal: 8,
    },
    separatorText: {
        textAlign: 'center',
        color: colors.white,
    },
});

export default LoginScreen;