/**
 * CivManager - Supabase Connection Test Utility
 * Simple test to verify Supabase integration is working in React Native environment
 */

// Import the test functions from the TypeScript service
const { testSupabaseConnection, isSupabaseConfigured, testDatabaseQuery } = require('../services/supabaseClient');

/**
 * Test Supabase connection and log results
 */
const runSupabaseTest = () => {
  console.log('🧪 Testing Supabase Integration...');
  
  // Check if Supabase is configured
  const configured = isSupabaseConfigured();
  console.log('Supabase configured:', configured);
  
  if (!configured) {
    console.error('❌ Supabase is not properly configured');
    console.log('💡 Please ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in your .env file');
    return;
  }
  
  console.log('✅ Supabase configuration detected');
  
  // Test the connection
  testSupabaseConnection().then(isConnected => {
    if (isConnected) {
      console.log('✅ Supabase connection successful!');
      console.log('🎉 Frontend is properly mapped to backend');
      
      // Test database query
      testDatabaseQuery().then(result => {
        if (result.success) {
          console.log('✅ Database query successful!');
          console.log('🎉 All Supabase functionality working correctly');
        } else {
          console.error('❌ Database query failed:', result.error);
          console.log('⚠️  Supabase may not be properly mapped to backend');
        }
      });
    } else {
      console.error('❌ Supabase connection failed');
      console.log('⚠️  Frontend may not be properly mapped to backend');
    }
  }).catch(error => {
    console.error('❌ Supabase test failed with error:', error);
  });
};

// Export the function
module.exports = { runSupabaseTest };

// Auto-run test when module is imported (for debugging)
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  // Small delay to ensure environment is loaded
  setTimeout(() => {
    runSupabaseTest();
  }, 1000);
}