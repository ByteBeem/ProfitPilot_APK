import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TextInput, ActivityIndicator,ScrollView ,Platform, KeyboardAvoidingView,TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

const Signup = ({navigation}) => {
   
    const [form, setForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: ''
    });
    const [passwordMatchError, setPasswordMatchError] = useState('');
    const [passwordStrengthError, setPasswordStrengthError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [usernameError , setUsernameError] =useState('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsButtonDisabled(
            !!emailError ||
            !!passwordMatchError ||
            !!passwordStrengthError ||
            !form.email ||
            !form.password ||
            !form.confirmPassword ||
            !form.username
        );
    }, [emailError,form.username, passwordMatchError, passwordStrengthError, form.email, form.password, form.confirmPassword]);

    const handleEmailChange = useCallback((email) => {
        setForm(prevForm => ({ ...prevForm, email }));
        if (!validateEmail(email)) {
            setEmailError('Invalid email format');
        } else {
            setEmailError('');
        }
    }, [validateEmail]);

    const handleUsernameChange = useCallback((username) => {
        setForm(prevForm => ({ ...prevForm, username }));
        if (!validateUsername(username)) {
            setUsernameError('Invalid username format');
        } else {
            setUsernameError('');
        }
    }, [validateUsername]);

    function validateUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_]{4,16}$/;
        return usernameRegex.test(username);
    }

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const validateEmail = useCallback((email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }, []);

    const handlePasswordChange = useCallback((password) => {
        setForm(prevForm => ({ ...prevForm, password }));
        if (form.confirmPassword && form.confirmPassword !== password) {
            setPasswordMatchError('Passwords do not match');
        } else {
            setPasswordMatchError('');
        }
        if (!validatePasswordStrength(password)) {
            setPasswordStrengthError('Password must be 8 characters long.');
        } else {
            setPasswordStrengthError('');
        }
    }, [form.confirmPassword, validatePasswordStrength]);

    const validatePasswordStrength = useCallback((password) => {
        const regex = /^.{8,}$/;
        return regex.test(password);
    }, []);

    const handleConfirmPasswordChange = useCallback((confirmPassword) => {
        setForm(prevForm => ({ ...prevForm, confirmPassword }));
        if (form.password && form.password !== confirmPassword) {
            setPasswordMatchError('Passwords do not match');
        } else {
            setPasswordMatchError('');
        }
    }, [form.password]);

    const handleSubmit = useCallback(async () => {
        setIsLoading(true);
        setIsButtonDisabled(true);
        try {
            const response = await axios.post("https://profitpilot.ddns.net/auth/signup", {
                email: form.email,
                password: form.password,
                username:form.username
            });
            if (response.status === 200) {
                setIsLoading(false);
                setIsButtonDisabled(false);
                navigation.navigate('Verify', { email: form.email  , type: 'signup'});
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setEmailError(error.response.data.error);
            } else if (error.request) {
                setEmailError("Something went wrong on our side.");
            } else {
                setEmailError('An error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
            setIsButtonDisabled(false);
        }
    }, [form.email, form.password, navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <ScrollView showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollView}>
                    <View style={styles.header}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={require("../../assets/logo.jpeg")}
                                alt="logo"
                                style={styles.logo}
                            />
                        </View>
                        <Text style={styles.title}>Sign up to ProfitPilot</Text>
                        <Text style={styles.subtitle}>Create your ProfitPilot account</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.input}>
                            <Text style={styles.inputLabel}>Username</Text>
                            <TextInput
                                autoCapitalize='none'
                                keyboardType='email-address'
                                autoCorrect={false}
                                style={[styles.inputControl, usernameError && styles.inputError]}
                                placeholder='Username'
                                placeholderTextColor="#6b7280"
                                value={form.username}
                                onChangeText={handleUsernameChange}
                                editable={!isLoading}
                            />
                        </View>
                        {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
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
                        </View>
                        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                        <View style={styles.input}>
                            <Text style={styles.inputLabel}>Password</Text>
                            <View style={[styles.passwordInputContainer, (passwordMatchError || passwordStrengthError) ? styles.inputError : null]}>
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
                        </View>
                        {passwordMatchError || passwordStrengthError ? <Text style={styles.errorText}>{passwordMatchError || passwordStrengthError}</Text> : null}

                        <View style={styles.input}>
                            <Text style={styles.inputLabel}>Retype password</Text>
                            <TextInput
                                secureTextEntry
                                style={[styles.inputControl, passwordMatchError ? styles.inputError : null]}
                                placeholder='**********'
                                placeholderTextColor="#6b7280"
                                value={form.confirmPassword}
                                onChangeText={handleConfirmPasswordChange}
                                editable={!isLoading}
                            />
                        </View>
                        {passwordMatchError ? <Text style={styles.errorText}>{passwordMatchError}</Text> : null}

                        <View style={styles.formAction}>
                            {isLoading ? (
                                <ActivityIndicator size="large" color="#0000ff" />
                            ) : (
                                <TouchableOpacity
                                    onPress={handleSubmit}
                                    disabled={isButtonDisabled}
                                >
                                    <View style={[styles.btn, isButtonDisabled && styles.disabledBtn]}>
                                        <Text style={styles.btnText}>Create account</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>

                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.formFooter}>Already have an account? {' '}
                                <Text style={{ textDecorationLine: 'underline' }}>Log in</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
    inputControl: {
        backgroundColor: '#fff',
        height: 44,
        paddingHorizontal: 16,
        borderRadius: 12,
        fontSize: 15,
        fontWeight: '500',
        color: '#222'
    },
    inputError: {
        borderColor: 'red',
        borderWidth: 1,
        borderRadius: 12,
    },
    eyeIcon: {
        position: 'absolute',
        right: 10,
    },
    passwordInput: {
        flex: 1,
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
    disabledBtn: {
        backgroundColor: '#ccc',
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
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 8,
    }
});

export default Signup;
