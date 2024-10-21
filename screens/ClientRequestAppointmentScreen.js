import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';

// Configuración del idioma a español
LocaleConfig.locales['es'] = {
    monthNames: [
        'Enero', 'Febrero', 'Marzo', 'Abril',
        'Mayo', 'Junio', 'Julio', 'Agosto',
        'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ],
    monthNamesShort: [
        'Ene', 'Feb', 'Mar', 'Abr',
        'May', 'Jun', 'Jul', 'Ago',
        'Sep', 'Oct', 'Nov', 'Dic'
    ],
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    today: 'Hoy',
};

LocaleConfig.defaultLocale = 'es';

const ClientRequestAppointmentScreen = () => {
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);
    const [selectedTime, setSelectedTime] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const navigation = useNavigation(); // Hook para navegación

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(false);
        setDate(currentDate);
        // Aquí puedes calcular los horarios disponibles según la fecha seleccionada
        setAvailableTimes(getAvailableTimes(currentDate));
    };

    const getAvailableTimes = (selectedDate) => {
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

        return times;
    };

    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    };

    return (
        <ImageBackground source={require('../assets/background.jpg')} style={styles.container}>
            <Text style={styles.title}>Solicitar Cita</Text>
            <Text style={styles.instruction}>Selecciona un día y hora para tu servicio:</Text>

            <View style={styles.calendarContainer}>
                <Calendar
                    minDate={new Date().toISOString().split('T')[0]}
                    onDayPress={onChange}
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
                        dotColor: 'red',
                        arrowColor: 'white',
                        monthTextColor: 'white',
                        indicatorColor: 'white',
                    }}
                />
            </View>

            {availableTimes.length > 0 && (
                <View style={styles.timeSelectorContainer}>
                    <TouchableOpacity style={styles.arrowButton}>
                        <Text style={styles.arrowText}>{'<'}</Text>
                    </TouchableOpacity>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeSelector}>
                        {availableTimes.map((time, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.chip, selectedTime === time && styles.chipSelected]}
                                onPress={() => setSelectedTime(time)}
                            >
                                <Text style={styles.chipText}>{time}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity style={styles.arrowButton}>
                        <Text style={styles.arrowText}>{'>'}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Contenedor para la fecha y hora seleccionadas */}
            <View style={styles.selectedContainer}>
                <Text style={styles.selectedText}>Fecha y Hora Seleccionada:</Text>
                <Text style={styles.selectedDate}>{date.toLocaleDateString()} {selectedTime || 'No seleccionado'}</Text>
            </View>

            {show && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode={mode}
                    is24Hour={true}
                    display="default"
                    onChange={onChange}
                />
            )}

            <Text style={styles.confirmationText}>¡Confirma tu cita haciendo clic en "Confirmar Cita"!</Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={styles.confirmButton} 
                    onPress={() => console.log("Cita Confirmada")}
                >
                    <Text style={styles.confirmButtonText}>Confirmar Cita</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => navigation.navigate('HomeScreenClient')}
                >
                    <Text style={styles.backButtonText}>Volver Atrás</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

// Estilos actualizados
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 28,
        marginTop: 25,
        marginBottom: 10,
        color: 'white',
        fontWeight: 'bold',
    },
    instruction: {
        fontSize: 18,
        marginBottom: 20,
        color: 'white',
        textAlign: 'center',
    },
    calendarContainer: {
        width: '90%',
        marginHorizontal: '5%',
        marginBottom: 16,
        borderRadius: 25,
        overflow: 'hidden',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 5,
        borderColor: 'black',
    },
    timeSelectorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        marginHorizontal: '5%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 25,
        borderWidth: 5,
        borderColor: 'black',
    },
    selectedContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo blanco con opacidad
        borderRadius: 10,
        padding: 15,
        marginVertical: 20,
        width: '90%',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'black',
    },
    selectedText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
    },
    selectedDate: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
        marginTop: 10,
    },
    confirmationText: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        marginVertical: 10,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginTop: 20,
    },
    confirmButton: {
        backgroundColor: 'black',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    backButton: {
        backgroundColor: 'white',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    backButtonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    arrowButton: {
        padding: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    arrowText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    timeSelector: {
        flexGrow: 1,
        marginVertical: 10,
    },
    chip: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 10,
        borderRadius: 20,
        marginHorizontal: 5,
    },
    chipSelected: {
        backgroundColor: 'black',
    },
    chipText: {
        color: 'black',
        fontWeight: 'bold',
    },
});

export default ClientRequestAppointmentScreen;