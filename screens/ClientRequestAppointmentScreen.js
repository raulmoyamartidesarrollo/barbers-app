import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ImageBackground, SafeAreaView, Dimensions } from 'react-native';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore'; 
import { useUser } from '../services/UserContext'; 
import { Picker } from '@react-native-picker/picker'; 
import { Chip } from 'react-native-paper'

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
                <View style={styles.chipContainer}>
                    {services.map((service) => {
                        // Calculamos el espacio entre el servicio y el precio
                        const serviceText = `${service.nombre} - (${service.duracion} Min.)`;
                        const dots = '.'; // Un solo punto
                        const maxLength = 30; // Longitud máxima total del chip (ajusta según sea necesario)
                        const spaceLength = maxLength - serviceText.length - service.precio.length - 3; // 3 para los puntos suspensivos

                        // Creamos la cadena de puntos
                        const dotsToShow = spaceLength > 0 ? dots.repeat(spaceLength) : '';

                        return (
                            <Chip
                                key={service.id}
                                icon={selectedService === service.id ? "check" : "information"}
                                onPress={() => setSelectedService(selectedService === service.id ? '' : service.id)}
                                style={[
                                    styles.chip,
                                    selectedService === service.id && styles.selectedChip,
                                ]}
                            >
                                <Text style={styles.chipText}>
                                    {serviceText} {dotsToShow} {service.precio}€
                                </Text>
                            </Chip>
                        );
                    })}
                </View>

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
    availableTimesLabel: {
        color: 'white',
        fontSize: 18, // Aumentar tamaño de la etiqueta de horarios
        marginBottom: 10,
        marginTop: 20,
    },
    background: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    chip: {
        backgroundColor: '#f0f0f0',
        margin: 5,
        width: '90%',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between', // Asegura que los chips estén justificados
        padding: 10,
    },
    chipText: {
        flexShrink: 1, 
        textAlign: 'left',
    },
    confirmButton: {
        alignItems: 'center',
        backgroundColor: 'black',
        borderRadius: 5,
        padding: 15,
    },
    confirmText: {
        color: 'white',
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
    },
    dayButton: {
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 5,
        height: 30, // Altura del botón
        padding: 5, 
        width: 30, // Ancho del botón
    },
    dayContainer: {
        alignItems: 'center',
        marginHorizontal: 4, // Reducir el margen entre los días
    },
    dayText: {
        color: 'black',
        fontSize: 16, // Ajustar tamaño del texto del día
    },
    disabledDayButton: {
        backgroundColor: 'lightgray', // Color para los días deshabilitados
        opacity: 0.6, // Reduce la opacidad para un efecto deshabilitado
    },
    mainContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo negro con 70% de opacidad
        borderColor: 'white', // Color del borde
        borderRadius: 10, // Bordes redondeados
        borderWidth: 5, // Ancho del borde
        marginBottom: 20,
        padding: 10, // Espaciado interno
    },
    monthIndicator: {
        color: 'white',
        fontSize: 18,
        marginBottom: 10,
        textAlign: 'center',
    },
    navButton: {
        padding: 10,
    },
    navText: {
        color: 'white',
        fontSize: 24, // Aumentar tamaño del texto de navegación
    },
    navigationContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    picker: {
        backgroundColor: 'white',
        height: 50,
        width: '100%',
    },
    scrollView: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    selectedChip: {
        backgroundColor: '#f0f0f0', // Color negro cuando está seleccionado
        borderColor: 'green', // Borde verde cuando está seleccionado
        borderWidth: 3, // Ancho del borde
        color: '#fff',
        fontWeight: 'bold',
    },
    selectedDayButton: {
        borderColor: 'green', // Borde verde para el día seleccionado
        borderWidth: 2,
    },
    selectedTime: {
        backgroundColor: 'green',
    },
    serviceLabel: {
        color: 'white',
        fontSize: 18, // Aumentar tamaño de la etiqueta de servicio
        marginBottom: 10,
        marginTop: 20,
    },
    timeButton: {
        backgroundColor: 'white',
        borderRadius: 5,
        marginHorizontal: 5,
        padding: 10,
    },
    timeText: {
        color: 'black',
    },
    title: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    todayButton: {
        borderColor: 'blue', // Borde azul para el día de hoy
        borderWidth: 2,
    },
    unavailable: {
        backgroundColor: 'lightgray', // Color para días no disponibles
    },
    weekContainer: {
        flexDirection: 'row',
    },
    weekNumberText: {
        color: 'white',
        fontSize: 14, 
    },
});

export default ClientRequestAppointmentScreen;