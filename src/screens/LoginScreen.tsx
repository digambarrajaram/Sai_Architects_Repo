import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, UserRole } from '../navigation/types';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Determine role based on username for demo/testing
    const role = username.toLowerCase().includes('owner') 
      ? UserRole.OWNER 
      : UserRole.SUPERVISOR;
    
    login(role);
    // Navigation will be handled by AppNavigator observing isAuthenticated
  };

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.main}
          keyboardShouldPersistTaps="handled"
        >
          {/* App Branding */}
          <View style={styles.branding}>
            <View style={styles.logo}>
              <Text style={styles.logoIcon}>🏗️</Text>
            </View>
            <Text style={styles.appName}>SAI ARCHITECT'S</Text>
            <Text style={styles.tagline}>
              Enterprise Project & Expense Control
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            {/* Email / Username */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Work Email
              </Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your ID"
                  placeholderTextColor="#94a3b8"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  testID="username-input"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  testID="password-input"
                />
              </View>
            </View>

            {/* Remember / Forgot */}
            <View style={styles.row}>
              <View style={styles.rememberRow}>
                <View style={styles.checkbox} />
                <Text style={styles.rememberText}>
                  Remember me
                </Text>
              </View>
              <Text style={styles.link}>
                Forgot password?
              </Text>
            </View>

            {/* Submit */}
            <Pressable 
              style={styles.primaryButton}
              onPress={handleLogin}
              testID="login-button"
            >
              <Text style={styles.primaryButtonText}>
                Sign In securely
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerIcon}>🔐</Text>
          <Text style={styles.footerText}>
            Access restricted to authorized personnel only.
            {'\n'}
            Unauthorized access is prohibited and monitored.
          </Text>
          <Text style={styles.version}>
            v2.4.0 • Build 8922
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f6f7f8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  container: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#f6f7f8',
  },

  main: {
    flexGrow: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },

  branding: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#136dec',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  logoIcon: {
    fontSize: 36,
    color: '#fff',
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  tagline: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 6,
    textAlign: 'center',
  },

  form: {
    gap: 20,
  },

  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    fontSize: 16,
    color: '#94a3b8',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
  },
  rememberText: {
    fontSize: 13,
    color: '#475569',
  },
  link: {
    fontSize: 13,
    fontWeight: '500',
    color: '#136dec',
  },

  primaryButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#136dec',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  support: {
    marginTop: 32,
    alignItems: 'center',
    gap: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: 13,
    color: '#64748b',
  },
  supportLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  supportLink: {
    fontSize: 13,
    color: '#64748b',
  },
  dot: {
    fontSize: 12,
    color: '#94a3b8',
  },

  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  footerIcon: {
    fontSize: 18,
    color: '#94a3b8',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 260,
  },
  version: {
    marginTop: 10,
    fontSize: 10,
    color: '#94a3b8',
  },
});
