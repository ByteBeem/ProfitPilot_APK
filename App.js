import React, { Suspense, lazy } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {StyleSheet} from "react-native";

// Lazy load screen components
const Welcome = lazy(() => import('./screens/Welcome/Welcome'));
const SignUp = lazy(() => import('./screens/Signup/Signup'));
const Reset = lazy(() => import('./screens/Reset/Reset'));
const Home = lazy(() => import('./screens/Home/Home'));
const Verify = lazy(() => import('./screens/Verification/verify'));
const Login = lazy(() => import('./screens/Login/Login'));
const WebView = lazy(() => import('./screens/Webview/Webview'));
const Change = lazy(() => import('./screens/ChangePassword/change'));
const Signals = lazy(() => import('./screens/Signals/Signals'));
const Profile = lazy(() => import('./screens/Profile/Profile'));
const Subscriptions = lazy(() => import('./screens/Subscriptions/subscriptions'));

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Suspense fallback={<LoadingScreen />}>
        <Stack.Navigator initialRouteName="Welcome">
          <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={SignUp} options={{ headerShown: false }} />
          <Stack.Screen name="Verify" component={Verify} options={{ headerShown: false }} />
          <Stack.Screen name="Reset" component={Reset} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
          <Stack.Screen name="Subscriptions" component={Subscriptions} options={{ headerShown: false }} />
          <Stack.Screen name="WebView" component={WebView} options={{ headerShown: false }} />
          <Stack.Screen name="Change" component={Change} options={{ headerShown: false }} />
          <Stack.Screen name="Signals" component={Signals} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
        </Stack.Navigator>
      </Suspense>
    </NavigationContainer>
  );
}

// Loading screen to display while components are being loaded
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
