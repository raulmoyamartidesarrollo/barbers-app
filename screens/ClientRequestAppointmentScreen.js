import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ImageBackground, Dimensions, SafeAreaView, ScrollView, Image } from 'react-native';
import { db } from '../services/Firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import avatar from '../assets/avatar.png';

const ClientRequestAppointmentScreen = () => {
    const [barbers, setBarbers] = useState([]);
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [selectedBarberId, setSelectedBarberId] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);
    const [services, setServices] = useState([]);

    useEffect(() => {
        const fetchBarbers = async () => {
            try {
                const barberCollection = collection(db, 'peluqueros');
                const barberSnapshot = await getDocs(barberCollection);
                const barberList = barberSnapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id,
                    imagen: doc.data().imagen || avatar,
                }));

                setBarbers([{ nombre: 'Cualquiera', imagen: avatar, rol: '', id: null }, ...barberList]);
            } catch (error) {
                console.error("Error al obtener peluqueros: ", error);
            }
        };

        fetchBarbers();
    }, []);

    const fetchServices = async (barberId) => {
        if (!barberId) return;

        try {
            const barberDocRef = doc(db, 'peluqueros', barberId);
            const barberDocSnapshot = await getDoc(barberDocRef);

            if (!barberDocSnapshot.exists()) return;

            const servicesArray = barberDocSnapshot.data().servicios || [];
            const serviceSnapshots = await Promise.all(
                servicesArray.map(serviceId => getDoc(doc(db, 'servicios', serviceId)))
            );

            setServices(serviceSnapshots.map(snap => snap.exists() ? { id: snap.id, ...snap.data() } : null).filter(s => s));
        } catch (error) {
            console.error("Error al obtener los servicios: ", error);
        }
    };

    const handleBarberSelect = async (barber) => {
        console.log("Peluquero seleccionado:", barber);
    
        if (selectedBarber?.id === barber.id) {
            setSelectedBarber(null);
            setSelectedBarberId(null);
            setSelectedServices([]);
            setServices([]);
        } else {
            setSelectedBarber(barber);
            setSelectedBarberId(barber.id);
            setSelectedServices([]);
    
            if (barber.id) {
                // Si se selecciona un peluquero específico, obtenemos sus servicios
                fetchServices(barber.id);
            } else {
                // Si se selecciona "Cualquiera", obtenemos todos los servicios de la colección
                try {
                    const servicesCollection = collection(db, 'servicios');
                    const servicesSnapshot = await getDocs(servicesCollection);
                    const allServices = servicesSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
    
                    setServices(allServices);
                } catch (error) {
                    console.error("Error al obtener los servicios generales: ", error);
                }
            }
        }
    };

    const handleServiceSelect = (service) => {
        setSelectedServices(prev =>
            prev.includes(service.id) ? prev.filter(s => s !== service.id) : [...prev, service.id]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground source={require('../assets/fondo_generico.png')} style={styles.background}>
                <Text style={styles.title}>Solicitar Cita</Text>
                
                <View style={styles.selectionContainer}>
                    {/* Contenedor de peluqueros */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
                        {barbers.map((peluquero, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={[styles.card, selectedBarber?.id === peluquero.id && styles.selectedCard]} 
                                onPress={() => handleBarberSelect(peluquero)}
                            >
                                <Image source={peluquero.imagen} style={styles.image} />
                                <Text style={styles.name}>{peluquero.nombre}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
    
                    {/* Contenedor de servicios */}
                    {selectedBarber && services.length > 0 && (
                        <View style={styles.serviceContainer}>
                            <Text style={styles.specialtyTitle}>Servicios disponibles:</Text>
                            {services.map((service, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.serviceButton, selectedServices.includes(service.id) && styles.selectedService]}
                                    onPress={() => handleServiceSelect(service)}
                                >
                                    <Text style={styles.serviceText}>{service.nombre} - {service.duracion}min - ${service.precio}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    background: { 
        alignItems: 'center', 
        height, 
        justifyContent: 'flex-start', // Cambio para alinear los elementos arriba
        width 
    },
    card: { 
        alignItems: 'center', 
        backgroundColor: '#fff', 
        borderRadius: 10, 
        height: 150, 
        justifyContent: 'center', 
        padding: 5, 
        width: 120 
    },
    container: { 
        flex: 1, 
        justifyContent: 'flex-start' // Cambiado para alinear todo desde arriba
    },
    image: { 
        borderRadius: 40, 
        height: 80, 
        resizeMode: 'cover', 
        width: 80 
    },
    name: { 
        color: '#000', 
        fontSize: 14, 
        fontWeight: 'bold' 
    },
    scrollContainer: { 
        flexGrow: 0, 
        paddingVertical: 10 
    },
    selectedCard: { 
        borderColor: 'green', 
        borderWidth: 5 
    },
    selectedService: { 
        backgroundColor: 'green' 
    },
    selectionContainer: { 
        alignItems: 'center', 
        width: '100%' 
    },
    serviceButton: { 
        backgroundColor: '#ddd', 
        borderRadius: 5, 
        marginVertical: 5, 
        padding: 10 
    },
    serviceContainer: { 
        alignItems: 'center', 
        marginTop: 10, 
        width: '90%' 
    },
    serviceText: { 
        color: '#000', 
        fontSize: 16 
    },
    specialtyTitle: { 
        color: '#fff',
        fontSize: 18, 
        fontWeight: 'bold', 
        marginBottom: 10,
    },
    title: { 
        color: '#fff', 
        fontSize: 24, 
        fontWeight: 'bold', 
        marginBottom: 20, 
        paddingTop: 10 
    },
});

export default ClientRequestAppointmentScreen;