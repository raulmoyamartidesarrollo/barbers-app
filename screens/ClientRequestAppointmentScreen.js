import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, FlatList, SafeAreaView, Image, Dimensions, Modal, Alert } from 'react-native';
import { db } from '../services/Firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import avatar from '../assets/avatar.png';
import { Drawer } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';

const ClientRequestAppointmentScreen = () => {
    const [barbers, setBarbers] = useState([]);
    const [selectedBarber, setSelectedBarber] = useState(null);
    const [selectedBarberId, setSelectedBarberId] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [services, setServices] = useState([]);
    const [showAllServices, setShowAllServices] = useState(true);
    const [workingDays, setWorkingDays] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);

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

            const workingDaysArray = barberDocSnapshot.data().diasTrabajo || [];
            setWorkingDays(workingDaysArray);
        } catch (error) {
            console.error("Error al obtener los servicios: ", error);
        }
    };

    const handleBarberSelect = async (barber) => {
        if (selectedBarber?.id === barber.id) {
            setSelectedBarber(null);
            setSelectedBarberId(null);
            setSelectedService(null);
            setServices([]);
            setWorkingDays([]);
        } else {
            setSelectedBarber(barber);
            setSelectedBarberId(barber.id);
            setSelectedService(null);
            setShowAllServices(true);
            setSelectedDate(null);
            setShowCalendar(false);

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

    const handleServiceSelect = (value) => {
        if (selectedService === value) {
            setSelectedService(null);
            setShowAllServices(true);
        } else {
            setSelectedService(value);
            setShowAllServices(false);
        }
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
    };

    const servicePickerItems = services.map(service => ({
        label: `${service.nombre} - ${service.duracion} min - ${service.precio} €`,
        value: service.id
    }));

    const markedDates = {};
    workingDays.forEach(day => {
        markedDates[day] = { marked: true, dotColor: 'red' };
    });

    const renderMarkedDates = () => {
        let dates = {};
        workingDays.forEach(day => {
            dates[day] = { selected: true, selectedColor: 'green' };
        });

        // Marcar el día seleccionado y el día de hoy en azul
        dates[selectedDate] = { selected: true, selectedColor: 'blue' };
        dates[new Date().toISOString().split('T')[0]] = { selected: true, selectedColor: 'blue' };

        return dates;
    };

    const handleSelectDateClick = () => {
        if (!selectedDate) {
            Alert.alert('Error', 'Por favor, selecciona una fecha antes de continuar.');
        } else {
            setShowCalendar(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground source={require('../assets/fondo_generico.png')} style={styles.background}>
                <Text style={styles.title}>Solicitar Cita</Text>

                <View style={styles.selectionContainer}>
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

                    {selectedBarber && services.length > 0 && (
                        <View style={styles.serviceList}>
                            <Text style={styles.serviceLabel}>Selecciona servicio</Text>
                            <Drawer.Section>
                                {services.map(service => (
                                    (showAllServices || selectedService === service.id) && (
                                        <Drawer.Item
                                            key={service.id}
                                            label={`${service.nombre} - ${service.duracion} min - ${service.precio} €`}
                                            onPress={() => handleServiceSelect(service.id)}
                                            style={[
                                                styles.drawerItem, 
                                                selectedService === service.id && styles.selectedDrawerItem
                                            ]}
                                        />
                                    )
                                ))}
                            </Drawer.Section>
                        </View>
                    )}

                    {selectedService && (
                        <TouchableOpacity style={styles.selectDateButton} onPress={() => setShowCalendar(true)}>
                            <Text style={styles.selectDateText}>Seleccionar Fecha</Text>
                        </TouchableOpacity>
                    )}

                    {showCalendar && (
                        <Modal visible={showCalendar} transparent={true} animationType="slide">
                            <View style={styles.modalOverlay}>
                                <View style={styles.calendarContainer}>
                                    <Calendar
                                        markedDates={renderMarkedDates()}
                                        onDayPress={(day) => handleDateSelect(day.dateString)} // No cerramos el modal
                                        monthFormat={'MMMM yyyy'}
                                        theme={{
                                            selectedDayBackgroundColor: '#239432',
                                            todayTextColor: '#00adf5',
                                            arrowColor: 'blue',
                                        }}
                                        locale={'es'}
                                        firstDay={1} // Iniciar semana en lunes
                                        markingType={'simple'}
                                    />
                                    <TouchableOpacity onPress={handleSelectDateClick} style={styles.selectedDateButton}>
                                        <Text style={styles.closeText}>Seleccionar fecha</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
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
    serviceLabel: { fontSize: 18, color: '#fff', marginBottom: 10, textTransform: 'uppercase', fontWeight: 'bold' },
    drawerItem: { marginTop: 10 },
    selectedDrawerItem: { backgroundColor: '#ddd' },
    title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20, paddingTop: 10 },
    selectDateButton: { backgroundColor: '#000', padding: 10, marginTop: 20, borderRadius: 5 },
    selectDateText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    calendarContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' },
    selectedDateButton: { marginTop: 10, padding: 10, backgroundColor: 'green', borderRadius: 5 },
    closeText: { color: '#fff', fontWeight: 'bold' },
});

export default ClientRequestAppointmentScreen;