import React, { useState, useEffect, useCallback } from 'react';
import { View, SafeAreaView, Image, Text, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { Picker } from "@react-native-picker/picker";
import axios from 'axios';
import ErrorModal from '../../components/ErrorModal';
import DisclaimerModal from "../../components/Disclaimer";
import AsyncStorage from '@react-native-async-storage/async-storage';


const Home = ({ navigation }) => {
    const [selectedBroker, setSelectedBroker] = useState('');
    const [account, setAccount] = useState('');
    const [password, setPassword] = useState('');
    const [server, setServer] = useState('');
    const [profit, setProfit] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [serverOptions, setServerOptions] = useState([]);
    const [Trading, setTrading] = useState(false);
    const [tradingStatus, setTradingStatus] = useState('Not Started');
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenDisclaimer, setIsOpenDisclaimer] = useState(false);
    const [error, setError] = useState(null);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [brokerServers, setBrokerServers] = useState({});
    const [selectedPair, setSelectedPair] = useState('');

    const forexPairs = [
        { label: 'EUR/USD', value: 'EUR/USD' },
        { label: 'GBP/USD', value: 'GBP/USD' },
        { label: 'USD/JPY', value: 'USD/JPY' },
        { label: 'XAU/USD', value: 'XAU/USD' },
        { label: 'USD/CAD', value: 'USD/CAD' },
        { label: 'USD/CHF', value: 'USD/CHF' },
    ];

    const fetchBrokerServers = async () => {
        
       
        try {
            setIsLoading(true);
            const response = await fetch('http://13.48.249.94:3001/trading/broker-servers');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setBrokerServers(data);
            setIsLoading(false);
        } catch (error) {
            setError('Failed to fetch broker servers');
            setIsLoading(false);
        }
    };

   

    useEffect(() => {
        const loadData = async () => {
            try {
                const isTrading = await AsyncStorage.getItem('trading');
                const tradingStatus = await AsyncStorage.getItem('TradingStatus');
                if (isTrading === "true" && tradingStatus === "In progress") {
                   
                   setIsButtonDisabled(false);
                    setTrading(true);
                    setTradingStatus(tradingStatus);
                 
                }
                
                fetchBrokerServers();
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        loadData();
        
    }, [Trading]);

    useEffect(() => {
        setIsButtonDisabled(
            !account ||
            !selectedBroker ||
            !password ||
            !server ||
            !profit ||
            !selectedPair
        );
    }, [selectedBroker, selectedPair, account, password, server, profit]);

    const handleBrokerChange = (value) => {
        setSelectedBroker(value);
        setServer('');
        setServerOptions(brokerServers[value]);
    };

    const handleCloseError = () => {
        setIsOpen(false);
        setError(null);
    };

    const handleCloseDisclaimer = () => {
        setIsOpenDisclaimer(false);
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const handleSubmit = useCallback(async (token, account, server, password, selectedBroker, profit, selectedPair) => {
        setIsLoading(true);
        
        try {
            if (Trading) {
                setTradingStatus("Stopping , please wait...");
                await AsyncStorage.clear();
                await StopTrading();
                return;
            } else {
                setTradingStatus("Starting , please wait...");
                const response = await axios.post("http://13.48.249.94:3001/trading/Start-trading", {
                    token,
                    login: account,
                    selectedBroker,
                    serverName: server,
                    password,
                    profit,
                    selectedPair
                });

                if (response.status === 200) {
                    setTrading(true);
                    setTradingStatus("In progress")
                    const status = 'In progress';
                    const istrading = 'true';
                    await AsyncStorage.setItem('TradingStatus' , status);
                    await AsyncStorage.setItem('trading', istrading);
                    setIsLoading(false);
                    
            
                }
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setError(error.response.data.error);
                setIsOpen(true);
                setTradingStatus("Failed to start");
            }
            else if (error.response && error.response.status === 401) {
                setError(error.response.data.error);
                setIsOpen(true);
                setTradingStatus("Failed to start");
            } else if (error.request) {
                setError("Something went wrong on our side.");
                setIsOpen(true);
                setTradingStatus("Failed to start");
            } else {
                setError('An error occurred. Please try again.');
                setIsOpen(true);
                setTradingStatus("Failed to start");
            }
        } finally {
            setIsLoading(false);
        }
    }, [account, server, password, selectedBroker, Trading, profit]);

  

    const StopTrading = useCallback(async () => {
        setIsLoading(true);
        const token = await SecureStore.getItemAsync('token');
        try {
            const response = await axios.post("http://13.48.249.94:3001/trading/Stop-trading", {
                token,
            });
            if (response.status === 200) {
                setError("Trading has Stopped");
                setTrading(false);
                setTradingStatus("Stopped");
                setIsLoading(false);
                setIsOpen(true);
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setError(error.response.data.error);
                setIsOpen(true);

            }
            else if (error.response && error.response.status === 401) {
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
        setIsOpenDisclaimer(true);
        setIsLoading(true);
        const token = await SecureStore.getItemAsync('token');
        try {
            const response = await axios.post("http://13.48.249.94:3001/subscriptions/check-subscription", {
                token,
            });
            if (response.status === 200) {

                await handleSubmit(token, account, server, password, selectedBroker, profit, selectedPair);
                return;
            }
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setError(error.response.data.error);
                setIsOpen(true);
            }
            else if (error.response && error.response.status === 401) {
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
    }, [account, server, password, selectedBroker, Trading, profit, selectedPair]);


    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/logo.jpeg')}
                            style={{
                                width: '100%',
                                height: '100%'
                            }}
                        />
                    </View>
                </View>
                <View style={styles.blackScreen}>
                    <Text style={styles.pingText}>
                        {tradingStatus}

                    </Text>
                    {Trading && (
                        <Text style={{ color: 'green', marginTop: 10 }}>AI has started trading for you</Text>
                    )}
                </View>
                
                <View >
                    <Picker
                        selectedValue={selectedBroker}
                        style={styles.picker}
                        onValueChange={handleBrokerChange}
                        enabled={!Trading && !isLoading}
                    >
                        <Picker.Item label="Select Broker" value="" />
                        {Object.keys(brokerServers).map((broker) => (
                            <Picker.Item key={broker} label={broker} value={broker} />
                        ))}
                    </Picker>
                    <View >
                        <Picker
                            selectedValue={selectedPair}
                            onValueChange={(itemValue) => setSelectedPair(itemValue)}
                            style={styles.picker}
                            itemStyle={styles.pickerItem}
                            enabled={!Trading && !isLoading}
                        >
                            <Picker.Item label="Select a pair..." value="" />
                            {forexPairs.map((pair) => (
                                <Picker.Item key={pair.value} label={pair.label} value={pair.value} />
                            ))}
                        </Picker>
                    </View>
                    <View style={styles.formBox}>
                    {selectedBroker !== '' && (
                        <>
                        
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Account"
                                    value={account}
                                    onChangeText={setAccount}
                                    keyboardType="numeric"
                                    editable={!Trading && !isLoading}
                                />
                            </View>
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    placeholder="Password"
                                    value={password}
                                    importantForAutofill="noExcludeDescendants"
                                    onChangeText={setPassword}
                                    editable={!Trading && !isLoading}
                                    secureTextEntry={!isPasswordVisible}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="default"
                                    returnKeyType="done"
                                    textContentType="password"
                                />
                                <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                                    <MaterialCommunityIcons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Daily Profit"
                                    value={profit}
                                    onChangeText={setProfit}
                                    keyboardType="numeric"
                                    editable={!Trading && !isLoading}
                                />
                            </View>

                            <Picker
                                selectedValue={server}
                                style={styles.picker}
                                onValueChange={setServer}
                                enabled={!Trading && !isLoading}
                            >
                                <Picker.Item label="Select Server" value="" />
                                {serverOptions.map((option, index) => (
                                    <Picker.Item key={index} label={option} value={option} />
                                ))}
                            </Picker>
                        </>
                    )}
                </View>
                </View>

                <View style={styles.formAction}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <TouchableOpacity
                            onPress={CheckSubscription}
                            disabled={isButtonDisabled}
                        >
                            <View style={[styles.btn, isButtonDisabled && styles.disabledBtn, Trading && { backgroundColor: 'red' }]}>
                                <Text style={styles.btnText}>{Trading ? 'Stop' : 'Start'}</Text>
                            </View>
                        </TouchableOpacity>
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
                <DisclaimerModal isOpen={isOpenDisclaimer} onClose={handleCloseDisclaimer} />
            </View>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
    blackScreen: {
        width: '100%',
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderRadius: 15,
    },
    pingText: {
        color: 'blue',
        fontSize: 18,
    },
    loadingText: {
        color: 'red',
        marginTop: 10,
        textAlign: 'center',
    },
    tradingText: {
        color: 'red',
        marginTop: 10,
        textAlign: 'center',
    },

    formBox: {
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        marginBottom: 10,
       
    },

    picker: {
        height: 50,
        width: '100%',
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 5,
        borderWidth: 4,
    },
    inputContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    input: {
        height: 50,
        width: '100%',
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        borderColor: '#ccc',
        borderWidth: 2,

    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    passwordInput: {
        paddingRight: 40,
    },
    eyeIcon: {
        position: 'absolute',
        right: 10,
    },
    formAction: {
        alignItems: 'center',
    },
    btn: {
        width: 150,
        height: 50,
        backgroundColor: '#2e7d32',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    btnText: {
        color: '#fff',
        fontSize: 18,
    },
    disabledBtn: {
        backgroundColor: '#888',
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



export default Home;
