import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, useApp } from './src/context/AppContext';
import { colors } from './src/theme';
import AuthScreen from './src/screens/AuthScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import PhoneVerifyScreen from './src/screens/PhoneVerifyScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import ZonePromptScreen from './src/screens/ZonePromptScreen';
import LockedModeScreen from './src/screens/LockedModeScreen';
import SessionCompleteScreen from './src/screens/SessionCompleteScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import RewardsScreen from './src/screens/RewardsScreen';
import RedeemVoucherScreen from './src/screens/RedeemVoucherScreen';
import ConfirmRedeemScreen from './src/screens/ConfirmRedeemScreen';
import RestaurantDetailScreen from './src/screens/RestaurantDetailScreen';

export type RootStackParamList = {
  Auth: undefined;
  Login: { prefillPhone?: string } | undefined;
  SignUp: undefined;
  PhoneVerify: {
    draft: {
      firstName: string;
      email: string;
      phone: string;
      password: string;
    };
  };
  ForgotPassword: undefined;
  Onboarding: undefined;
  Home: undefined;
  RestaurantDetail: { restaurantId: string; distanceMiles?: number };
  ZonePrompt: undefined;
  Locked: undefined;
  SessionComplete: undefined;
  Settings: undefined;
  Rewards: { returnTo?: 'Locked' } | undefined;
  ConfirmRedeem: { restaurantId: string; returnTo?: 'Locked' };
  RedeemVoucher: { voucherId: string; returnTo?: 'Locked' };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Foreground notifications should still show a banner.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    primary: colors.primary,
    border: colors.border,
  },
};

function RootNavigator() {
  const { account, onboarded } = useApp();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {!account ? (
        <>
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{ title: 'Sign up', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Log in', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="PhoneVerify"
            component={PhoneVerifyScreen}
            options={{ title: 'Verify phone', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ title: 'Forgot password', headerBackTitle: 'Back' }}
          />
        </>
      ) : !onboarded ? (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RestaurantDetail"
            component={RestaurantDetailScreen}
            options={{ title: 'Partner' }}
          />
          <Stack.Screen
            name="ZonePrompt"
            component={ZonePromptScreen}
            options={{ presentation: 'modal', headerShown: false }}
          />
          <Stack.Screen
            name="Locked"
            component={LockedModeScreen}
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen
            name="SessionComplete"
            component={SessionCompleteScreen}
            options={{ headerShown: false, gestureEnabled: false }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
          <Stack.Screen
            name="Rewards"
            component={RewardsScreen}
            options={{ title: 'Stamp book' }}
          />
          <Stack.Screen
            name="ConfirmRedeem"
            component={ConfirmRedeemScreen}
            options={{ title: 'Confirm', presentation: 'modal', headerShown: false }}
          />
          <Stack.Screen
            name="RedeemVoucher"
            component={RedeemVoucherScreen}
            options={{ title: 'Voucher', presentation: 'modal' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

export type RootNav = NativeStackNavigationProp<RootStackParamList>;
