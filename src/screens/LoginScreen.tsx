import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { shadowPresets } from '../theme/shadows';

export default function LoginScreen() {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList>>();
  const { signIn, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isFormValid =
    email.trim().length > 0 && password.length >= 6;

  const handleLogin = async () => {
    setError('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await signIn(email.trim(), password);
      // Clear credentials after successful login to avoid keeping them in memory
      setEmail('');
      setPassword('');
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const showDemoHint = !isSupabaseConfigured();

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          {/* Branding */}
          <View style={styles.branding}>
            <View style={styles.logo}>
              <Text style={styles.logoIcon}>Construction</Text>
            </View>
            <Text style={styles.appName}>SAI ARCHITECT'S</Text>
            <Text style={styles.tagline}>
              Enterprise Project & Expense Control
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={t => {
                  setEmail(t);
                  setError('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                accessibilityLabel="Email address input"
                accessibilityHint="Enter your email address"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Password input"
                accessibilityHint="Enter your password"
              />
            </View>

            {error ? (
              <Text style={styles.error}>{error}</Text>
            ) : null}

            <Pressable
              style={[
                styles.button,
                (!isFormValid || loading || authLoading) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={!isFormValid || loading || authLoading}
              accessibilityRole="button"
              accessibilityLabel="Sign In Securely"
              accessibilityHint="Tap to sign in with your credentials"
            >
              {loading || authLoading ? (
                <View style={styles.loadingButtonContent}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.buttonLoadingText}>Signing in...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>
                  Sign In Securely
                </Text>
              )}
            </Pressable>

            <Text style={styles.forgot}>
              Forgot password?
            </Text>

            {showDemoHint && __DEV__ && (
              <View style={styles.demoHint}>
                <Text style={styles.demoHintTitle}>
                  Demo Mode
                </Text>
                <Text style={styles.demoHintText}>
                  Test credentials:{'\n'}
                  owner@test.com / owner123{'\n'}
                  supervisor@test.com /
                  supervisor123
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Secure access restricted to authorized
              personnel only.
            </Text>
            <Text style={styles.version}>
              v2.4.0 - Build 8922
            </Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  branding: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'visible',
    ...shadowPresets.button,
  },
  logoIcon: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    ...shadowPresets.card,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    ...shadowPresets.button,
  },
  error: {
    color: '#dc3545',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...shadowPresets.button,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonLoadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgot: {
    color: '#6c757d',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  demoHint: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e7f3ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b8daff',
  },
  demoHintTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004085',
    marginBottom: 4,
    textAlign: 'center',
  },
  demoHintText: {
    fontSize: 12,
    color: '#004085',
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 4,
  },
  version: {
    fontSize: 10,
    color: '#adb5bd',
    textAlign: 'center',
  },
});
