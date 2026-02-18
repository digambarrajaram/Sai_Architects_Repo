/**
 * CivManager - Environment Variable Loader
 * Utility to properly load environment variables in React Native/Expo applications
 */

/**
 * Load environment variables for React Native/Expo applications
 * This handles the different ways environment variables are accessed in different contexts
 */
export const loadEnvironmentVariables = () => {
  // Method 1: Standard process.env (works in some Expo environments)
  const urlFromProcessEnv = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const keyFromProcessEnv = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  if (urlFromProcessEnv && keyFromProcessEnv) {
    return {
      supabaseUrl: urlFromProcessEnv,
      supabaseAnonKey: keyFromProcessEnv,
      source: 'process.env'
    };
  }
  
  // Method 2: Global object (common in React Native)
  const urlFromGlobal = (global as any)?.EXPO_PUBLIC_SUPABASE_URL;
  const keyFromGlobal = (global as any)?.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  if (urlFromGlobal && keyFromGlobal) {
    return {
      supabaseUrl: urlFromGlobal,
      supabaseAnonKey: keyFromGlobal,
      source: 'global'
    };
  }
  
  // Method 3: Global __env object (some bundlers use this)
  const urlFromGlobalEnv = (global as any)?.__env?.EXPO_PUBLIC_SUPABASE_URL;
  const keyFromGlobalEnv = (global as any)?.__env?.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  if (urlFromGlobalEnv && keyFromGlobalEnv) {
    return {
      supabaseUrl: urlFromGlobalEnv,
      supabaseAnonKey: keyFromGlobalEnv,
      source: 'global.__env'
    };
  }
  
  // Method 4: Direct access (fallback)
  const urlDirect = (global as any).EXPO_PUBLIC_SUPABASE_URL;
  const keyDirect = (global as any).EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  if (urlDirect && keyDirect) {
    return {
      supabaseUrl: urlDirect,
      supabaseAnonKey: keyDirect,
      source: 'direct'
    };
  }
  
  // No environment variables found
  return null;
};

/**
 * Get Supabase URL with validation
 */
export const getSupabaseUrl = (): string | null => {
  const env = loadEnvironmentVariables();
  if (env) {
    return env.supabaseUrl;
  }
  return null;
};

/**
 * Get Supabase Anon Key with validation
 */
export const getSupabaseAnonKey = (): string | null => {
  const env = loadEnvironmentVariables();
  if (env) {
    return env.supabaseAnonKey;
  }
  return null;
};

/**
 * Check if environment variables are properly configured
 */
export const isEnvironmentConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  
  const isValidUrl = url && 
    url !== '' && 
    url !== 'https://your-project.supabase.co' &&
    url.includes('.supabase.co');
  const isValidKey = key && 
    key !== '' && 
    key !== 'your-anon-key';
  
  return !!isValidUrl && !!isValidKey;
};

/**
 * Log environment configuration status for debugging
 */
export const logEnvironmentStatus = (): void => {
  const env = loadEnvironmentVariables();
  
  if (env) {
    console.log('[Environment] Supabase configuration found:', {
      source: env.source,
      url: env.supabaseUrl ? `${env.supabaseUrl.substring(0, 30)}...` : 'Not found',
      key: env.supabaseAnonKey ? '***hidden***' : 'Not found',
      configured: isEnvironmentConfigured()
    });
  } else {
    console.warn('[Environment] No Supabase configuration found. Using mock data.');
    console.log('[Environment] Please ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in your .env file');
  }
};

export default {
  loadEnvironmentVariables,
  getSupabaseUrl,
  getSupabaseAnonKey,
  isEnvironmentConfigured,
  logEnvironmentStatus,
};