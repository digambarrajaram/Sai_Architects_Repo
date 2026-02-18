/**
 * CivManager - Supabase Test Component
 * Component to test Supabase connection and display results
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { testSupabaseConnection, testDatabaseQuery, isSupabaseConfigured } from '../services/supabaseClient';

interface SupabaseTestProps {
  visible?: boolean;
}

export const SupabaseTest: React.FC<SupabaseTestProps> = ({ visible = true }) => {
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [dbQueryResult, setDbQueryResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      runTest();
    }
  }, [visible]);

  const runTest = async () => {
    setLoading(true);
    
    // Check configuration
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);
    
    if (configured) {
      // Test connection
      const connected = await testSupabaseConnection();
      setIsConnected(connected);
      
      // Test database query
      const dbResult = await testDatabaseQuery();
      setDbQueryResult(dbResult);
    } else {
      setIsConnected(false);
      setDbQueryResult({ success: false, error: 'Not configured' });
    }
    
    setLoading(false);
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Connection Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.label}>Configuration:</Text>
        <Text style={isConfigured ? styles.success : styles.error}>
          {isConfigured ? '✅ Configured' : '❌ Not Configured'}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.label}>Connection:</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <Text style={isConnected ? styles.success : styles.error}>
            {isConnected === null ? '⏳ Testing...' : isConnected ? '✅ Connected' : '❌ Failed'}
          </Text>
        )}
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.label}>Database Query:</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <Text style={dbQueryResult?.success ? styles.success : styles.error}>
            {dbQueryResult === null ? '⏳ Testing...' : dbQueryResult?.success ? '✅ Success' : '❌ Failed'}
          </Text>
        )}
      </View>

      {dbQueryResult?.error && (
        <Text style={styles.errorMessage}>
          Error: {dbQueryResult.error}
        </Text>
      )}

      {isConfigured && isConnected && dbQueryResult?.success && (
        <Text style={styles.successMessage}>
          🎉 Frontend is properly mapped to backend!
        </Text>
      )}

      {isConfigured && (!isConnected || !dbQueryResult?.success) && (
        <Text style={styles.errorMessage}>
          ⚠️  Frontend may not be properly mapped to backend
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  success: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
  error: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: '600',
  },
  successMessage: {
    fontSize: 14,
    color: '#28a745',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  errorMessage: {
    fontSize: 14,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
});

export default SupabaseTest;