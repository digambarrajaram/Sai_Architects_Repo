/**
 * CivManager - Supabase Connection Test
 * Simple test to verify Supabase integration is working
 */

import { testSupabaseConnection, isSupabaseConfigured } from '../services/supabaseClient';

export const runSupabaseTest = async (): Promise<void> => {
  console.log('🧪 Testing Supabase Integration...');
  
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    console.error('❌ Supabase is not properly configured');
    return;
  }
  
  console.log('✅ Supabase configuration detected');
  
  // Test the connection
  const isConnected = await testSupabaseConnection();
  
  if (isConnected) {
    console.log('✅ Supabase connection successful!');
    console.log('🎉 Frontend is properly mapped to backend');
  } else {
    console.error('❌ Supabase connection failed');
    console.log('⚠️  Frontend may not be properly mapped to backend');
  }
};

// Export for use in components
export default runSupabaseTest;