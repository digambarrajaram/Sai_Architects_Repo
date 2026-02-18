import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase, isSupabaseConfigured, logSupabaseError } from '../services/supabaseClient';
import { UserRole } from '../navigation/types';

// =====================================================
// BACKEND-ALIGNED TYPES
// =====================================================

export interface UserProfile {
  id: string; // UUID from auth.users
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  login: (userData: UserProfile) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Supabase auth helpers
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Seed user IDs from backend migration plan for demo/testing (fallback when Supabase not configured)
const SEED_USERS: Record<string, UserProfile> = {
  'owner@test.com': {
    id: '11111111-1111-1111-1111-111111111111',
    fullName: 'Owner One',
    email: 'owner@test.com',
    role: UserRole.OWNER,
    createdAt: new Date().toISOString(),
  },
  'supervisor@test.com': {
    id: '33333333-3333-3333-3333-333333333333',
    fullName: 'Supervisor One',
    email: 'supervisor@test.com',
    role: UserRole.SUPERVISOR,
    createdAt: new Date().toISOString(),
  },
};

// Demo passwords for seed users (only used when Supabase is not configured)
const DEMO_PASSWORDS: Record<string, string> = {
  'owner@test.com': 'owner123',
  'supervisor@test.com': 'supervisor123',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount and listen for auth state changes
  useEffect(() => {
    checkSession();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          // User is signed in
          fetchUserProfile(session.user.id);
        } else {
          // User is signed out
          setUser(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Helper function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      if (isSupabaseConfigured()) {
        // Check if user is authenticated before making Supabase requests
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          if (__DEV__) {
            console.log('[Auth] User not authenticated - cannot fetch profile');
          }
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          logSupabaseError('fetchUserProfile', profileError);
        }
        
        if (profile) {
          setUser({
            id: profile.id,
            fullName: profile.full_name || 'User',
            email: profile.email || '',
            role: profile.role as UserRole || UserRole.SUPERVISOR,
            createdAt: profile.created_at || new Date().toISOString(),
          });
        } else {
          // Profile doesn't exist, create basic user from auth
          setUser({
            id: userId,
            fullName: 'User',
            email: '',
            role: UserRole.SUPERVISOR,
            createdAt: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('[Auth] Fetch user profile error:', error);
    }
  };

  const checkSession = async () => {
    try {
      if (isSupabaseConfigured()) {
        // Check for existing Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          logSupabaseError('getSession', error);
        }
        
        if (session?.user) {
          // Check if user is authenticated before making Supabase requests
          const { data: authSession } = await supabase.auth.getSession();
          if (!authSession.session) {
            if (__DEV__) {
              console.log('[Auth] User not authenticated - cannot fetch profile');
            }
            return;
          }

          // Fetch user profile from profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError && profileError.code !== 'PGRST116') {
            // Log error but don't fail - PGRST116 just means no profile found
            logSupabaseError('fetchProfile', profileError);
          }
          
          if (profile) {
            setUser({
              id: profile.id,
              fullName: profile.full_name || session.user.email || 'User',
              email: session.user.email || '',
              role: profile.role as UserRole || UserRole.SUPERVISOR,
              createdAt: profile.created_at || new Date().toISOString(),
            });
          } else {
            // Profile doesn't exist, create basic user from auth
            setUser({
              id: session.user.id,
              fullName: session.user.email || 'User',
              email: session.user.email || '',
              role: UserRole.SUPERVISOR,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    } catch (error) {
      console.error('[Auth] Session check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo login - only used when Supabase is not configured
  const login = (userData: UserProfile) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const isAuthenticated = user !== null;

  // Supabase sign in
  const signIn = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      if (isSupabaseConfigured()) {
        // Use Supabase authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password,
        });

        if (error) {
          logSupabaseError('signInWithPassword', error);
          throw new Error(error.message);
        }

        if (data.user) {
          // Fetch user profile from profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            // Log error but don't fail - PGRST116 just means no profile found
            logSupabaseError('fetchProfile on signIn', profileError);
          }

          if (profile) {
            setUser({
              id: profile.id,
              fullName: profile.full_name || data.user.email || 'User',
              email: data.user.email || '',
              role: profile.role as UserRole || UserRole.SUPERVISOR,
              createdAt: profile.created_at || new Date().toISOString(),
            });
          } else {
            // Profile doesn't exist yet - user might need to complete setup
            setUser({
              id: data.user.id,
              fullName: data.user.email || 'User',
              email: data.user.email || '',
              role: UserRole.SUPERVISOR,
              createdAt: new Date().toISOString(),
            });
          }
        }
      } else {
        // Demo mode - validate against seed users
        const seedUser = SEED_USERS[email.toLowerCase().trim()];
        const expectedPassword = DEMO_PASSWORDS[email.toLowerCase().trim()];
        
        if (!seedUser) {
          throw new Error('Invalid email or password. Try owner@test.com or supervisor@test.com');
        }
        
        if (password !== expectedPassword) {
          throw new Error('Invalid email or password.');
        }
        
        setUser(seedUser);
      }
    } catch (error) {
      console.error('[Auth] Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Supabase sign up
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ): Promise<void> => {
    setIsLoading(true);
    
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Registration requires Supabase configuration');
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Create profile via RPC (backend-enforced)
        const { error: profileError } = await supabase.rpc('create_profile', {
          p_user_id: data.user.id,
          p_full_name: fullName,
          p_role: role,
        });

        if (profileError) {
          console.error('[Auth] Profile creation error:', profileError);
          // Don't throw - user is created, profile can be created later
        }

        setUser({
          id: data.user.id,
          fullName,
          email: data.user.email || '',
          role,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('[Auth] Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        isAuthenticated, 
        isLoading,
        signIn, 
        signUp 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export seed users for demo/testing
export { SEED_USERS, DEMO_PASSWORDS };
