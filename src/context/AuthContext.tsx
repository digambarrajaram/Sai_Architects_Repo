import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '../navigation/types';

interface AuthContextType {
  role: UserRole | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);

  const login = (selectedRole: UserRole) => {
    setRole(selectedRole);
  };

  const logout = () => {
    setRole(null);
  };

  const isAuthenticated = role !== null;

  return (
    <AuthContext.Provider value={{ role, login, logout, isAuthenticated }}>
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
