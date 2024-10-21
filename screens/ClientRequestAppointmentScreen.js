import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, LocaleConfig } from 'react-native-calendars';

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

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(false);
        setDate(currentDate);
    };

    const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
    };

    const disabledDays = {
        '2024-10-21': { color: 'red' }, // Ejemplo de un día no disponible
        '2024-10-22': { color: 'red' },
    };

    return (
        <ImageBackground
            source={require('../assets/background.jpg')}
            style={styles.container}
        >
            <Text style={styles.title}>Solicitar Cita</Text>
            <Text style={styles.instruction}>Selecciona un día y hora para tu servicio:</Text>
            
            <View style={styles.calendarContainer}>
                <Calendar
                    minDate={new Date().toISOString().split('T')[0]} // No permitir reservas en fechas anteriores
                    markedDates={disabledDays}
                    onDayPress={(day) => {
                        console.log('Día seleccionado: ', day);
                    }}
                    style={styles.calendar}
                    theme={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo negro transparente
                        calendarBackground: 'rgba(0, 0, 0, 0.5)', // Fondo del calendario
                        textSectionTitleColor: 'white', // Color de título de sección
                        selectedDayBackgroundColor: 'white', // Color del día seleccionado
                        selectedDayTextColor: 'black', // Color del texto del día seleccionado
                        todayTextColor: 'white', // Color del texto de hoy
                        dayTextColor: 'white', // Color de texto de los días
                        textDisabledColor: 'gray', // Color de texto para días no disponibles
                        dotColor: 'red', // Color de los puntos
                        arrowColor: 'white', // Color de flechas de navegación
                        monthTextColor: 'white', // Color del texto del mes
                        indicatorColor: 'white', // Color del indicador
                    }}
                />
            </View>
            
            <View style={styles.pickerContainer}>
                <TouchableOpacity style={styles.button} onPress={() => showMode('date')}>
                    <Text style={styles.buttonText}>📅 Seleccionar Fecha</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => showMode('time')}>
                    <Text style={styles.buttonText}>🕒 Seleccionar Hora</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.selectedDate}>Seleccionado: {date.toLocaleString()}</Text>
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

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.confirmButton} onPress={() => console.log("Cita Confirmada")}>
                    <Text style={styles.confirmButtonText}>Confirmar Cita</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.backButton} onPress={() => console.log("Volver Atrás")}>
                    <Text style={styles.backButtonText}>Volver Atrás</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

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
    calendar: {
        borderWidth: 5,
        borderColor: 'black',
    },
    pickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: 16,
    },
    selectedDate: {
        fontSize: 18,
        marginTop: 16,
        color: 'white',
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
    button: {
        backgroundColor: '#4CAF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default ClientRequestAppointmentScreen;