import React, { useState } from 'react';
import { View, StyleSheet, Platform, Alert, Image, ImageBackground, TouchableOpacity } from 'react-native';
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
    const [showPassword, setShowPassword] = useState(false);
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

    return (
        <ImageBackground 
            source={require('../assets/fondo_generico.png')} 
            style={styles.background} 
        >
            <View style={styles.overlay} />
            <View style={styles.container}>
                <Image source={require('../assets/logo_sin_fondo_blanco.png')} style={styles.logo} />

                {/* Input Email */}
                <View style={styles.inputContainer}>
                    <Icon name="user" size={20} color="white" style={styles.icon} />
                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        mode="outlined"
                    />
                </View>

                {/* Input Password */}
                <View style={styles.inputContainer}>
                    <Icon name="lock" size={20} color="white" style={styles.icon} />
                    <TextInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        style={styles.input}
                        mode="outlined"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <Icon 
                            name={showPassword ? 'eye' : 'eye-slash'} 
                            size={20} 
                            color="black" 
                        />
                    </TouchableOpacity>
                </View>
                
                {error ? <Text style={styles.error}>{error}</Text> : null}

                {/* Buttons */}
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

                <Text style={styles.resetPassword} onPress={() => { /* handle password reset */ }}>
                    ¿Has perdido la contraseña?
                </Text>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        borderRadius: 10,
    },
    logo: {
        width: 200,
        height: 200,
        alignSelf: 'center',
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    input: {
        flex: 1,
        marginLeft: 10,
    },
    icon: {
        marginRight: 10,
    },
    eyeIcon: {
        position: 'absolute',
        right: 10,
        top: 15,
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
        color: '#fff',
        marginTop: 16,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});

export default LoginScreen;