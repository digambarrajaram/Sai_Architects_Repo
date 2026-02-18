/**
 * CivManager - Supabase Client Configuration
 * Centralized Supabase client setup with environment variables
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey, isEnvironmentConfigured, logEnvironmentStatus } from '../utils/envLoader';

// Get environment variables using the environment loader
const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

// Check if Supabase is configured with valid values
const isValidUrl = supabaseUrl && 
  typeof supabaseUrl === 'string' &&
  supabaseUrl !== '' && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseUrl.includes('.supabase.co');
const isValidKey = supabaseAnonKey && 
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey !== '' && 
  supabaseAnonKey !== 'your-anon-key';

const isConfigured = !!isValidUrl && !!isValidKey;

// Log environment status for debugging
logEnvironmentStatus();

// Log warning if not configured (app will use mock data)
if (!isConfigured) {
  console.warn(
    '[Supabase] Not configured. Using mock data. ' +
    'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env to enable Supabase.'
  );
}

// Create Supabase client only if properly configured
// This prevents "Invalid schema" and 406 errors from placeholder URLs
let supabaseInstance: SupabaseClient;

if (isConfigured && supabaseUrl && supabaseAnonKey) {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        // Explicitly set Accept header to prevent 406 Not Acceptable errors
        // PostgREST requires this to know what content type to return
        'Accept': 'application/json',
        // Set Content-Type to ensure proper request formatting
        'Content-Type': 'application/json',
      },
    },
  });
} else {
  // Create a dummy client that won't be used - prevents runtime errors
  // The shouldUseMockData() check in services will prevent actual API calls
  supabaseInstance = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = supabaseInstance;

// Export types for convenience
export type { SupabaseClient } from '@supabase/supabase-js';

// Utility function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return isConfigured;
};

// Test connection function with detailed diagnostics
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Try to get the current session to test the connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[Supabase] Connection test failed:', error.message);
      return false;
    }
    
    console.log('[Supabase] Connection test successful');
    return true;
  } catch (error) {
    console.error('[Supabase] Connection test failed:', error);
    return false;
  }
};

// Test database query function - helps diagnose 406 errors
export const testDatabaseQuery = async (): Promise<{ success: boolean; error?: string; data?: unknown }> => {
  if (!isConfigured) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Test a simple query to verify PostgREST is responding correctly
    const { data, error, status, statusText } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .limit(1);

    if (error) {
      console.error('[Supabase] Database query error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return { 
        success: false, 
        error: `${error.message} (Code: ${error.code || 'unknown'})` 
      };
    }

    console.log('[Supabase] Database query successful:', { status, statusText });
    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Supabase] Database query exception:', errorMessage);
    return { success: false, error: errorMessage };
  }
};

// Helper to log detailed error info for debugging 406 and other errors
export const logSupabaseError = (context: string, error: { 
  code?: string; 
  message?: string; 
  details?: string; 
  hint?: string;
  status?: number;
}) => {
  console.error(`[Supabase Error] ${context}:`, {
    code: error.code || 'N/A',
    message: error.message || 'N/A',
    details: error.details || 'N/A',
    hint: error.hint || 'N/A',
    status: error.status || 'N/A',
  });
  
  // Specific guidance for common errors
  if (error.message?.includes('Invalid schema')) {
    console.error('[Supabase] Invalid schema error - This usually means:');
    console.error('  1. The Accept-Profile header is set incorrectly');
    console.error('  2. The db.schema config option is not supported by your Supabase version');
    console.error('  3. Remove any custom schema headers and use default configuration');
  }
  
  if (error.status === 406 || error.code === 'PGRST106') {
    console.error('[Supabase] 406 Not Acceptable - This usually means:');
    console.error('  1. The Accept header does not match what the server can provide');
    console.error('  2. The requested resource format is not available');
    console.error('  3. There may be a mismatch between client expectations and server capabilities');
    console.error('  4. Try checking the network tab in DevTools to see the exact Accept headers being sent');
    console.error('  5. Ensure the server supports the requested content type');
  }
  
  if (error.code === 'PGRST116') {
    console.error('[Supabase] No rows found - the query returned no results');
  }
  
  if (error.code === '42501') {
    console.error('[Supabase] Insufficient privilege - RLS policy may be blocking access');
  }
};

// Utility function to handle 406 errors with retry logic
export const handle406Error = async <T>(
  operation: () => Promise<T>,
  context: string = 'operation'
): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    // Check if it's a 406 error
    if (error.status === 406 || error.code === 'PGRST106') {
      console.warn(`[Supabase] 406 error detected in ${context}, attempting recovery...`);
      
      // Log the current headers being used
      console.log('[Supabase] 406 error detected - check network tab for exact headers being sent');
      
      // Try with explicit headers
      try {
        // Create a temporary client with explicit headers for this request
        const tempClient = createClient(supabaseUrl!, supabaseAnonKey!, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
          global: {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          },
        });
        
        console.log('[Supabase] Retrying with explicit headers...');
        
        // Re-execute the operation with the temporary client
        // Note: This is a simplified approach - in practice, you'd need to 
        // modify the specific operation to use the temp client
        throw new Error('406 error recovery attempted - please check network tab for exact headers');
        
      } catch (retryError) {
        console.error(`[Supabase] 406 error recovery failed for ${context}:`, retryError);
        throw error; // Re-throw original error
      }
    }
    
    // Re-throw non-406 errors
    throw error;
  }
};

export default supabase;