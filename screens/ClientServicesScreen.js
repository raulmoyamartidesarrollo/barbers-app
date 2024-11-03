import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../services/Firebase';
import Icon from 'react-native-vector-icons/FontAwesome';

const ClientServicesScreen = ({ navigation }) => {
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
        source={require('../assets/fondo_generico.png')}
        style={styles.backgroundImage}
        resizeMode='cover'
      >
        <View style={styles.overlay}>
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
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
  <Icon name="arrow-left" size={20} color="black" />
  <Text style={styles.backButtonText}> Volver</Text>
</TouchableOpacity>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute', // Fijo en la parte inferior
    bottom: 20, // Ajusta este valor según sea necesario
    left: '10%', // Ajuste de margen a la izquierda
    right: '10%', // Ajuste de margen a la derecha
    backgroundColor: 'white', // Fondo blanco
    padding: 10,
    borderRadius: 55, // Bordes redondeados
    justifyContent: 'center',
    elevation: 3, // Sombra en Android (opcional)
    shadowColor: 'black', // Sombra en iOS (opcional)
    shadowOffset: { width: 0, height: 2 }, // Offset de la sombra
    shadowOpacity: 0.3, // Opacidad de la sombra
    shadowRadius: 4, // Radio de la sombra
  },
  overlay: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    borderWidth: 5,
    borderColor: 'black',
    padding: 20,
    justifyContent: 'flex-start', // Alinear el contenido hacia arriba
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
    flex: 1,
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
    position: 'absolute', // Fijo en la parte inferior
    bottom: 20, // Ajusta este valor según sea necesario
    left: '10%', // Ajuste de margen a la izquierda
    right: '10%', // Ajuste de margen a la derecha
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#000',
    marginLeft: 5,
  },
});

export default ClientServicesScreen;