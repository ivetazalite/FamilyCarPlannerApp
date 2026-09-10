import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SystemBars } from 'react-native-edge-to-edge';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { FamilyProvider } from '@/contexts/FamilyContext';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const DevErrorBoundary = __DEV__
  ? ErrorBoundary
  : ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

function NavigationGuard() {
  const { isLoading } = useAuth();
  console.log('[NavigationGuard] isLoading:', isLoading);
  if (isLoading) return null;
  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'SpaceGrotesk-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
    'SpaceGrotesk-Medium': require('../assets/fonts/SpaceMono-Regular.ttf'),
    'SpaceGrotesk-SemiBold': require('../assets/fonts/SpaceMono-Bold.ttf'),
    'SpaceGrotesk-Bold': require('../assets/fonts/SpaceMono-Bold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const CustomDefaultTheme: Theme = {
    ...DefaultTheme,
    dark: false,
    colors: {
      primary: '#1E3A5F',
      background: '#F0F4F8',
      card: '#FFFFFF',
      text: '#1A2332',
      border: 'rgba(30, 58, 95, 0.08)',
      notification: '#EF4444',
    },
  };

  const CustomDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      primary: '#00B4D8',
      background: '#0D1B2A',
      card: '#1A2B3C',
      text: '#E8F0FE',
      border: 'rgba(255, 255, 255, 0.08)',
      notification: '#F87171',
    },
  };

  return (
    <DevErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FamilyProvider>
            <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomDefaultTheme}>
              <SafeAreaProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <NavigationGuard />
                  <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen
                      name="reservation/new"
                      options={{
                        presentation: 'formSheet',
                        sheetGrabberVisible: true,
                        sheetAllowedDetents: [0.6, 1.0],
                        headerShown: false,
                      }}
                    />
                    <Stack.Screen
                      name="reservation/[id]"
                      options={{
                        title: 'Reservation',
                        headerBackButtonDisplayMode: 'minimal',
                      }}
                    />
                    <Stack.Screen
                      name="settings/index"
                      options={{
                        title: 'Family Settings',
                        headerBackButtonDisplayMode: 'minimal',
                      }}
                    />
                  </Stack>
                  <StatusBar style="auto" animated />
                  <SystemBars style="auto" />
                </GestureHandlerRootView>
              </SafeAreaProvider>
            </ThemeProvider>
          </FamilyProvider>
        </AuthProvider>
      </QueryClientProvider>
    </DevErrorBoundary>
  );
}
