import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TextInput, TouchableOpacity ,ActivityIndicator } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

export default function Reset() {
    const navigation = useNavigation();
    const [form, setForm] = useState({
        email: '',
    });

    const [emailError, setEmailError] = useState('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [isLoading , setIsLoading] = useState(false);

    useEffect(() => {
        setIsButtonDisabled(
            !!emailError ||
            !form.email
        );
    }, [emailError, form.email]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setForm({ email: '' });
            setEmailError('');
        });

        return unsubscribe;
    }, [navigation]);

    const handleEmailChange = useCallback((email) => {
        setForm(prevForm => ({ ...prevForm, email }));
        if (!validateEmail(email)) {
            setEmailError('Invalid email format');
        } else {
            setEmailError('');
        }
    }, []);

    const validateEmail = useCallback((email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }, []);

    const handleSubmit = useCallback(async() => {
        setIsLoading(true);
        try{
            const response = await axios.post("http://192.168.62.1:3001/auth/reset" , {
                email:form.email,
            })

            if(response.status === 200){
                navigation.navigate('Verify', { email: form.email , type: 'reset' });
            }

        }catch (error) {
            if (error.response && error.response.status === 404) {
                setEmailError(error.response.data.error);
            }
            else if (error.response && error.response.status === 401) {
                setEmailError(error.response.data.error);
            } else if (error.request) {
                setEmailError("Something went wrong on our side.");
            } else {
                setEmailError('An error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [form.email]);

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
                    <Text style={styles.title}>Reset password</Text>
                    <Text style={styles.subtitle}>Recover your ProfitPilot account</Text>
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

                    <View style={styles.formAction}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#0000ff" />
                    ) : (
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={isButtonDisabled}
                        >
                            <View style={[styles.btn, isButtonDisabled && styles.disabledBtn]}>
                                <Text style={styles.btnText}>Reset password</Text>
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
    container: {
        padding: 24,
        flex: 1,
    },
    header: {
        
        padding:24,
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
    goback: {
        paddingTop:44,
        position: 'absolute',
        top: 0,
        left: 0,
        padding: 16,
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
