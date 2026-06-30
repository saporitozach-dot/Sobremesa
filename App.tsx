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
import { colors, fonts } from './src/theme';
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
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.serif, fontSize: 17 },
        headerShadowVisible: false,
        headerBackTitle: 'Back',
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
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
              <RootNavigator />
            </NavigationContainer>
          </AppProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </View>
  );
}

export type RootNav = NativeStackNavigationProp<RootStackParamList>;
