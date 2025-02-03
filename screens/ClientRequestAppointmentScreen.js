import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, FlatList, SafeAreaView, Image, Dimensions } from 'react-native';
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
                fetchServices(barber.id);
            } else {
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

    const renderServiceItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.serviceCard, selectedServices.includes(item.id) && styles.selectedService]}
            onPress={() => handleServiceSelect(item)}
        >
            <Text style={styles.serviceName}>{item.nombre}</Text>
            <Text style={styles.serviceDetails}>{item.duracion} min - {item.precio} €</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground source={require('../assets/fondo_generico.png')} style={styles.background}>
                <Text style={styles.title}>Solicitar Cita</Text>
                
                <View style={styles.selectionContainer}>
                    {/* Contenedor de peluqueros */}
                    <FlatList 
                        horizontal
                        data={barbers}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={[styles.card, selectedBarber?.id === item.id && styles.selectedCard]} 
                                onPress={() => handleBarberSelect(item)}
                            >
                                <Image source={item.imagen} style={styles.image} />
                                <Text style={styles.name}>{item.nombre}</Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={item => item.id}
                        showsHorizontalScrollIndicator={false}
                    />
    
                    {/* Contenedor de servicios */}
                    {selectedBarber && services.length > 0 && (
                        <FlatList
                            data={services}
                            renderItem={renderServiceItem}
                            keyExtractor={item => item.id}
                            style={styles.serviceList}
                            numColumns={2}  // Usamos 2 columnas para que los elementos sean más compactos
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    background: { alignItems: 'center', height, justifyContent: 'flex-start', width },
    card: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, height: 150, justifyContent: 'center', padding: 5, width: 120 },
    container: { flex: 1, justifyContent: 'flex-start' }, 
    image: { borderRadius: 40, height: 80, resizeMode: 'cover', width: 80 },
    name: { color: '#000', fontSize: 14, fontWeight: 'bold' },
    selectedCard: { borderColor: 'green', borderWidth: 5 },
    selectionContainer: { alignItems: 'center', width: '100%' },
    serviceList: { marginTop: 20, width: '80%' },
    serviceLabel: { fontSize: 18, color: '#fff', marginBottom: 10 },
    serviceCard: { 
        backgroundColor: '#f9f9f9', 
        borderRadius: 10, 
        marginBottom: 15, 
        padding: 15, 
        justifyContent: 'center', 
        alignItems: 'center', 
        width: width * 0.8, // Ajustar al 80% del ancho de la pantalla
        height: 120, 
    },
    serviceName: { fontSize: 16, fontWeight: 'bold' },
    serviceDetails: { fontSize: 14, color: '#555' },
    scrollContainer: { paddingVertical: 10 },
    title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20, paddingTop: 10 },
});
export default ClientRequestAppointmentScreen;