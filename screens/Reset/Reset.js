import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = "https://profitpilot.ddns.net/auth/reset";

export default function Reset() {
    const navigation = useNavigation();
    const [form, setForm] = useState({ email: '' });
    const [emailError, setEmailError] = useState('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsButtonDisabled(!form.email || emailError.length > 0);
    }, [form.email, emailError]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setForm({ email: '' });
            setEmailError('');
        });
        return unsubscribe;
    }, [navigation]);

    const handleEmailChange = useCallback((email) => {
        setForm({ email });
        setEmailError(validateEmail(email) ? '' : 'Invalid email format');
    }, []);

    const validateEmail = useCallback((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), []);

    const handleSubmit = useCallback(async () => {
        setIsLoading(true);
        try {
            const { status } = await axios.post(API_URL, { email: form.email });
            if (status === 200) {
                navigation.navigate('Verify', { email: form.email, type: 'reset' });
            }
        } catch (error) {
            const message = error.response?.data?.error || 'An error occurred. Please try again.';
            setEmailError(message);
        } finally {
            setIsLoading(false);
        }
    }, [form.email, navigation]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.goBack} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={34} color="black" />
                </TouchableOpacity>
                <View style={styles.header}>
                    <Image source={require("../../assets/logo.jpeg")} style={styles.logo} />
                    <Text style={styles.title}>Reset password</Text>
                    <Text style={styles.subtitle}>Recover your ProfitPilot account</Text>
                </View>
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Email address</Text>
                        <TextInput
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoCorrect={false}
                            style={[styles.input, emailError && styles.inputError]}
                            placeholder="Email"
                            placeholderTextColor="#6b7280"
                            value={form.email}
                            onChangeText={handleEmailChange}
                            editable={!isLoading}
                        />
                        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                    </View>
                    <View style={styles.formAction}>
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#0000ff" />
                        ) : (
                            <TouchableOpacity onPress={handleSubmit} disabled={isButtonDisabled}>
                                <View style={[styles.button, isButtonDisabled && styles.disabledButton]}>
                                    <Text style={styles.buttonText}>Reset password</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
    container: { padding: 24, flex: 1 },
    goBack: { paddingTop: 44, position: 'absolute', top: 0, left: 0, padding: 16 },
    header: { padding: 24, marginVertical: 36, alignItems: 'center' },
    logo: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
    title: { fontSize: 27, fontWeight: 'bold', color: '#1e1e1e', marginBottom: 6, textAlign: 'center' },
    subtitle: { fontSize: 15, fontWeight: '500', color: '#929292', textAlign: 'center' },
    inputContainer: { marginBottom: 16 },
    inputLabel: { fontSize: 17, fontWeight: '600', color: "#222", marginBottom: 8 },
    input: { backgroundColor: '#fff', height: 44, paddingHorizontal: 16, borderRadius: 12, fontSize: 15, color: '#222' },
    inputError: { borderColor: 'red', borderWidth: 1 },
    errorText: { color: 'red', textAlign: 'center', marginTop: 8 },
    form: { flex: 1, marginBottom: 24 },
    formAction: { marginVertical: 24, alignItems: 'center' },
    button: { backgroundColor: '#075eec', borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 20 },
    buttonText: { fontSize: 18, fontWeight: '600', color: '#fff' },
    disabledButton: { backgroundColor: '#ccc' },
});
