import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ImageBackground, Switch, Image, ScrollView, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import { useUser } from '../services/UserContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, getDoc, setDoc, doc } from 'firebase/firestore';
import avatar from '../assets/avatar.png';
import * as ImagePicker from 'expo-image-picker';

const ClientMyAccountScreen = () => {
    const { userId } = useUser();
    const navigation = useNavigation();

    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [receiveNotifications, setReceiveNotifications] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userImage, setUserImage] = useState(null); // Estado para la imagen del usuario
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (userId) {
                const db = getFirestore();
                const userDoc = await getDoc(doc(db, 'usuarios', userId));

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setName(userData.nombre || '');
                    setSurname(userData.apellidos || '');
                    setEmail(userData.email || '');
                    setPhone(userData.telefono || '');
                    setReceiveNotifications(userData.receiveNotifications || false);
                    setUserImage(userData.userImage || null); // Carga la imagen existente
                } else {
                    console.log('No se encontró el usuario en Firestore');
                }
            }
            setLoading(false);
        };

        fetchUserData();
    }, [userId]);

    const handleSave = async () => {
        try {
            const db = getFirestore();
            const userDocRef = doc(db, 'usuarios', userId);

            let imageUrl = userImage;

            // Subir la imagen si se ha seleccionado una
            if (userImage && typeof userImage === 'string' && userImage.startsWith('file://')) {
                const response = await fetch(userImage);
                const blob = await response.blob();
                const storage = getStorage();
                const storageRef = ref(storage, `userImages/${userId}.jpg`);
                
                await uploadBytes(storageRef, blob);
                imageUrl = await getDownloadURL(storageRef);
            }

            await setDoc(userDocRef, {
                nombre: name,
                apellidos: surname,
                email: email,
                telefono: phone,
                receiveNotifications: receiveNotifications,
                userImage: imageUrl, // Agrega la imagen del usuario al guardar
            }, { merge: true });

            console.log('Datos guardados correctamente:', { name, surname, email, phone, receiveNotifications });
            Alert.alert('Guardado!', 'Datos guardados correctamente', [{ text: 'OK' }]);
        } catch (error) {
            console.error('Error guardando los datos:', error);
            Alert.alert('Error!', 'No se ha podido guardar los datos', [{ text: 'OK' }]);
        }
    };

    const handleGoBack = () => {
        navigation.navigate('HomeScreenClient'); 
    };

    const handleCameraPress = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        
        if (permissionResult.granted === false) {
            Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la cámara.');
            return;
        }
    
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
    
        console.log('Resultado de la cámara:', result); // Log del resultado completo
    
        if (!result.canceled) {
            if (result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri; // Acceder a la URI de la imagen
                setUserImage(imageUri); // Establecer la imagen seleccionada
                console.log('Imagen capturada:', imageUri); // Log para depuración
            } else {
                console.log('No se encontró ninguna imagen en el resultado.');
            }
        } else {
            console.log('La operación fue cancelada.');
        }
    };

    if (loading) {
        return <Text>Cargando...</Text>; 
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}> 
                <ImageBackground
                    source={require('../assets/background.jpg')} 
                    style={styles.background}
                >
                    <View style={styles.overlay}>
                        <ScrollView>
                            <Text style={styles.title}>Mi Cuenta</Text>

                            <View style={styles.imageContainer}>
                                <Image
                                    source={userImage ? { uri: userImage } : avatar} 
                                    style={styles.userImage}
                                />
                                <TouchableOpacity style={styles.cameraButton} onPress={handleCameraPress}>
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
                                    
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                            <Text style={styles.saveButtonText}>Guardar Datos</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
                                            <Text style={styles.backButtonText}>Volver</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <Text style={styles.message}>No hay usuario logeado.</Text>
                            )}
                        </ScrollView>
                    </View>
                </ImageBackground>
            </View>
        </TouchableWithoutFeedback>
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
        backgroundColor: 'rgba(211, 211, 211, 0.8)',
        width: '90%', 
        height: '70%',
        marginHorizontal: 10,
        marginVertical: 100, 
        borderRadius: 10,
        padding: 20,
        borderColor: 'black',
        borderWidth: 5,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    userImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 10,
        right: 80,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 5,
        elevation: 3, 
    },
    userInfo: {
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    switchLabel: {
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    saveButton: {
        backgroundColor: 'black',
        borderRadius: 5,
        padding: 10,
        flex: 1,
        marginRight: 5,
    },
    saveButtonText: {
        color: 'white',
        textAlign: 'center',
    },
    backButton: {
        backgroundColor: 'grey',
        borderRadius: 5,
        padding: 10,
        flex: 1,
        marginLeft: 5,
    },
    backButtonText: {
        color: 'white',
        textAlign: 'center',
    },
    message: {
        textAlign: 'center',
        color: 'red',
    },
});

export default ClientMyAccountScreen;