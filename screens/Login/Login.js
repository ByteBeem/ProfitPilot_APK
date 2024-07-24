import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import ErrorModal from '../../components/ErrorModal'; 

const API_URL = "https://profitpilot.ddns.net/auth/login"; 

const Login = () => {
    const navigation = useNavigation();
    const [form, setForm] = useState({ email: '', password: '' });
    const [emailError, setEmailError] = useState('');
    const [passwordStrengthError, setPasswordStrengthError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const isButtonDisabled = useMemo(() => {
        return !!emailError || !!passwordStrengthError || !form.email || !form.password;
    }, [emailError, passwordStrengthError, form.email, form.password]);

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
        setPasswordStrengthError(password ? '' : 'Password is Required.');
    }, []);

    const handleEmailChange = useCallback((email) => {
        setForm(prevForm => ({ ...prevForm, email }));
        setEmailError(validateEmail(email) ? '' : 'Invalid email format');
    }, []);

    const togglePasswordVisibility = () => setIsPasswordVisible(prev => !prev);

    const validateEmail = useCallback((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), []);

    const handleCloseError = () => {
        setIsOpen(false);
        setError(null);
    };

    const handleSubmit = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, status } = await axios.post(API_URL, form);
            if (status === 200) {
                await SecureStore.setItemAsync('token', data.token);
                navigation.navigate('Home');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'An error occurred. Please try again.';
            setError(errorMessage);
            setIsOpen(true);
        } finally {
            setIsLoading(false);
        }
    }, [form, navigation]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Image source={require("../../assets/logo.jpeg")} style={styles.logo} />
                    <Text style={styles.title}>Sign in to ProfitPilot</Text>
                    <Text style={styles.subtitle}>Get access to your ProfitPilot account</Text>
                </View>
                <View style={styles.form}>
                    <View style={styles.input}>
                        <Text style={styles.inputLabel}>Email address</Text>
                        <TextInput
                            autoCapitalize='none'
                            keyboardType='email-address'
                            autoCorrect={false}
                            style={[styles.inputControl, emailError && styles.inputError]}
                            placeholder='Email'
                            placeholderTextColor="#6b7280"
                            value={form.email}
                            onChangeText={handleEmailChange}
                            editable={!isLoading}
                        />
                        {emailError && <Text style={styles.errorText}>{emailError}</Text>}
                    </View>
                    <View style={styles.input}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <View style={[styles.passwordInputContainer, passwordStrengthError && styles.inputError]}>
                            <TextInput
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
                        {passwordStrengthError && <Text style={styles.errorText}>{passwordStrengthError}</Text>}
                    </View>
                    <View style={styles.formAction}>
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#0000ff" />
                        ) : (
                            <TouchableOpacity onPress={handleSubmit} disabled={isButtonDisabled}>
                                <View style={[styles.btn, isButtonDisabled && styles.disabledBtn]}>
                                    <Text style={styles.btnText}>Log in</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                        <Text style={styles.formFooter}>Don't have an account? <Text style={styles.link}>Sign up</Text></Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Reset')}>
                        <Text style={styles.formFooter}>Forgot password? <Text style={styles.link}>Reset</Text></Text>
                    </TouchableOpacity>
                </View>
                <ErrorModal isOpen={isOpen} error={error} onClose={handleCloseError} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
    container: { padding: 24, flex: 1 },
    header: { marginVertical: 36, alignItems: 'center' },
    logo: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
    title: { fontSize: 27, fontWeight: 'bold', color: '#1e1e1e', marginBottom: 6, textAlign: 'center' },
    subtitle: { fontSize: 15, fontWeight: '500', color: '#929292', textAlign: 'center' },
    form: { flex: 1, marginBottom: 24 },
    input: { marginBottom: 16 },
    inputLabel: { fontSize: 17, fontWeight: '600', color: "#222", marginBottom: 8 },
    inputError: { borderColor: 'red', borderWidth: 1 },
    inputControl: { backgroundColor: '#fff', height: 44, paddingHorizontal: 16, borderRadius: 12, fontSize: 15, color: '#222' },
    passwordInputContainer: { flexDirection: 'row', alignItems: 'center' },
    passwordInput: { flex: 1 },
    eyeIcon: { position: 'absolute', right: 10 },
    btn: { backgroundColor: '#075eec', borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 20 },
    btnText: { fontSize: 18, fontWeight: '600', color: '#fff' },
    formAction: { marginVertical: 24, alignItems: 'center' },
    formFooter: { fontSize: 17, fontWeight: '600', color: '#222', textAlign: 'center', letterSpacing: 0.15, padding: 10 },
    errorText: { color: 'red', textAlign: 'center', marginTop: 8 },
    disabledBtn: { backgroundColor: '#ccc' },
    link: { textDecorationLine: 'underline' }
});

export default Login;
