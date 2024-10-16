import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useUser } from '../services/UserContext'; // Asegúrate de que la ruta sea correcta
import { firestore } from '../services/Firebase'; // Asegúrate de que la ruta sea correcta
import { doc, onSnapshot } from 'firebase/firestore'; // Importa las funciones necesarias de Firestore

const ClientMyAccountScreen = () => {
    const { userId } = useUser(); // Usa el hook para obtener userId
    const [userData, setUserData] = useState(null); // Estado para los datos del usuario

    useEffect(() => {
        if (userId) {
            const unsubscribe = onSnapshot(doc(firestore, 'usuarios', userId), (doc) => {
                console.log('Datos del usuario:', doc.data())
                if (doc.exists()) {
                    
                    setUserData(doc.data()); // Establece los datos del usuario
                } else {
                    console.log('No such document!');
                }
            }, (error) => {
                console.log('Error getting document:', error);
            });

            return () => unsubscribe(); // Desuscribirse en el desmontaje del componente
        }
    }, [userId]);

    return (
        <ScrollView>
            <View>
                {userData ? (
                    <>
                        <TextInput
                            placeholder="Nombre"
                            value={userData.nombre || ''} // Asegúrate de manejar el caso donde userData podría no tener un valor
                            onChangeText={(text) => setUserData((prev) => ({ ...prev, nombre: text }))}
                        />
                        <TextInput
                            placeholder="Apellidos"
                            value={userData.apellidos || ''}
                            onChangeText={(text) => setUserData((prev) => ({ ...prev, apellidos: text }))}
                        />
                        <TextInput
                            placeholder="Email"
                            value={userData.email || ''}
                            onChangeText={(text) => setUserData((prev) => ({ ...prev, email: text }))}
                        />
                        <TextInput
                            placeholder="Teléfono"
                            value={userData.telefono || ''}
                            onChangeText={(text) => setUserData((prev) => ({ ...prev, telefono: text }))}
                        />
                    </>
                ) : (
                    <Text>No hay datos de usuario disponibles.</Text>
                )}
            </View>
        </ScrollView>
    );
};

export default ClientMyAccountScreen;