import { View, Text, } from 'react-native'
import React, { useEffect, useState , useCallback} from 'react'
import PageContainer from '../../components/PageContainer'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SIZES, FONTS } from '../../constants'
import Button from '../../components/Button'
import LottieView from "lottie-react-native";
import { useNavigation } from '@react-navigation/native'
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';



export default function Walkthrough() {
    const [appVersion, setAppVersion] = useState(null);
    

    const fetchAppVersion = useCallback(async () => {
        try {
            const version = Constants.expoConfig.version;
            setAppVersion(version);
            
        } catch (error) {
            
        }
    }, []);

    useEffect(() => {
        
        fetchAppVersion();
    }, [fetchAppVersion ]);


  

    const checkToken = async () => {
        try {
          
            const token = await SecureStore.getItemAsync('token');
            if (token) {
                
                navigation.navigate('Home');
            } else {
               
                navigation.navigate('Login');
            }
        } catch (error) {
            
        }
    };

    const navigation = useNavigation();

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <PageContainer>
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexDirection: 'column',
                        marginHorizontal: 22,
                    }}
                >
                    <LottieView source={require("../../assets/animation.json")}
                        autoPlay
                        loop

                        style={{
                            width: SIZES.width * 0.8,
                            height: SIZES.width * 0.9,
                            marginVertical: 48,

                        }}
                    />




                    <Text
                        style={{
                            ...(SIZES.width <= 360
                                ? { ...FONTS.h2 }
                                : { ...FONTS.h1 }),
                            textAlign: 'center',
                            marginHorizontal: SIZES.padding * 0.8,
                        }}
                    >
                        AI will fly your account to higher profits 
                    </Text>


                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <Text
                            style={{
                                ...FONTS.body3,
                                marginVertical: 12,
                            }}
                        >
                            Terms and Privacy
                        </Text>

                        <Button
                            title="Launch ProfitPilot"
                            onPress={() => checkToken()}
                            style={{
                                width: '100%',
                                paddingVertical: 12,
                                marginBottom: 48,
                            }}
                        />

                    </View>
                    <Text
                        style={{
                            ...FONTS.body3,
                            marginVertical: 12,
                        }}
                    >
                        version {appVersion}
                    </Text>

                </View>
            </PageContainer>
        </SafeAreaView>
    )
}
