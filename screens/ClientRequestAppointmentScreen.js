import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { db } from '../services/Firebase';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { useUser } from '../services/UserContext';



// Configuración del idioma a español
LocaleConfig.locales['es'] = {
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    dayNames: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    dayNamesShort: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    today: 'Hoy',
};

LocaleConfig.defaultLocale = 'es';

const ClientRequestAppointmentScreen = () => {
    const [date, setDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [disabledDates, setDisabledDates] = useState({});
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchDisabledDates = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'fechas_no_disponibles'));
                const disabled = {};

                // Agregar fechas no disponibles de Firestore
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    disabled[data.fecha] = { disabled: true, disableTouchEvent: true, color: 'red', textColor: 'white' };
                });

                // Deshabilitar domingos
                const today = new Date();
                const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // primer día de la semana (domingo)
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6); // fin de la semana (sábado)

                for (let d = startOfWeek; d <= endOfWeek; d.setDate(d.getDate() + 1)) {
                    if (d.getDay() === 0) { // si es domingo
                        const formattedDate = d.toISOString().split('T')[0];
                        disabled[formattedDate] = { disabled: true, disableTouchEvent: true, color: 'red', textColor: 'white' };
                    }
                }

                setDisabledDates(disabled);
            } catch (error) {
                console.error("Error obteniendo fechas no disponibles: ", error);
            }
        };

        const fetchServices = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'servicios'));
                const serviceList = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    serviceList.push({ id: doc.id, ...data });
                });
                setServices(serviceList);
            } catch (error) {
                console.error("Error obteniendo servicios: ", error);
            }
        };

        fetchDisabledDates();
        fetchServices();
    }, []);

    const onChange = async (day) => {
        const selectedDate = new Date(day.timestamp);
        setDate(selectedDate);
        setAvailableTimes(await getAvailableTimes(selectedDate));
        setSelectedTime(null); // Reiniciar el tiempo seleccionado al cambiar de fecha
    };

    const getAvailableTimes = async (selectedDate) => {
        const times = [];
        const startTime = new Date(selectedDate.setHours(10, 0, 0));
        const endTimeMorning = new Date(selectedDate.setHours(14, 0, 0));
        const startTimeAfternoon = new Date(selectedDate.setHours(16, 0, 0));
        const endTimeEvening = new Date(selectedDate.setHours(20, 0, 0));

        while (startTime <= endTimeMorning) {
            times.push(startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            startTime.setMinutes(startTime.getMinutes() + 15);
        }

        while (startTimeAfternoon <= endTimeEvening) {
            times.push(startTimeAfternoon.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            startTimeAfternoon.setMinutes(startTimeAfternoon.getMinutes() + 15);
        }

        // Filtrar horarios ocupados
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const querySnapshot = await getDocs(query(collection(db, 'reservas'), where('fecha', '==', formattedDate)));
        const reservedTimes = querySnapshot.docs.map(doc => doc.data().hora);

        return times.filter(time => !reservedTimes.includes(time));
    };

    const handleConfirmAppointment = async () => {
        if (!selectedTime || !selectedService) {
            Alert.alert("Error", "Por favor, selecciona un servicio y una hora.");
            return;
        }

        const { userId } = useUser();
        console.log("userId: ", userId);
        const appointmentDate = date.toISOString().split('T')[0];
        const appointmentTime = selectedTime;

        try {
            // Guarda la reserva en Firestore
            await addDoc(collection(db, 'reservas'), {
                userId,
                fecha: appointmentDate,
                hora: appointmentTime,
                servicio: selectedService, // Usar el servicio seleccionado
            });

            Alert.alert("Éxito", "Cita confirmada exitosamente!");

            // Preguntar si desea repetir la cita
            Alert.alert("Repetir Cita", "¿Deseas repetir esta cita hasta final de año?", [
                { text: "Sí", onPress: () => handleRepeatAppointment(userId, appointmentDate, appointmentTime) },
                { text: "No", onPress: () => navigation.navigate('HomeScreenClient') },
            ]);
        } catch (error) {
            console.error("Error al confirmar la cita: ", error);
            Alert.alert("Error", "Hubo un problema al confirmar la cita. Inténtalo nuevamente.");
        }
    };

    const handleRepeatAppointment = async (userId, appointmentDate, appointmentTime) => {
        const today = new Date();
        const endYear = new Date(today.getFullYear(), 11, 31); // Final de año

        // Reservar citas todos los lunes a la misma hora hasta el final del año
        for (let d = new Date(appointmentDate); d <= endYear; d.setDate(d.getDate() + 7)) {
            const formattedDate = d.toISOString().split('T')[0];
            try {
                await addDoc(collection(db, 'reservas'), {
                    userId,
                    fecha: formattedDate,
                    hora: appointmentTime,
                    servicio: selectedService, // Usar el servicio seleccionado
                });
            } catch (error) {
                console.error("Error al repetir la cita: ", error);
            }
        }

        Alert.alert("Éxito", "Citas repetidas confirmadas hasta el final del año!");
        navigation.navigate('HomeScreenClient');
    };

    return (
        <ImageBackground source={require('../assets/background.jpg')} style={styles.container}>
            <Text style={styles.title}>Solicitar Cita</Text>
            <Text style={styles.instruction}>Selecciona un día y hora para tu servicio:</Text>

            <View style={styles.calendarContainer}>
                <Calendar
                    minDate={new Date().toISOString().split('T')[0]}
                    onDayPress={onChange}
                    markedDates={disabledDates}
                    firstDay={1} // Establecer el primer día de la semana en lunes
                    style={styles.calendar}
                    theme={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        calendarBackground: 'rgba(0, 0, 0, 0.5)',
                        textSectionTitleColor: 'white',
                        selectedDayBackgroundColor: 'white',
                        selectedDayTextColor: 'black',
                        todayTextColor: 'white',
                        dayTextColor: 'white',
                        textDisabledColor: 'gray',
                        dotColor: 'white',
                        selectedDotColor: 'black',
                    }}
                />
            </View>

            <Picker
                selectedValue={selectedService}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedService(itemValue)}
            >
                <Picker.Item label="Selecciona un servicio" value={null} />
                {services.map((service) => (
                    <Picker.Item key={service.id} label={service.nombre} value={service.id} />
                ))}
            </Picker>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {availableTimes.map((time, index) => (
                    <TouchableOpacity key={index} onPress={() => setSelectedTime(time)} style={[styles.timeButton, selectedTime === time && styles.selectedTime]}>
                        <Text style={styles.timeText}>{time}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity onPress={handleConfirmAppointment} style={styles.confirmButton}>
                <Text style={styles.confirmText}>Confirmar Cita</Text>
            </TouchableOpacity>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 20,
    },
    instruction: {
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
        marginBottom: 20,
    },
    calendarContainer: {
        marginBottom: 20,
    },
    calendar: {
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 10,
    },
    picker: {
        height: 50,
        width: '100%',
        color: 'black',
        marginBottom: 20,
    },
    timeButton: {
        backgroundColor: 'black',
        borderRadius: 10,
        padding: 10,
        marginHorizontal: 5,
    },
    selectedTime: {
        backgroundColor: 'white',
    },
    timeText: {
        color: 'white',
        fontWeight: 'bold',
    },
    confirmButton: {
        backgroundColor: 'black',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
    },
    confirmText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ClientRequestAppointmentScreen;