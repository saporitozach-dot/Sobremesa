import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';

import { AppProvider, useApp } from './src/context/AppContext';
import { useAppFonts } from './src/hooks/useAppFonts';
import { useReducedMotion } from './src/hooks/useReducedMotion';
import { colors, fonts, motion } from './src/theme';
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
import SessionCameraScreen from './src/screens/SessionCameraScreen';
import ActiveSessionRedirect from './src/navigation/ActiveSessionRedirect';

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
  SessionCamera: undefined;
  SessionComplete: {
    restaurantId: string;
    restaurantName: string;
    goalMinutes: number;
    stampCount: number;
    stampsRequired: number;
    rewardLabel: string;
    voucherUnlocked: boolean;
  };
  Settings: undefined;
  Rewards: { returnTo?: 'Locked' } | undefined;
  ConfirmRedeem: { restaurantId: string; returnTo?: 'Locked' };
  RedeemVoucher: { voucherId: string; returnTo?: 'Locked' };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: 'center' }}>
          <Text style={{ color: colors.text, fontSize: 18, fontFamily: fonts.serifBold, marginBottom: 12 }}>
            Something went wrong
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 14, fontFamily: fonts.sans }}>{this.state.error.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

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

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootNavigator() {
  const { account, onboarded } = useApp();
  const reduceMotion = useReducedMotion();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.serif, fontSize: 17 },
        headerShadowVisible: false,
        headerBackTitle: 'Back',
        contentStyle: { backgroundColor: colors.bg },
        animation: reduceMotion ? 'fade' : 'slide_from_right',
        animationDuration: reduceMotion ? motion.reduced : motion.normal,
        fullScreenGestureEnabled: true,
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
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PhoneVerify"
            component={PhoneVerifyScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : !onboarded ? (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false, animation: 'fade' }}
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
            options={{
              headerShown: false,
              // Quick rise-and-fade: opening a partner should feel like lifting a
              // card off the list, not pushing sideways into a new section.
              animation: reduceMotion ? 'fade' : 'fade_from_bottom',
              animationDuration: reduceMotion ? motion.reduced : motion.fast,
            }}
          />
          <Stack.Screen
            name="ZonePrompt"
            component={ZonePromptScreen}
            options={{ presentation: 'transparentModal', animation: 'fade', headerShown: false }}
          />
          <Stack.Screen
            name="Locked"
            component={LockedModeScreen}
            options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }}
          />
          <Stack.Screen
            name="SessionCamera"
            component={SessionCameraScreen}
            options={{ headerShown: false, presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="SessionComplete"
            component={SessionCompleteScreen}
            options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Rewards"
            component={RewardsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ConfirmRedeem"
            component={ConfirmRedeemScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }}
          />
          <Stack.Screen
            name="RedeemVoucher"
            component={RedeemVoucherScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const { loaded: fontsLoaded } = useAppFonts();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded) {
      setAppReady(true);
    }
  }, [fontsLoaded]);

  // Never hang on splash if fonts are slow or fail in an embedded build.
  useEffect(() => {
    const timeout = setTimeout(() => setAppReady(true), 2500);
    return () => clearTimeout(timeout);
  }, []);

  const onRootLayout = useCallback(() => {
    if (appReady) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgDeep }} onLayout={onRootLayout}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <AppProvider>
            <StatusBar style="light" />
            <NavigationContainer theme={navTheme}>
              <ActiveSessionRedirect />
              <RootNavigator />
            </NavigationContainer>
          </AppProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </View>
  );
}

export type RootNav = NativeStackNavigationProp<RootStackParamList>;
