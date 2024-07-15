import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const Profile = ({ navigation }) => {
    const user = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        subscriptionPlan: 'Premium',
        joinDate: 'January 1, 2020',
    };
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

    return (
        <View style={styles.container}>
            <View style={styles.profileBox}>
                <Image
                    source={require('../../assets/logo.jpeg')}
                    style={styles.profilePicture}
                />
                <View style={styles.infoContainer}>
                    <Text style={styles.name}>{user.name}</Text>
                    <Text style={styles.email}>{user.email}</Text>
                    <Text style={styles.label}>Subscription Plan:</Text>
                    <Text style={styles.value}>{user.subscriptionPlan}</Text>
                    <Text style={styles.label}>Member Since:</Text>
                    <Text style={styles.value}>{user.joinDate}</Text>
                </View>
            </View>

            <Text style={styles.appDescription}>
            <Text style={styles.label}>ProfitPilot</Text> is your ultimate companion in financial trading, providing real-time signals and insights to optimize your trading decisions.{'\n\n'}
                
                <Text style={styles.label}>User-Friendly Interface:</Text>Enjoy a clean intuitive design that makes trading straightforward, even for beginners.{'\n\n'}
                
                <Text style={styles.label}>Data Protection:</Text>Your personal and trading account information is safeguarded with advanced encryption and security protocols.{'\n\n'}
                
                <Text style={styles.label}>Trading:</Text>With our AI trading capabilities, you will never go wrong. Advanced AI signal predictions and automated trading.{'\n\n'}
                
                For any enquiries, email:<Text style={styles.label}>profitpilot@proton.me</Text> 
            </Text>

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
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    profileBox: {
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
    profilePicture: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginRight: 20,
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    email: {
        fontSize: 16,
        color: '#666',
        marginBottom: 15,
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    value: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    appDescription: {
        fontSize: 16,
        color: '#666',
        marginTop: 20,
        textAlign: 'left',
        lineHeight: 22,
    },
    navigation: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        backgroundColor: '#F5F5F5',
        borderTopWidth: 1,
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

export default Profile;
