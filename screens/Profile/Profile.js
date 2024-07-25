import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Profile = ({ navigation }) => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [userData, setUserData] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleLogOut = useCallback(async () => {
        setIsLoggingOut(true);
        try {
            await AsyncStorage.clear();
            navigation.navigate("Login");
        } catch (err) {
           
        } finally {
            setIsLoggingOut(false);
        }
    }, [navigation]);

    const fetchUserData = useCallback(async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        setIsLoading(true);
        try {
            const response = await axios.post('https://profitpilot.ddns.net/users/profile', { token });

            if (response.status === 200) {
                setUserData(response.data);
            }
        } catch (err) {
            
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    return (
        <View style={styles.container}>
            <View style={styles.profileBox}>
                <Image
                    source={require('../../assets/logo.jpeg')}
                    style={styles.profilePicture}
                />
                <View style={styles.infoContainer}>
                    <Text style={styles.name}>{userData.username}</Text>
                    <Text style={styles.email}>{userData.email}</Text>
                    <Text style={styles.label}>Subscription Plan:</Text>
                    <Text style={styles.value}>{userData.plan}</Text>
                    <Text style={styles.label}>Member Since:</Text>
                    <Text style={styles.value}>{userData.joinDate}</Text>
                </View>
            </View>

            {isLoading && <ActivityIndicator size="large" color="#0000ff" />}

            <Text style={styles.appDescription}>
                For any enquiries, email: <Text style={styles.label}>forex929@proton.me</Text>
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
        color: '#333',
        marginBottom: 5,
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
