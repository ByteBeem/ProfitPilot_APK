import React, { useState, useEffect, useCallback } from 'react';
import { View, SafeAreaView, Image, Text, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
    const [trading, setTrading] = useState(false);
    const [tradingStatus, setTradingStatus] = useState('Not Started');
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenDisclaimer, setIsOpenDisclaimer] = useState(false);
    const [error, setError] = useState(null);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [brokerServers, setBrokerServers] = useState({});
    

    // Fetch broker servers
    const fetchBrokerServers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('https://profitpilot.ddns.net/trading/broker-servers');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            setBrokerServers(data);
        } catch (error) {
            handleError('Failed to fetch broker servers');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                const isTrading = await AsyncStorage.getItem('trading');
                const tradingStatus = await AsyncStorage.getItem('TradingStatus');
                if (isTrading === "true" && tradingStatus === "In progress") {
                    setTrading(true);
                    setTradingStatus(tradingStatus);
                    setIsButtonDisabled(false);
                }
                fetchBrokerServers();
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        loadData();
    }, [fetchBrokerServers]);

    // Update button state
    useEffect(() => {
        setIsButtonDisabled(
            !account ||
            !selectedBroker ||
            !password ||
            !server ||
            !profit 
           
        );
    }, [selectedBroker, account, password, server, profit]);

    // Handle broker change
    const handleBrokerChange = (value) => {
        setSelectedBroker(value);
        setServer('');
        setServerOptions(brokerServers[value] || []);
    };

    // Close error modal
    const handleCloseError = () => setIsOpen(false);

    // Close disclaimer modal
    const handleCloseDisclaimer = () => setIsOpenDisclaimer(false);

    // Toggle password visibility
    const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

    // Handle form submission
    const handleSubmit = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (trading) {
                setTradingStatus("Stopping, please wait...");
                await AsyncStorage.clear();
                await StopTrading();
            } else {
                setTradingStatus("Starting, please wait...");
                const response = await axios.post("https://profitpilot.ddns.net/trading/Start-trading", {
                    token,
                    login: account,
                    selectedBroker,
                    serverName: server,
                    password,
                    profit
                   
                });
                if (response.status === 200) {
                    setTrading(true);
                    setTradingStatus("In progress");
                    await AsyncStorage.setItem('TradingStatus', 'In progress');
                    await AsyncStorage.setItem('trading', 'true');
                }
            }
        } catch (error) {
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    }, [account, server, password, selectedBroker, trading, profit]);

    // Stop trading
    const StopTrading = useCallback(async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('token');
        try {
            const response = await axios.post("https://profitpilot.ddns.net/trading/Stop-trading", { token });
            if (response.status === 200) {
                setError("Trading has stopped");
                setTrading(false);
                setTradingStatus("Stopped");
            }
        } catch (error) {
            handleError('Failed to stop trading');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const CheckSubscription = useCallback(async () => {
        setIsOpenDisclaimer(true);
        setIsLoading(true);
    
        const token = await AsyncStorage.getItem('token');
        
        try {
            const response = await axios.post('https://profitpilot.ddns.net/subscriptions/check-subscription', { token });
            
            if (response.status === 200) {
                await handleSubmit();
            }
        } catch (error) {
           
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    }, [handleSubmit]);

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
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image source={require('../../assets/logo.jpeg')} style={styles.logo} />
                    </View>
                </View>
                <View style={styles.blackScreen}>
                    <Text style={styles.pingText}>{tradingStatus}</Text>
                    {trading && <Text style={styles.tradingText}>AI has started trading for you</Text>}
                </View>
                <View>
                    <Picker
                        selectedValue={selectedBroker}
                        style={styles.picker}
                        onValueChange={handleBrokerChange}
                        enabled={!trading && !isLoading}
                    >
                        <Picker.Item label="Select Broker" value="" />
                        {Object.keys(brokerServers).map((broker) => (
                            <Picker.Item key={broker} label={broker} value={broker} />
                        ))}
                    </Picker>
                    {selectedBroker && (
                        <View style={styles.formBox}>
                            <TextInput
                                style={styles.input}
                                placeholder="Account"
                                value={account}
                                onChangeText={setAccount}
                                keyboardType="numeric"
                                editable={!trading && !isLoading}
                            />
                            <View style={styles.passwordInputContainer}>
                                <TextInput
                                    style={[styles.input, styles.passwordInput]}
                                    placeholder="Password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!isPasswordVisible}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="default"
                                    returnKeyType="done"
                                    textContentType="password"
                                    editable={!trading && !isLoading}
                                />
                                <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                                    <MaterialCommunityIcons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#6b7280" />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Daily Profit"
                                value={profit}
                                onChangeText={setProfit}
                                keyboardType="numeric"
                                editable={!trading && !isLoading}
                            />
                            <Picker
                                selectedValue={server}
                                style={styles.picker}
                                onValueChange={setServer}
                                enabled={!trading && !isLoading}
                            >
                                <Picker.Item label="Select Server" value="" />
                                {serverOptions.map((option, index) => (
                                    <Picker.Item key={index} label={option} value={option} />
                                ))}
                            </Picker>
                        </View>
                    )}
                </View>
                <View style={styles.formAction}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <TouchableOpacity onPress={CheckSubscription} disabled={isButtonDisabled}>
                            <View style={[styles.btn, isButtonDisabled && styles.disabledBtn, trading && styles.tradingBtn]}>
                                <Text style={styles.btnText}>{trading ? 'Stop Trading' : 'Start Trading'}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
                <ErrorModal isOpen={isOpen} onClose={handleCloseError} error={error} />
                <DisclaimerModal isOpen={isOpenDisclaimer} onClose={handleCloseDisclaimer} />
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logoContainer: {
        borderRadius: 50,
        overflow: 'hidden',
    },
    logo: {
        width: 100,
        height: 100,
    },
    blackScreen: {
        marginBottom: 20,
    },
    pingText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    tradingText: {
        fontSize: 16,
        textAlign: 'center',
    },
    formBox: {
        marginTop: 20,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        fontSize: 16,
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordInput: {
        flex: 1,
    },
    eyeIcon: {
        marginLeft: 10,
    },
    picker: {
        marginBottom: 10,
    },
    formAction: {
        marginTop: 20,
        alignItems: 'center',
    },
    btn: {
        backgroundColor: '#007BFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 5,
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledBtn: {
        backgroundColor: '#d6d6d6',
    },
    tradingBtn: {
        backgroundColor: '#28a745',
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
