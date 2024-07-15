import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ErrorModal = ({ isOpen, error, onClose }) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const navigation = useNavigation();

    useEffect(() => {
        if (isOpen) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isOpen, fadeAnim]);

    const handleClose = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            onClose();

            
            if (error === 'You have no subscription with us, please subscribe.') {
                navigation.navigate('Subscriptions'); 
            }
        });
    };

    return (
        isOpen && (
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                <View style={styles.modal}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={handleClose} style={styles.okButton}>
                        <Text style={styles.okButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        )
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '80%',
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#ff6347',
    },
    okButton: {
        backgroundColor: '#075eec',
        paddingVertical: 10,
        borderRadius: 8,
        alignSelf: 'center',
        paddingHorizontal: 30,
        marginTop: 10,
    },
    okButtonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default ErrorModal;
