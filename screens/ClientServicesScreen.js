import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../services/Firebase';
import Icon from 'react-native-vector-icons/FontAwesome';

const ClientServicesScreen = ({ navigation }) => { // Añadir prop para navegación
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const db = getFirestore(app);
        const servicesCollection = collection(db, 'servicios');
        const serviceSnapshot = await getDocs(servicesCollection);
        const servicesList = serviceSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(servicesList);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los servicios: ", error);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Cargando servicios...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../assets/background.jpg')}
        style={styles.backgroundImage}
        resizeMode='cover'
      >
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={20} color="white" />
            <Text style={styles.backButtonText}> Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Servicios</Text>

          <View style={styles.contentWrapper}>
            <FlatList
              data={services}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.serviceCard}>
                  <View style={styles.serviceRow}>
                    <Text style={styles.serviceTitle}>
                      - {item.nombre} - ({item.duracion} Min)
                    </Text>
                    <View style={styles.dotsContainer}>
                      <Text style={styles.dots}></Text>
                    </View>
                    <Text style={styles.servicePrice}>{item.precio} €</Text>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    marginHorizontal: 20, // Espaciado lateral de 20 píxeles
    marginVertical: 20,   // Espaciado superior e inferior de 20 píxeles
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Capa negra con opacidad al 50%
    borderRadius: 10,
    borderWidth: 5,       // Borde negro de 5 píxeles
    borderColor: 'black',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  contentWrapper: {
    flex: 1,
  },
  serviceCard: {
    paddingVertical: 10,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  dotsContainer: {
    flex: 1, // Esto permitirá que el contenedor de puntos ocupe el espacio disponible
    justifyContent: 'center',
  },
  dots: {
    textAlign: 'center',
    color: 'white',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: 'white',
    marginVertical: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: 'white',
    marginLeft: 5,
  },
});

export default ClientServicesScreen;