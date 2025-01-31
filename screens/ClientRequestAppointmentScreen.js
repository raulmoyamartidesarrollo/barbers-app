import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ImageBackground, Dimensions, SafeAreaView, ScrollView, Image } from 'react-native';
import { db } from '../services/Firebase'; // Asegúrate de que esta ruta sea correcta
import { collection, getDocs } from 'firebase/firestore'; // Firebase Firestore import
import avatar from '../assets/avatar.png'; // Importa la imagen de avatar

const ClientRequestAppointmentScreen = () => {
    const [barbers, setBarbers] = useState([]);
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [selectedBarberId, setSelectedBarberId] = useState(null);  // Nuevo estado para guardar el ID del peluquero
    const [selectedDate, setSelectedDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        // Obtener los peluqueros de Firestore
        const fetchBarbers = async () => {
            try {
                const barberCollection = collection(db, 'peluqueros');
                const barberSnapshot = await getDocs(barberCollection);
                const barberList = barberSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        ...data,
                        id: doc.id, // Guardamos el ID del peluquero
                        imagen: data.imagen || avatar, // Usamos avatar.png si no hay imagen en Firebase
                    };
                });

                // Añadir la opción 'Cualquiera' al principio de la lista
                const allBarbers = [
                    { nombre: 'Cualquiera', imagen: avatar, rol: '', id: null }, // 'Cualquiera' no tiene ID
                    ...barberList
                ];

                setBarbers(allBarbers);
            } catch (error) {
                console.error("Error al obtener peluqueros: ", error);
            }
        };

        fetchBarbers();
    }, []);  // Solo se ejecuta una vez al montar el componente

    const handleBarberSelect = (barber) => {
        if (selectedBarber?.id === barber.id) {
            // Si el peluquero ya está seleccionado, desmarcarlo
            setSelectedBarber(null);
            setSelectedBarberId(null);
        } else {
            // Seleccionar el nuevo peluquero
            setSelectedBarber(barber);
            setSelectedBarberId(barber.id);
        }
        
        // Si selecciona 'Cualquiera', no guardamos ID
        if (barber.nombre === 'Cualquiera') {
            setSelectedBarberId(null);  // Restablece el ID si se selecciona 'Cualquiera'
        } else {
            setSelectedBarberId(barber.id);  // Guarda el ID del peluquero seleccionado
        }

        // Lógica adicional si selecciona 'Cualquiera' o un peluquero específico
        if (barber.nombre === 'Cualquiera') {
            console.log('Se ha seleccionado cualquier peluquero');
        } else {
            console.log(`Se ha seleccionado el peluquero: ${barber.id}`);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground source={require('../assets/fondo_generico.png')} style={styles.background}>
                <Text style={styles.title}>Solicitar Cita</Text>
                <View style={styles.mainContainer}>
                    {/* Scroll Horizontal para los peluqueros */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
                    {barbers.map((peluquero, index) => {
                            const isSelected = selectedBarber?.id === peluquero.id;
                            
                            return (
                                <View key={index} style={styles.cardContainer}>
                                    <TouchableOpacity 
                                        style={[
                                            styles.card, 
                                            isSelected ? styles.selectedCard : null, // Borde verde si está seleccionado
                                            selectedBarber && !isSelected ? styles.deselectedCard : null // Atenuado si otro está seleccionado
                                        ]} 
                                        onPress={() => handleBarberSelect(peluquero)}
                                    >
                                        <View style={styles.imageContainer}>
                                            <Image 
                                                source={peluquero.imagen} 
                                                style={styles.image} 
                                            />
                                        </View>
                                        <View style={styles.infoContainer}>
                                            <Text style={styles.name}>{peluquero.nombre}</Text>
                                            <Text style={styles.role}>{peluquero.rol}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        width: width,
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        paddingTop: 10,
    },
    mainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        marginVertical: 20,
    },
    cardContainer: {
        marginHorizontal: 10,
        justifyContent: 'top',
        alignItems: 'center',
    },
    card: {
        width: 120,
        height: 150,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        borderWidth: 2,
        borderColor: 'transparent', // Sin borde por defecto
        opacity: 1, // Opacidad normal
    },
    selectedCard: {
        borderColor: 'green', // Borde verde si está seleccionado
        borderWidth: 5,
        opacity: 1, // Visibilidad normal
    },
    deselectedCard: {
        opacity: 0.5, // Atenuado si otro peluquero está seleccionado
    },
    imageContainer: {
        marginBottom: 10,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 40,
        resizeMode: 'cover',
    },
    infoContainer: {
        alignItems: 'center',
    },
    name: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    role: {
        fontSize: 12,
        color: '#888',
    },
});

export default ClientRequestAppointmentScreen;