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
import SignUpScreen from './src/screens/SignUpScreen';
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
  SignUp: undefined;
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
            options={{ presentation: 'modal', headerShown: true, headerTitle: '' }}
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
            options={{ title: 'Confirm', presentation: 'modal' }}
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
