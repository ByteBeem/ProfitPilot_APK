import React, { useState, useCallback, useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ErrorModal from '../../components/ErrorModal';
import axios from 'axios';
import * as Securestore from 'expo-secure-store';

export default function Verify() {
    const route = useRoute();
    const { email, type } = route.params; 
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation();
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState({
        code: '',
    });

    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const inputs = useRef([]);

    const handleCloseError = () => {
        setIsOpen(false);
        setError(null);
    };

    useEffect(() => {
        setIsButtonDisabled(
            form.code.length !== 5
        );
    }, [form.code]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setForm({ code: '' });
        });

        return unsubscribe;
    }, [navigation]);

    const handleSubmit = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.post("http://13.48.249.94:3001/auth/confirm-otp", 
                {
                    email: email,
                    code: form.code,
                    type,
                }
            )
            if (response.status === 200) {
                setIsLoading(false);
                if (type === 'signup') {
                    await Securestore.setItemAsync('token' , response.data.token);
                    navigation.navigate('Home');
                } else if (type === 'reset') {
                    navigation.navigate('Change', { email: email , serverToken: response.data.token});
                }
            }

        }  catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    setError(error.response.data.error);
                    setIsOpen(true);
                } else if (error.response.status === 401) {
                    setError(error.response.data.error);
                    setIsOpen(true);
                } else {
                    setError('An error occurred. Please try again.');
                    setIsOpen(true);
                }
            } else if (error.request) {
                setError('Network error. Please check your connection.');
                setIsOpen(true);
            } else {
                setError('An unexpected error occurred. Please try again.');
                setIsOpen(true);
            }
        } finally {
            setIsLoading(false);
            setIsButtonDisabled(false);
        }
    }, [form.code, navigation, type]);

    const handleTextInputChange = (text, index) => {
        if (/^[0-9]$/.test(text) && index < 5) {
            setForm(prevForm => {
                const updatedCode = prevForm.code.substring(0, index) + text + prevForm.code.substring(index + 1);

                if (text.length === 1 && index < inputs.current.length - 1) {
                    inputs.current[index + 1].focus();
                }
                return { ...prevForm, code: updatedCode };
            });
        }
    };

    const handleBackspacePress = (currentIndex) => {
        setForm(prevForm => {
            if (currentIndex >= 0 && currentIndex < prevForm.code.length) {
                const updatedCode = prevForm.code.slice(0, currentIndex) + prevForm.code.slice(currentIndex + 1);
                if (currentIndex > 0) {
                    inputs.current[currentIndex - 1].focus();
                }
                return { ...prevForm, code: updatedCode };
            } else {
                return prevForm;
            }
        });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.goback} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={34} color="black" />
                </TouchableOpacity>
                <View style={styles.header}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={require("../../assets/logo.jpeg")}
                            alt="logo"
                            style={styles.logo}
                        />
                    </View>
                    <Text style={styles.title}>Verify your Email</Text>
                    <Text style={styles.subtitle}>Enter the code sent to {email}</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.horizontalBoxes}>
                        {[0, 1, 2, 3, 4].map(index => (
                            <TextInput
                                key={index}
                                ref={ref => (inputs.current[index] = ref)}
                                style={[styles.box, styles.boxText]}
                                placeholder=""
                                editable={!isLoading}
                                keyboardType="numeric"
                                maxLength={1}
                                onChangeText={text => handleTextInputChange(text, index)}
                                onKeyPress={({ nativeEvent: { key } }) => {
                                    if (key === 'Backspace' && index > 0) {
                                        handleBackspacePress(index);
                                    }
                                }}
                            />
                        ))}
                    </View>

                    <View style={styles.formAction}>
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#0000ff" />
                        ) : (
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={isButtonDisabled}
                            >
                                <View style={[styles.btn, isButtonDisabled && styles.disabledBtn]}>
                                    <Text style={styles.btnText}>Verify</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <ErrorModal isOpen={isOpen} error={error} onClose={handleCloseError} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        flex: 1,
    },
    header: {
        padding: 24,
        marginVertical: 36,
        alignItems: 'center',
    },
    imageContainer: {
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
    title: {
        fontSize: 27,
        fontWeight: 'bold',
        color: '#1e1e1e',
        marginBottom: 6,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#929292',
        textAlign: 'center',
    },
    horizontalBoxes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    goback: {
        paddingTop: 44,
        position: 'absolute',
        top: 0,
        left: 0,
        padding: 16,
    },
    box: {
        width: 50,
        height: 50,
        backgroundColor: 'gray',
        borderRadius: 8,
    },
    formAction: {
        marginVertical: 24,
        alignItems: 'center',
    },
    boxText: {
        fontSize: 24,
        textAlign: 'center',
        color: 'white',
    },
    btn: {
        backgroundColor: '#075eec',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    btnText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    form: {
        marginBottom: 24,
        flex: 1,
    },
    disabledBtn: {
        backgroundColor: '#ccc',
    },
});
