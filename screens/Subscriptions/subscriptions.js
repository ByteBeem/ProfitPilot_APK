import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    SafeAreaView,
    Text,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import ErrorModal from '../../components/ErrorModal';

const Subscriptions = ({ navigation }) => {
    const [loadingStates, setLoadingStates] = useState({
        '1': false,
        '2': false,
        '3': false,
    });
    const [location, setLocation] = useState('');
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const [error, setError] = useState(null);

    const handleCloseError = () => {
      setIsOpen(false);
      setError(null);
    };

    const convertToDollar = (price) => {
        const randToDollarRate = 1 / 17;
        const priceInRand = parseFloat(price.replace('R', ''));
        return `$${(priceInRand * randToDollarRate).toFixed(2)}`;
    };

    const fetchPlans = useCallback(async (countryCode) => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token');

        try {
            const response = await axios.post('https://profitpilot.ddns.net/subscriptions/plans', { token });
            if (response.status === 200) {
                let fetchedPlans = response.data.plans;
                if (countryCode !== 'ZA') {
                    fetchedPlans = fetchedPlans.map((plan) => ({
                        ...plan,
                        price: convertToDollar(plan.price),
                    }));
                }
                setPlans(fetchedPlans);
            }
        } catch (err) {
            handleError(err);
          
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const getCountryCode = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            let reverseGeocode = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (reverseGeocode.length > 0) {
                const countryCode = reverseGeocode[0].isoCountryCode;
                 setLocation(countryCode);
                fetchPlans(countryCode);
               
            }
        };

        getCountryCode();
    }, [fetchPlans]);

    const handleSubmit = useCallback(
        async (planId) => {
            setIsButtonDisabled(true);
            setLoadingStates((prevState) => ({ ...prevState, [planId]: true }));
            const token = await AsyncStorage.getItem('token');
          
            
            try {
                const response = await axios.post(
                    'https://profitpilot.ddns.net/subscriptions/create-payment',
                    { planId, token, location }
                );

                if (response.status === 200) {
                    navigation.navigate('WebView', {
                        Link: response.data.paymentLink.paylinkUrl || response.data.paymentLink,
                    });
                }
            } catch (err) {
                handleError(err);
            } finally {
                setLoadingStates((prevState) => ({ ...prevState, [planId]: false }));
                setIsButtonDisabled(false);
            }
        },
        [location, navigation]
    );

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

    const renderPlan = (plan) => (
        <View key={plan.id} style={styles.planContainer}>
            <Text style={styles.planTitle}>{plan.title}</Text>
            <Text style={styles.planPrice}>{plan.price}</Text>
            {plan.features.map((feature, index) => (
                <Text key={index} style={styles.planFeature}>
                    {feature}
                </Text>
            ))}
            {loadingStates[plan.id] ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <TouchableOpacity
                    style={[styles.subscribeButton, isButtonDisabled && styles.disabledBtn]}
                    onPress={() => handleSubmit(plan.id)}
                    disabled={isButtonDisabled}
                >
                    <Text style={styles.subscribeButtonText}>Subscribe</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Subscriptions</Text>
            </View>
            {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
            <ScrollView contentContainerStyle={styles.content}>
                {plans.map(renderPlan)}
            </ScrollView>

            <ErrorModal isOpen={isOpen} error={error} onClose={handleCloseError} />
          
        </SafeAreaView>
    );
};

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: { 
        paddingTop: 45,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: windowWidth * 0.08,
        paddingVertical: windowWidth * 0.08,
    },
    backButton: {
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flexGrow: 1,
        padding: 20,
        alignItems: 'center',
    },
    disabledBtn: {
        backgroundColor: '#888',
    },
    planContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
        width: windowWidth * 0.9,
    },
    planTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    planPrice: {
        fontSize: 18,
        color: '#333',
        marginVertical: 10,
    },
    planFeature: {
        fontSize: 16,
        color: '#555',
    },
    subscribeButton: {
        marginTop: 20,
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    subscribeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Subscriptions;
