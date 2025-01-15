import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ImageBackground, SafeAreaView, Dimensions } from 'react-native';
import { getFirestore, Timestamp, collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { useUser } from '../services/UserContext';
import { Picker } from '@react-native-picker/picker';
import { Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { db } from '../services/Firebase';

const { width: screenWidth } = Dimensions.get('window');

const ClientRequestAppointmentScreen = () => {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState('');
    const [horarios, setHorarios] = useState({});
    const db = getFirestore();
    const { userId } = useUser();
    const navigation = useNavigation();

    useEffect(() => {
        const fetchHorarios = async () => {
            try {
                const horariosDoc = await getDocs(collection(db, 'horarios'));
                horariosDoc.forEach((doc) => {
                    setHorarios(doc.data());
                });
            } catch (error) {
                console.error('Error fetching horarios: ', error);
            }
        };

        loadUnavailableDates();
        loadServices();
        fetchHorarios();
    }, []);

    const loadUnavailableDates = async () => {
        try {
            const dates = [];
            const docRef = doc(db, 'fechas_no_disponibles', 'fechas');
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const docData = docSnap.data();
                Object.keys(docData).forEach(field => {
                    const fieldValue = docData[field];
                    if (fieldValue && fieldValue instanceof Timestamp) {
                        dates.push(fieldValue.toDate().toISOString().split('T')[0]); 
                    }
                });
                setUnavailableDates(dates);
            } else {
                console.log("El documento 'fechas' no existe");
            }
        } catch (error) {
            console.error("Error al cargar las fechas no disponibles:", error);
        }
    };

    const loadServices = async () => {
        try {
            const servicesList = [];
            const querySnapshot = await getDocs(collection(db, 'servicios'));
            querySnapshot.forEach(doc => {
                servicesList.push({ id: doc.id, ...doc.data() });
            });
            setServices(servicesList);
        } catch (error) {
            console.error("Error al cargar los servicios:", error);
        }
    };

    const changeWeek = (direction) => {
        const newWeek = new Date(currentWeek);
        newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
        setCurrentWeek(newWeek);
    };

    const handleDayPress = async (day) => {
        setSelectedDate(day);
        const dayOfWeek = day.toLocaleDateString('es-ES', { weekday: 'long' });
        await loadAvailableTimes(dayOfWeek);
    };

    const getDaysInWeek = () => {
        const startOfWeek = new Date(currentWeek);
        startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1);
        return Array.from({ length: 7 }, (_, i) => new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i));
    };

    // Función para verificar si una fecha es no disponible o domingo
    const isDateUnavailableOrSunday = (date) => {
        const dateString = date.toISOString().split('T')[0];
        const isSunday = date.getDay() === 0; // 0 es domingo
        return unavailableDates.includes(dateString) || isSunday;
    };

    const handleConfirmAppointment = async () => {
        if (selectedDate && selectedTime && selectedService) {
            try {
                await addDoc(collection(db, 'reservas'), {
                    userId: userId,
                    fecha: selectedDate,
                    hora: selectedTime,
                    servicio: selectedService,
                });
                console.log(`Cita confirmada para el ${selectedDate.toLocaleDateString()} a las ${selectedTime}`);
            } catch (error) {
                console.error("Error al confirmar la cita:", error);
            }
        } else {
            alert("Por favor, selecciona una fecha, un servicio y una hora.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground source={require('../assets/fondo_generico.png')} style={styles.background}>
                <Text style={styles.title}>Solicitar Cita</Text>

                <View style={styles.mainContainer}>
                    <Text style={styles.monthIndicator}>
                        {currentWeek.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </Text>

                    <View style={styles.navigationContainer}>
                        <TouchableOpacity onPress={() => changeWeek('previous')} style={styles.navButton}>
                            <Text style={styles.navText}>◀</Text>
                        </TouchableOpacity>

                        <ScrollView
                            horizontal
                            contentContainerStyle={styles.weekContainer}
                            showsHorizontalScrollIndicator={false}
                            style={{ width: screenWidth }}
                        >
                            {getDaysInWeek().map((day, index) => {
    const isBeforeToday = day < new Date();
    const isUnavailable = unavailableDates.includes(day.toISOString().split('T')[0]);
    const isSunday = day.getDay() === 0; // Verifica si es domingo

                            return (
                                <View key={index} style={styles.dayContainer}>
                                    <Text style={styles.weekNumberText}>{day.toLocaleDateString('es-ES', { weekday: 'short' })}</Text>
                                    <TouchableOpacity
                                        onPress={() => !isBeforeToday && !isUnavailable && !isSunday && handleDayPress(day)} // Excluir domingos deshabilitados
                                        style={[
                                            styles.dayButton,
                                            (isBeforeToday || isUnavailable || isSunday) && styles.disabledDayButton, // Añadir fondo rojo y deshabilitar domingos
                                            day.toISOString() === selectedDate?.toISOString() && styles.selectedDayButton,
                                            (isUnavailable || isSunday) && styles.unavailableDay // Fondo rojo si el día está marcado como no disponible o es domingo
                                        ]}
                                        disabled={isBeforeToday || isUnavailable || isSunday} // Deshabilitar domingos y fechas no disponibles
                                    >
                                        <Text style={styles.dayText}>{day.getDate()}</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                        </ScrollView>

                        <TouchableOpacity onPress={() => changeWeek('next')} style={styles.navButton}>
                            <Text style={styles.navText}>▶</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.selectorContainer}>
                        <Text style={styles.sectionTitle}>Selecciona un servicio:</Text>
                        <ScrollView horizontal contentContainerStyle={styles.serviceContainer} showsHorizontalScrollIndicator={false}>
                            {services.map(service => (
                                <Chip
                                    key={service.id}
                                    selected={selectedService === service.id}
                                    onPress={() => setSelectedService(service.id)}
                                    style={[styles.chip, selectedService === service.id && styles.chipSelected]}
                                    textStyle={styles.chipText}
                                >
                                    {`${service.nombre} - (${service.duracion} Min.) ${service.precio}€`}
                                </Chip>
                            ))}
                        </ScrollView>

                        {selectedService ? (
                            <>
                                <Text style={styles.sectionTitle}>Selecciona un horario:</Text>
                                <Picker
                                    selectedValue={selectedTime}
                                    onValueChange={(itemValue) => setSelectedTime(itemValue)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Seleccionar hora" value="" />
                                    {availableTimes.map((time, index) => (
                                        <Picker.Item key={index} label={time} value={time} />
                                    ))}
                                </Picker>
                            </>
                        ) : null}

                        <TouchableOpacity onPress={handleConfirmAppointment} style={styles.confirmButton}>
                            <Text style={styles.confirmButtonText}>Confirmar Cita</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => navigation.navigate('HomeScreenClient')} style={styles.backButton}>
                        <Icon name="arrow-left" size={24} color="#FFF" />
                        <Text style={styles.backButtonText}>Volver</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    backButton: {
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 20,
    },
    backButtonText: {
        color: '#FFF',
        fontSize: 18,
        marginLeft: 10,
    },
    background: {
        flex: 1,
        justifyContent: 'center',
        resizeMode: 'cover',
    },
    chip: {
        backgroundColor: '#FFF',
        borderColor: '#333',
        borderWidth: 1,
        marginHorizontal: 5,
    },
    chipSelected: {
        backgroundColor: '#007bff',
    },
    chipText: {
        color: '#333',
    },
    confirmButton: {
        backgroundColor: '#007bff',
        borderRadius: 5,
        marginTop: 10,
        padding: 15,
    },
    confirmButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    container: {
        flex: 1,
    },
    dayButton: {
        backgroundColor: '#FFF',
        borderColor: '#333',
        borderRadius: 5,
        borderWidth: 1,
        padding: 10,
    },
    dayContainer: {
        alignItems: 'center',
        marginHorizontal: 5,
    },
    dayText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledDayButton: {
        opacity: 0.3,
    },
    mainContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 10,
        marginHorizontal: 10,
        padding: 20,
    },
    monthIndicator: {
        color: '#333',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    navigationContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    navButton: {
        padding: 10,
    },
    navText: {
        color: '#333',
        fontSize: 18,
    },
    picker: {
        borderColor: '#333',
        borderRadius: 5,
        borderWidth: 1,
        marginVertical: 10,
        paddingHorizontal: 10,
    },
    sectionTitle: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    selectedDayButton: {
        backgroundColor: '#007bff',
    },
    serviceContainer: {
        flexDirection: 'row',
        marginVertical: 10,
    },
    selectorContainer: {
        marginTop: 20,
    },
    todayButton: {
        borderColor: '#007bff',
        borderWidth: 2,
    },
    unavailableDay: {
        backgroundColor: 'red', // Fondo rojo para días no disponibles o domingos
    },
    weekContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    weekNumberText: {
        color: '#333',
        fontSize: 14,
        marginBottom: 5,
        textAlign: 'center',
    },
    title: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 10,
        textAlign: 'center',
    },
});

export default ClientRequestAppointmentScreen;