import React, { useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [signal, setSignal] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCloseError = () => {
    setIsOpen(false);
    setError(null);
  };

  const fetchSignal = useCallback(async (token, pair) => {
    try {
      const { data, status } = await axios.post('https://profitpilot.ddns.net/trading/signals', {
        token,
        pair,
      });

      if (status === 200) {
        setSignal(data.signal);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkSubscription = useCallback(async () => {
    setIsLoading(true);
    setSignal(null);

    const token = await AsyncStorage.getItem('token');
   
    try {
      const { status } = await axios.post('https://profitpilot.ddns.net/subscriptions/check-subscription', { token });
      

      if (status === 200) {
        await fetchSignal(token, selectedPair);
      }
    } catch (error) {
     
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPair, fetchSignal]);

  const handleError = (error) => {
    if (error.response) {
      const message = error.response.data.error || 'An error occurred. Please try again.';
      setError(message);
    } else if (error.request) {
      setError('Network error. Please check your connection.');
    } else {
      setError('An unexpected error occurred.');
    }
    setIsOpen(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/logo.jpeg')} style={styles.logo} />
      </View>
      <Text style={styles.label}>Select Forex Pair:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedPair}
          onValueChange={setSelectedPair}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="Select a pair..." value="" />
          {forexPairs.map(pair => (
            <Picker.Item key={pair.value} label={pair.label} value={pair.value} />
          ))}
        </Picker>
      </View>
      <View style={styles.buttonContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : (
          <Button
            title="Generate Signal"
            onPress={checkSubscription}
            disabled={!selectedPair}
            color="#007BFF"
          />
        )}
      </View>
      <View style={styles.signalBox}>
        {signal ? (
          <View style={styles.infoContainer}>
            <Text style={styles.name}>Selected Pair: {selectedPair}</Text>
            <Text style={styles.signal}>Type: {signal.type}</Text>
            <Text style={styles.signal}>Price: {signal.price}</Text>
            <Text style={styles.signal}>TP: {signal.TP}</Text>
          </View>
        ) : (
          <Text style={styles.noSignal}>Press Genearte Signals.</Text>
        )}
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
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  pickerItem: {
    height: 50,
    fontSize: 16,
  },
  buttonContainer: {
    width: '100%',
  },
  signalBox: {
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
  infoContainer: {
    flex: 1,
  },
  signal: {
    padding: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  noSignal: {
    fontSize: 18,
    color: '#333',
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
