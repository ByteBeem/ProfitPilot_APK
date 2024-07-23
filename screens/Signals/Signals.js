import React, { useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import ErrorModal from '../../components/ErrorModal';

const forexPairs = [
  { label: 'EUR/USD', value: 'EUR/USD' },
  { label: 'GBP/USD', value: 'GBP/USD' },
  { label: 'USD/JPY', value: 'USD/JPY' },
  { label: 'AUD/USD', value: 'AUD/USD' },
  { label: 'XAU/USD', value: 'XAU/USD' },
  { label: 'USD/CHF', value: 'USD/CHF' },
];

const Signals = ({ navigation }) => {
  const [selectedPair, setSelectedPair] = useState('');
 
  const [signal, setSignal] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCloseError = () => {
    setIsOpen(false);
    setError(null);
  };

  const handleGenerate = useCallback(async (token , selectedPair) => {
   
    try {

      const response = await axios.post('http://13.48.249.94:3001/trading/signals', {
        token: token,
        pair: selectedPair

      })
      if (response.status === 200) {
        setSignal(response.data.signal);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError(error.response.data.error);
        setIsOpen(true);
      }
      else if (error.response && error.response.status === 403) {
        setError(error.response.data.error);
        setIsOpen(true);
      } else if (error.request) {
        setError("Something went wrong on our side.");
        setIsOpen(true);
      } else {
        setError('An error occurred. Please try again.');
        setIsOpen(true);
      }
    } finally {
      setIsLoading(false);
    }

  }, []);

  const CheckSubscription = useCallback(async () => {
  
    setIsLoading(true);
    setSignal('');
    const token = await SecureStore.getItemAsync('token');
    try {
      const response = await axios.post("http://13.48.249.94:3001/subscriptions/check-subscription", {
        token,
      });

     
      if (response.status === 200) {

        await handleGenerate(token , selectedPair);
        return;
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError(error.response.data.error);
        setIsOpen(true);
      }
      else if (error.response && error.response.status === 403) {
        setError(error.response.data.error);
        setIsOpen(true);
      } else if (error.request) {
        setError("Something went wrong on our side.");
        setIsOpen(true);
      } else {
        setError('An error occurred. Please try again.');
        setIsOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedPair]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.jpeg')}
            style={styles.logo}
          />
        </View>
      </View>
      <Text style={styles.label}>Select Forex Pair:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedPair}
          onValueChange={(itemValue) => setSelectedPair(itemValue)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="Select a pair..." value="" />
          {forexPairs.map((pair) => (
            <Picker.Item key={pair.value} label={pair.label} value={pair.value} />
          ))}
        </Picker>
      </View>
      <View style={styles.buttonContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Button
            title="Generate Signal"
            onPress={CheckSubscription}
            disabled={!selectedPair}
            color="#007BFF"
          />
        )}
      </View>
      <View style={styles.SignalBox}>

        <View style={styles.infoContainer}>
          <Text style={styles.name}>Selected Pair: {selectedPair}</Text>
          <Text style={styles.signal}>{signal.type}</Text>
          <Text style={styles.signal}>{signal.price}</Text>
          <Text style={styles.signal}>{signal.TP}</Text>
          

        </View>
      </View>
      <View style={styles.navigation}>
        <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={24} color="black" />
          <Text style={styles.iconText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate('Signals')}>
          <Ionicons name="trending-up" size={24} color="black" />
          <Text style={styles.iconText}>Signals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person" size={24} color="black" />
          <Text style={styles.iconText}>Profile</Text>
        </TouchableOpacity>
       
      </View>
      <ErrorModal isOpen={isOpen} error={error} onClose={handleCloseError} />
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  header: {
    marginVertical: 36,
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 12,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    backgroundColor: 'white',
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  infoContainer: {
    flex: 1,
  },
  SignalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
    marginTop: 70,
  },
  signal:{
    padding: 10,

  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,

  },
  pickerItem: {
    height: 50,
    fontSize: 16,
  },
  buttonContainer: {
    width: '100%',
  },
  navigation: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 2,
    borderTopColor: '#ddd',
  },
  iconContainer: {
    alignItems: 'center',
  },
  iconText: {
    color: '#888',
    marginTop: 5,
  },
});

export default Signals;
