import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ErrorModal from '../../components/ErrorModal';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const ChangePassword = () => {
    const route = useRoute();
    const { email, serverToken } = route.params;
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ password: '', retypePassword: '' });
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [passwordError, setPasswordError] = useState('');
    const [retypePasswordError, setRetypePasswordError] = useState('');

    const navigation = useNavigation();

    const validatePassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/.test(password);

    const validateRetypePassword = (password, retypePassword) => password === retypePassword;

    useEffect(() => {
        const isPasswordValid = validatePassword(form.password);
        const isRetypePasswordValid = validateRetypePassword(form.password, form.retypePassword);

        setPasswordError(isPasswordValid ? '' : 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
        setRetypePasswordError(isRetypePasswordValid ? '' : 'Passwords do not match.');

        setIsButtonDisabled(!(isPasswordValid && isRetypePasswordValid));
    }, [form.password, form.retypePassword]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setForm({ password: '', retypePassword: '' });
        });
        return unsubscribe;
    }, [navigation]);

    const handleSubmit = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.post("https://profitpilot.ddns.net/auth/changePassword", {
                email,
                serverToken,
                newPassword: form.password,
            });

            if (response.status === 200) {
                await SecureStore.setItemAsync('token', response.data.token);
                navigation.navigate('Home');
            }
        } catch (error) {
            const message = error.response?.data?.error || 'An error occurred. Please try again.';
            setError(message);
            setIsOpen(true);
        } finally {
            setIsLoading(false);
        }
    }, [form.password, email, serverToken, navigation]);

    const handleCloseError = () => {
        setIsOpen(false);
        setError(null);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={require("../../assets/logo.jpeg")}
                    style={styles.logo}
                />
                <Text style={styles.title}>Change Your Password</Text>
            </View>
            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    secureTextEntry
                    value={form.password}
                    onChangeText={(text) => setForm({ ...form, password: text })}
                />
                {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
                <TextInput
                    style={styles.input}
                    placeholder="Retype New Password"
                    secureTextEntry
                    value={form.retypePassword}
                    onChangeText={(text) => setForm({ ...form, retypePassword: text })}
                />
                {retypePasswordError ? <Text style={styles.error}>{retypePasswordError}</Text> : null}
                <View style={styles.formAction}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={isButtonDisabled}
                        >
                            <View style={[styles.btn, isButtonDisabled && styles.disabledBtn]}>
                                <Text style={styles.btnText}>Change</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            <ErrorModal isOpen={isOpen} error={error} onClose={handleCloseError} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginVertical: 36,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 12,
    },
    title: {
        fontSize: 27,
        fontWeight: 'bold',
        color: '#1e1e1e',
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    error: {
        color: 'red',
        marginBottom: 10,
    },
    formAction: {
        marginVertical: 24,
        alignItems: 'center',
    },
    btn: {
        backgroundColor: '#075eec',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    disabledBtn: {
        backgroundColor: '#ccc',
    },
});

export default ChangePassword;
