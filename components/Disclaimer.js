import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Linking } from 'react-native';

const DisclaimerModal = ({ isOpen, onClose }) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [isChecked, setIsChecked] = useState(false);

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
        if (isChecked) {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                onClose();
            });
        } else {
            alert("You must accept the terms and conditions to proceed.");
        }
    };

    const toggleCheckbox = () => {
        setIsChecked(!isChecked);
    };

    const handleLinkPress = () => {
        Linking.openURL('https://www.example.com/terms-and-conditions');
    };

    return (
        isOpen && (
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                <View style={styles.modal}>
                    <Text style={styles.titleText}>Disclaimer</Text>
                    <Text style={styles.messageText}>
                        We securely store your information, and it is encrypted end-to-end.
                    </Text>
                    <Text style={styles.messageText}>
                        Trading involves risks. Please ensure you understand these risks before trading.
                    </Text>
                    <View style={styles.checkboxContainer}>
                        <TouchableOpacity onPress={toggleCheckbox} style={styles.checkbox}>
                            <View style={isChecked ? styles.checkedBox : styles.uncheckedBox}>
                                {isChecked && <Text style={styles.checkMark}>✔</Text>}
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.label}>I accept the 
                            <Text style={styles.link} onPress={handleLinkPress}> Terms and Conditions </Text>
                            and Privacy Policy
                        </Text>
                    </View>
                    <TouchableOpacity 
                        onPress={handleClose} 
                        style={[styles.okButton, !isChecked && styles.okButtonDisabled]} 
                        disabled={!isChecked}
                    >
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
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#000',
    },
    messageText: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center',
        color: '#000',
    },
    checkboxContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'center',
    },
    checkbox: {
        marginRight: 10,
    },
    uncheckedBox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkedBox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#075eec',
    },
    checkMark: {
        color: '#fff',
        fontSize: 14,
    },
    label: {
        fontSize: 14,
        color: '#000',
        flexShrink: 1,
    },
    link: {
        color: '#075eec',
        textDecorationLine: 'underline',
    },
    okButton: {
        backgroundColor: '#075eec',
        paddingVertical: 10,
        borderRadius: 8,
        alignSelf: 'center',
        paddingHorizontal: 30,
        marginTop: 10,
    },
    okButtonDisabled: {
        backgroundColor: '#a9a9a9',
    },
    okButtonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default DisclaimerModal;
