import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text, Button, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

const WebViewScreen = ({ navigation, route }) => {
    const { Link } = route.params;
    const [loading, setLoading] = useState(true);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const handleNavigationStateChange = (navState) => {
        if (navState.url.includes('/success')) {
            setShowSuccessMessage(true);
        } else {
            setShowSuccessMessage(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment</Text>
            </View>

            {loading && (
                <ActivityIndicator
                    size="large"
                    color="black"
                    style={styles.loadingIndicator}
                />
            )}

            {showSuccessMessage ? (
                <View style={styles.successMessageContainer}>
                    <Text style={styles.successMessage}>You Subscribed</Text>
                    <Text style={styles.successSubMessage}>Press the Back to App button</Text>
                </View>
            ) : (
                <WebView
                    source={{ uri: Link }}
                    style={styles.webview}
                    onLoadStart={() => setLoading(true)}
                    onLoad={() => setLoading(false)}
                    onNavigationStateChange={handleNavigationStateChange}
                />
            )}

            <View style={styles.buttonContainer}>
                <Button title="Back to App" onPress={() => navigation.navigate('Home')} />
            </View>
        </View>
    );
};

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
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
    webview: {
        flex: 1,
        width: windowWidth,
    },
    loadingIndicator: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -15 }, { translateY: -15 }],
        zIndex: 1,
    },
    buttonContainer: {
        padding: 10,
        backgroundColor: '#fff',
    },
    successMessageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    successMessage: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    successSubMessage: {
        fontSize: 16,
        textAlign: 'center',
    },
});

export default WebViewScreen
