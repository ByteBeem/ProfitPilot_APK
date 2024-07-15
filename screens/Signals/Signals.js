import React, { useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const forexPairs = [
  { label: 'EUR/USD', value: 'EUR/USD' },
  { label: 'GBP/USD', value: 'GBP/USD' },
  { label: 'USD/JPY', value: 'USD/JPY' },
  { label: 'AUD/USD', value: 'AUD/USD' },
  { label: 'USD/CAD', value: 'USD/CAD' },
  { label: 'USD/CHF', value: 'USD/CHF' },
];

const Signals = ({ navigation }) => {
  const [selectedPair, setSelectedPair] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogOut = useCallback(async () => {
    setIsLoggingOut(true);
    const token = await SecureStore.getItemAsync('token');
    try {
      const response = await axios.post('http://13.48.249.94:3001/auth/logOut', {
        token,
      });
      if (response.status === 200) {
        setIsLoggingOut(false);
        await SecureStore.deleteItemAsync('token');
        navigation.navigate("Login");
      }
    } catch (err) {
      setError("Log Out Failed. Please try again.");
      setIsLoggingOut(false);
      setIsOpen(true);
    }
  }, []);

  const handleGenerate = () => {
    // Implement the generate signal logic here
    alert(`Generating signal for ${selectedPair}`);
  };

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
        <Button
          title="Generate Signal"
          onPress={handleGenerate}
          disabled={!selectedPair}
          color="#007BFF"
        />
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
                {isLoggingOut ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <TouchableOpacity style={styles.iconContainer} onPress={handleLogOut}>
                        <Ionicons name="log-out" size={24} color="black" />
                        <Text style={styles.iconText}>Log Out</Text>
                    </TouchableOpacity>
                )}
            </View>
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
