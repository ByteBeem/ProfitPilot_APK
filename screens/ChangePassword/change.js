import React, { useState, useCallback, useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import ErrorModal from '../../components/ErrorModal';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

export default function ChangePassword() {
    const route = useRoute();
    const [isLoading, setIsLoading] = useState(false);
    const { email, serverToken } = route.params;
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const navigation = useNavigation();
    const [form, setForm] = useState({
        password: '',
        retypePassword: '',
    });
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [passwordError, setPasswordError] = useState('');
    const [retypePasswordError, setRetypePasswordError] = useState('');

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
        return regex.test(password);
    };

    const handleCloseError = () => {
        setIsOpen(false);
        setError(null);
    };


    const validateRetypePassword = (password, retypePassword) => {
        return password === retypePassword;
    };

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
            const response = await axios.post("http://192.168.62.1:3001/auth/changePassword", {
                email: email,
                serverToken: serverToken,
                newPassword: form.password,
            });

            if (response.status === 200) {
                await SecureStore.setItemAsync('token', response.data.token);
                setIsLoading(false);
                navigation.navigate('Home');
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setError(error.response.data.error);
                setIsOpen(true);
            }
            else if (error.response && error.response.status === 401) {
                setError(error.response.data.error);
                setIsOpen(true);
            } else if (error.request) {
                setError("Something went wrong on our side.");
                setIsOpen(true);
            } else {
                setError('An error occurred. Please try again.');
                setIsOpen(true);
            }
        } finally {
            setIsLoading(false);
        }
    }, [form.password, navigation]);

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
                    <Text style={styles.title}>Change Your Password</Text>
                </View>
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="New Password"
                        secureTextEntry={true}
                        value={form.password}
                        onChangeText={(text) => setForm({ ...form, password: text })}
                    />
                    {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
                    <TextInput
                        style={styles.input}
                        placeholder="Retype New Password"
                        secureTextEntry={false}
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
    goback: {
        paddingTop: 44,
        position: 'absolute',
        top: 0,
        left: 0,
        padding: 16,
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
    disabledBtn: {
        backgroundColor: '#ccc',
    },
});
