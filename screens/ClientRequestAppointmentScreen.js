import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ImageBackground, SafeAreaView, Dimensions } from 'react-native';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore'; 
import { useUser } from '../services/UserContext'; 
import { Picker } from '@react-native-picker/picker'; 

const { width: screenWidth } = Dimensions.get('window'); // Obtener el ancho de la pantalla

const ClientRequestAppointmentScreen = () => {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [unavailableDates, setUnavailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedTime, setSelectedTime] = useState(null);
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState('');
    const db = getFirestore();
    const { userId } = useUser();

    useEffect(() => {
        loadUnavailableDates();
        loadServices();
    }, []);

    const loadUnavailableDates = async () => {
        try {
            const dates = [];
            const querySnapshot = await getDocs(collection(db, 'fechas_no_disponibles'));
            querySnapshot.forEach(doc => {
                dates.push(doc.data().fecha.toDate().toISOString().split('T')[0]);
            });
            setUnavailableDates(dates);
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
    const isToday = (date) => {
        const todayDate = new Date();
        return (
            date.getDate() === todayDate.getDate() &&
            date.getMonth() === todayDate.getMonth() &&
            date.getFullYear() === todayDate.getFullYear()
        );
    };
    
    // Función para verificar si una fecha es la seleccionada
    const isSelectedDate = (date, selectedDate) => {
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        );
    };
    
    // Aplicación de estilos en el botón de día
    const getDayButtonStyle = (date, selectedDate) => {
        if (isToday(date)) {
            return [styles.dayButton, styles.todayButton];
        } else if (isSelectedDate(date, selectedDate)) {
            return [styles.dayButton, styles.selectedDayButton];
        } else {
            return styles.dayButton;
        }
    };

    const loadAvailableTimes = async (day) => {
        try {
            const times = [];
            const querySnapshot = await getDocs(collection(db, 'reservas'));
            querySnapshot.forEach(doc => {
                const reservationDate = doc.data().fecha.toDate().toISOString().split('T')[0];
                const reservationTime = doc.data().hora;
                if (reservationDate === day.toISOString().split('T')[0]) {
                    times.push(reservationTime);
                }
            });

            const allTimes = generateAllTimes();
            const availableTimes = allTimes.filter(time => !times.includes(time));
            setAvailableTimes(availableTimes);
            setSelectedTime(null);
        } catch (error) {
            console.error("Error al cargar los horarios disponibles:", error);
        }
    };

    const changeWeek = (direction) => {
        const newWeek = new Date(currentWeek);
        newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
        setCurrentWeek(newWeek);
    };

    const handleDayPress = async (day) => {
        setSelectedDate(day);
        await loadAvailableTimes(day);
    };

    const handleConfirmAppointment = async () => {
        if (selectedDate && selectedTime && selectedService) {
            try {
                await reserveAppointment(selectedDate, selectedTime, selectedService);
                console.log(`Cita confirmada para el ${selectedDate.toLocaleDateString()} a las ${selectedTime}`);
            } catch (error) {
                console.error("Error al confirmar la cita:", error);
            }
        } else {
            alert("Por favor, selecciona una fecha, un servicio y una hora.");
        }
    };

    const generateAllTimes = () => {
        const times = [];
        for (let hour = 10; hour <= 20; hour++) {
            if (hour === 14) continue; // Evita la hora 14:00
            for (let minutes = 0; minutes < 60; minutes += 15) {
                times.push(`${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
            }
        }
        return times;
    };

    const reserveAppointment = async (date, time, service) => {
        await addDoc(collection(db, 'reservas'), {
            userId: userId,
            fecha: date,
            hora: time,
            servicio: service,
        });
    };

    const getDaysInWeek = () => {
        const startOfWeek = new Date(currentWeek);
        const dayOfWeek = startOfWeek.getDay();
        const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek; // Ajuste para que el lunes sea el primer día
        startOfWeek.setDate(currentWeek.getDate() + diff);
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to midnight for comparison

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground source={require('../assets/background.jpg')} style={styles.background}>
                <Text style={styles.title}>Solicitar Cita</Text>

                <View style={styles.mainContainer}>
                    <Text style={styles.monthIndicator}>
                        {currentWeek.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </Text>

                    {/* Fila de navegación y días de la semana */}
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
                                const isBeforeToday = day < today; // Verifica si el día es anterior a hoy
                                const isUnavailable = unavailableDates.includes(day.toISOString().split('T')[0]);
                            
                                return (
                                    <View key={index} style={styles.dayContainer}>
                                        <Text style={styles.weekNumberText}>{day.toLocaleDateString('es-ES', { weekday: 'short' })}</Text>
                                        <TouchableOpacity
                                            onPress={() => !isBeforeToday && !isUnavailable && handleDayPress(day)} // Deshabilitar clic si es antes de hoy o no disponible
                                            style={[
                                                getDayButtonStyle(day, selectedDate),
                                                (isBeforeToday || isUnavailable) && styles.disabledDayButton // Aplica estilo deshabilitado
                                            ]}
                                            disabled={isBeforeToday || isUnavailable} // Deshabilitar botón si es necesario
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
                </View>

                <Text style={styles.serviceLabel}>Selecciona un servicio:</Text>
                <Picker
                    selectedValue={selectedService}
                    style={styles.picker}
                    onValueChange={(itemValue) => setSelectedService(itemValue)}>
                    <Picker.Item label="Selecciona un servicio" value="" />
                    {services.map((service) => (
                        <Picker.Item key={service.id} label={service.nombre} value={service.id} />
                    ))}
                </Picker>

                <Text style={styles.availableTimesLabel}>Horarios Disponibles:</Text>
                <ScrollView horizontal style={styles.scrollView}>
                    {availableTimes.map((time, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setSelectedTime(time)}
                            style={[styles.timeButton, selectedTime === time && styles.selectedTime]}
                        >
                            <Text style={styles.timeText}>{time}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <TouchableOpacity onPress={handleConfirmAppointment} style={styles.confirmButton}>
                    <Text style={styles.confirmText}>Confirmar Cita</Text>
                </TouchableOpacity>
            </ImageBackground>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    mainContainer: {
        marginBottom: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo negro con 70% de opacidad
        borderWidth: 5, // Ancho del borde
        borderColor: 'white', // Color del borde
        borderRadius: 10, // Bordes redondeados
        padding: 10, // Espaciado interno
    },
    monthIndicator: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 10,
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
    },
    navButton: {
        padding: 10,
    },
    navText: {
        color: 'white',
        fontSize: 24, // Aumentar tamaño del texto de navegación
    },
    weekContainer: {
        flexDirection: 'row',
    },
    dayContainer: {
        alignItems: 'center',
        marginHorizontal: 4, // Reducir el margen entre los días
    },
    weekNumberText: {
        color: 'white',
        fontSize: 14, 
    },
    dayButton: {
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 5, 
        alignItems: 'center',
        width: 30, // Ancho del botón
        height: 30, // Altura del botón
    },
    unavailable: {
        backgroundColor: 'lightgray', // Color para días no disponibles
    },
    dayText: {
        color: 'black',
        fontSize: 16, // Ajustar tamaño del texto del día
    },
    todayButton: {
        borderWidth: 2,
        borderColor: 'blue', // Borde azul para el día de hoy
    },
    selectedDayButton: {
        borderWidth: 2,
        borderColor: 'green', // Borde verde para el día seleccionado
    },
    serviceLabel: {
        color: 'white',
        marginTop: 20,
        marginBottom: 10,
        fontSize: 18, // Aumentar tamaño de la etiqueta de servicio
    },
    picker: {
        height: 50,
        width: '100%',
        backgroundColor: 'white',
    },
    availableTimesLabel: {
        color: 'white',
        marginTop: 20,
        marginBottom: 10,
        fontSize: 18, // Aumentar tamaño de la etiqueta de horarios
    },
    scrollView: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    timeButton: {
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 10,
        marginHorizontal: 5,
    },
    selectedTime: {
        backgroundColor: 'green',
    },
    timeText: {
        color: 'black',
    },
    confirmButton: {
        backgroundColor: 'black',
        borderRadius: 5,
        padding: 15,
        alignItems: 'center',
    },
    confirmText: {
        color: 'white',
        fontWeight: 'bold',
    },
    disabledDayButton: {
        backgroundColor: 'lightgray', // Color para los días deshabilitados
        opacity: 0.6, // Reduce la opacidad para un efecto deshabilitado
    },
});

export default ClientRequestAppointmentScreen;