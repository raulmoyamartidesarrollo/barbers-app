import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ImageBackground, SafeAreaView, Dimensions } from 'react-native';
import { getFirestore, collection, getDocs, addDoc,doc, getDoc  } from 'firebase/firestore';
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
            // Obtener el documento con ID 'fechas' dentro de la colección 'fechas_no_disponibles'
            const docRef = doc(db, 'fechas_no_disponibles', 'fechas'); // Acceder al documento 'fechas'
            const docSnap = await getDoc(docRef); // Obtener el documento
        
            // Verificar si el documento existe
            if (docSnap.exists()) {
                const docData = docSnap.data(); // Obtener los datos del documento
        
                // Recorrer todos los campos de fecha (fecha_01, fecha_02, etc.)
                Object.keys(docData).forEach(field => {
                    const fieldValue = docData[field];
        
                    // Verificar si el campo es un Timestamp y convertirlo a fecha
                    if (fieldValue && fieldValue.toDate) {
                        dates.push(fieldValue.toDate().toISOString().split('T')[0]); // Formato YYYY-MM-DD
                    }
                });
        
                // Almacenar las fechas no disponibles
                setUnavailableDates(dates);
            } else {
                console.log("El documento 'fechas' no existe");
            }
        } catch (error) {
            console.error("Error al cargar las fechas no disponibles:", error);
        }
    };

    const generateAvailableTimes = (dayKey) => {
        if (!horarios[dayKey]) return;
        const { mañana, tarde } = horarios[dayKey];
        const available = [];
        if (mañana) available.push(...generateTimeSlots(mañana.inicio, mañana.fin));
        if (tarde) available.push(...generateTimeSlots(tarde.inicio, tarde.fin));
        setAvailableTimes(available);
    };

    const generateTimeSlots = (startTime, endTime) => {
        const slots = [];
        const start = new Date(`1970-01-01T${startTime}:00`);
        const end = new Date(`1970-01-01T${endTime}:00`);
        for (let time = start; time <= end; time.setMinutes(time.getMinutes() + 15)) {
            slots.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
        return slots;
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
        const dayOfWeek = day.toLocaleDateString('es-ES', { weekday: 'long' });  // Obtiene el día de la semana (ej. "Lunes", "Martes", etc.)
        await loadAvailableTimes(dayOfWeek);
    };


    const loadAvailableTimes = async () => {
        try {
          // Referencia correcta al documento 'horariosHabituales' dentro de la colección 'horarios'
          const docRef = doc(db, 'horarios', 'horariosHabituales');
          const docSnap = await getDoc(docRef);
      
          if (docSnap.exists()) {
            const horarios = docSnap.data();
            console.log("Horarios obtenidos:", horarios);
      
            // Procesa los horarios aquí, por ejemplo:
            // Extrae los horarios de cada día
            const diasDeLaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            const horariosDisponibles = {};
      
            // Generar los tramos horarios de 15 minutos para cada día
            diasDeLaSemana.forEach(dia => {
              if (horarios[dia]) {
                const { mañana, tarde } = horarios[dia];
                horariosDisponibles[dia] = {
                  mañana: {
                    inicio: mañana.inicio,
                    fin: mañana.fin,
                    tramos: generateTimeSlots(mañana.inicio, mañana.fin)
                  },
                  tarde: {
                    inicio: tarde.inicio,
                    fin: tarde.fin,
                    tramos: generateTimeSlots(tarde.inicio, tarde.fin)
                  },
                };
              }
            });
      
            console.log("Horarios procesados:", horariosDisponibles);
            // Aquí puedes actualizar el estado o hacer cualquier otra acción con los horarios
            setHorariosDisponibles(horariosDisponibles); // Guarda los horarios en un estado si es necesario
      
          } else {
            console.error('No se encontró el documento de horariosHabituales');
          }
        } catch (error) {
          console.error('Error al cargar los horarios disponibles:', error);
        }
      };
      
     
      
      // Convierte una hora (hh:mm) a minutos desde medianoche
      const convertToMinutes = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      // Convierte minutos desde medianoche a formato hora (hh:mm)
      const convertToTimeFormat = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
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

    const getDaysInWeek = () => {
        const startOfWeek = new Date(currentWeek);
        startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1);
        return Array.from({ length: 7 }, (_, i) => new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i));
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

                                return (
                                    <View key={index} style={styles.dayContainer}>
                                        <Text style={styles.weekNumberText}>{day.toLocaleDateString('es-ES', { weekday: 'short' })}</Text>
                                        <TouchableOpacity
                                            onPress={() => !isBeforeToday && !isUnavailable && handleDayPress(day)}
                                            style={[
                                                styles.dayButton,
                                                (isBeforeToday || isUnavailable) && styles.disabledDayButton,
                                                day.toISOString() === selectedDate?.toISOString() && styles.selectedDayButton,
                                            ]}
                                            disabled={isBeforeToday || isUnavailable}
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
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        marginVertical: 10,
    },
    mainContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 20,
        borderRadius: 10,
        marginHorizontal: 10,
    },
    monthIndicator: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    navigationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    navButton: {
        padding: 10,
    },
    navText: {
        fontSize: 18,
        color: '#333',
    },
    weekContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    dayContainer: {
        alignItems: 'center',
        marginHorizontal: 5,
    },
    weekNumberText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
        marginBottom: 5,
    },
    dayButton: {
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#333',
    },
    dayText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    disabledDayButton: {
        opacity: 0.3,
    },
    todayButton: {
        borderColor: '#007bff',
        borderWidth: 2,
    },
    selectedDayButton: {
        backgroundColor: '#007bff',
    },
    selectorContainer: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    picker: {
        borderColor: '#333',
        borderWidth: 1,
        borderRadius: 5,
        marginVertical: 10,
        paddingHorizontal: 10,
    },
    serviceContainer: {
        flexDirection: 'row',
        marginVertical: 10,
    },
    chip: {
        marginHorizontal: 5,
        backgroundColor: '#FFF',
        borderColor: '#333',
        borderWidth: 1,
    },
    chipSelected: {
        backgroundColor: '#007bff',
    },
    chipText: {
        color: '#333',
    },
    confirmButton: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 5,
        marginTop: 10,
    },
    confirmButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    backButtonText: {
        fontSize: 18,
        color: '#FFF',
        marginLeft: 10,
    },
});

export default ClientRequestAppointmentScreen;