import React, { useState, useEffect } from 'react';
import { StatusBar, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { Session } from '@supabase/supabase-js';

import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import { supabase } from './src/services/supabaseClient';

enableScreens();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app start
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.log("Session check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (isLoading) {
    // Show loading screen while checking session
    return (
      <SafeAreaProvider style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="light-content" />
        <Text>Loading...</Text>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <ToastProvider>
        <AuthProvider>
          <StatusBar barStyle="light-content" />
          <AppNavigator />
        </AuthProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
