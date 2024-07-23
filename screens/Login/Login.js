import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function Login() {
    const navigation = useNavigation();
    const [form, setForm] = useState({
        email: '',
        password: ''
    });

    const [emailError, setEmailError] = useState('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [passwordStrengthError, setPasswordStrengthError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    useEffect(() => {
        setIsButtonDisabled(
            !!emailError ||
            !!passwordStrengthError ||
            !form.email ||
            !form.password
        );
    }, [emailError, form.email, passwordStrengthError, form.password]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {

            setForm({ email: '', password: '' });
            setEmailError('');
            setPasswordStrengthError('');
        });

        return unsubscribe;
    }, [navigation]);

    const handlePasswordChange = useCallback((password) => {
        setForm(prevForm => ({ ...prevForm, password }));
        if (!password) {
            setPasswordStrengthError('Password is Required.');
        } else {
            setPasswordStrengthError('');
        }
    }, []);

    const handleEmailChange = useCallback((email) => {
        setForm(prevForm => ({ ...prevForm, email }));
        if (!validateEmail(email)) {
            setEmailError('Invalid email format');
        } else {
            setEmailError('');
        }
    }, []);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const validateEmail = useCallback((email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }, []);

    const handleSubmit = useCallback(async () => {
        setIsLoading(true);
        setIsButtonDisabled(true);
        try {
            const response = await axios.post("http://13.48.249.94:3001/auth/login", {
                email: form.email,
                password: form.password
            });
            if (response.status === 200) {
                await SecureStore.setItemAsync('token', response.data.token);
                navigation.navigate('Home');
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 404) {
                    setEmailError(error.response.data.error);
                } else if (error.response.status === 401) {
                    setPasswordStrengthError(error.response.data.error);
                } else {
                    setEmailError('An error occurred. Please try again.');
                }
            } else if (error.request) {
                setEmailError('Network error. Please check your connection.');
            } else {
                setEmailError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
            setIsButtonDisabled(false);
        }
    }, [form.email, form.password, navigation]);
    

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={require("../../assets/logo.jpeg")}
                            alt="logo"
                            style={styles.logo}
                        />
                    </View>
                    <Text style={styles.title}>Sign in to ProfitPilot</Text>
                    <Text style={styles.subtitle}>Get access to your ProfitPilot account</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.input}>
                        <Text style={styles.inputLabel}>Email address</Text>
                        <TextInput
                            autoCapitalize='none'
                            keyboardType='email-address'
                            importantForAutofill="noExcludeDescendants"
                            autoCorrect={false}
                            style={[styles.inputControl, emailError && styles.inputError]}
                            placeholder='Email'
                            placeholderTextColor="#6b7280"
                            value={form.email}
                            onChangeText={handleEmailChange}
                            editable={!isLoading}
                        />
                    </View>
                    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                    <View style={styles.input}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <View style={[styles.passwordInputContainer, passwordStrengthError && styles.inputError]}>
                            <TextInput
                                importantForAutofill="noExcludeDescendants"
                                secureTextEntry={!isPasswordVisible}
                                style={[styles.inputControl, styles.passwordInput]}
                                placeholder='**********'
                                placeholderTextColor="#6b7280"
                                value={form.password}
                                onChangeText={handlePasswordChange}
                                editable={!isLoading}
                            />
                            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                                <MaterialCommunityIcons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {passwordStrengthError ? <Text style={styles.errorText}>{passwordStrengthError}</Text> : null}

                    <View style={styles.formAction}>
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#0000ff" />
                        ) : (
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={isButtonDisabled}
                            >
                                <View style={[styles.btn, isButtonDisabled && styles.disabledBtn]}>
                                    <Text style={styles.btnText}>Log in</Text>
                                </View>
                            </TouchableOpacity>

                        )}
                    </View>

                    <TouchableOpacity onPress={() => {
                        navigation.navigate('Signup');
                    }}>
                        <Text style={styles.formFooter}>Don't have an account? {' '}
                            <Text style={{ textDecorationLine: 'underline' }}>Sign up</Text>
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        navigation.navigate('Reset');
                    }}>
                        <Text style={styles.formFooter}>Forgot password? {' '}
                            <Text style={{ textDecorationLine: 'underline' }}>Reset</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
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
    input: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 17,
        fontWeight: '600',
        color: "#222",
        marginBottom: 8,
    },
    inputError: {
        borderColor: 'red',
        borderWidth: 1,
        borderRadius: 12,
    },
    inputControl: {
        backgroundColor: '#fff',
        height: 44,
        paddingHorizontal: 16,
        borderRadius: 12,
        fontSize: 15,
        fontWeight: '500',
        color: '#222'
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordInput: {
        flex: 1,
    },
    eyeIcon: {
        position: 'absolute',
        right: 10,
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
    formAction: {
        marginVertical: 24,
        alignItems: 'center',
    },
    formFooter: {
        fontSize: 17,
        fontWeight: '600',
        color: '#222',
        textAlign: 'center',
        letterSpacing: 0.15,
        padding: 10,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 8,
    },
    disabledBtn: {
        backgroundColor: '#ccc',
    },
});
