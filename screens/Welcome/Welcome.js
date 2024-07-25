import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Alert, Linking, StyleSheet, SafeAreaView, Image, TouchableOpacity } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Walkthrough = ({navigation}) => {
    const [appVersion, setAppVersion] = useState(null);
    const [checkingUpdate, setCheckingUpdate] = useState(true);
    
    const fetchAppVersion = useCallback(async () => {
        try {
            const version = "1.0.0"; 
            setAppVersion(version);

            const response = await axios.get('https://profitpilot.ddns.net/users/check-update', {
                params: { version }
            });
            if (response.status !== 200) {
                const link = response.data.link;
                Alert.alert(
                    "Update Available",
                    "A new version of the app is available. Please update to continue.",
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                Linking.openURL(link);
                            }
                        }
                    ]
                );
            }
        } catch (error) {
            console.error("Error checking for updates:", error);
        } finally {
            setCheckingUpdate(false);
        }
    }, []);

    useEffect(() => {
        fetchAppVersion();
    }, [fetchAppVersion]);

    const checkToken = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                navigation.navigate('Home');
            } else {
                navigation.navigate('Login');
            }
        } catch (error) {
            console.error("Error checking token:", error);
        }
    };

    if (checkingUpdate) {
        return (
            <SafeAreaView style={styles.centeredContainer}>
                <Text style={styles.checkingText}>Checking for updates...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.contentContainer}>
            <View style={styles.innerContainer}>
                <View style={styles.logoContainer}>
                    <Image source={require('../../assets/logo.jpeg')} style={styles.logo} />
                </View>

                <Text style={styles.welcomeText}>
                    Welcome
                </Text>

                <View style={styles.buttonContainer}>
                    <Text style={styles.termsText}>
                        Terms and Privacy
                    </Text>

                    <TouchableOpacity onPress={checkToken} style={styles.launchButton}>
                        <Text style={styles.launchButtonText}>Launch ProfitPilot</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.versionText}>
                    version {appVersion}
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    centeredContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 22,
        backgroundColor: '#F5F5F5',
    },
    innerContainer: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    logoContainer: {
        borderRadius: 50,
        overflow: 'hidden',
        marginTop: 70,
    },
    logo: {
        width: 100,
        height: 100,
    },
    welcomeText: {
        fontSize: 28,
        textAlign: 'center',
        marginHorizontal: 20,
       
        marginVertical: 20,
    },
    termsText: {
        fontSize: 16,
        marginVertical: 12,
        fontFamily: 'System',
        textAlign: 'center',
    },
    launchButton: {
        backgroundColor: '#1E90FF',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        marginVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    launchButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        
    },
    versionText: {
        fontSize: 16,
        marginVertical: 12,
        
        textAlign: 'center',
    },
    checkingText: {
        fontSize: 20,
        
    },
});

export default Walkthrough;
