// src/context/ToastContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    const newToast: Toast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <View style={styles.container} pointerEvents="none">
        {toasts.map(toast => (
          <View 
            key={toast.id} 
            style={[
              styles.toast, 
              toast.type === 'success' && styles.successToast,
              toast.type === 'error' && styles.errorToast,
              toast.type === 'info' && styles.infoToast,
            ]}
            pointerEvents="auto"
          >
            <Text style={styles.toastIcon}>
              {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
            </Text>
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: '90%',
  },
  successToast: {
    backgroundColor: '#10b981',
  },
  errorToast: {
    backgroundColor: '#ef4444',
  },
  infoToast: {
    backgroundColor: '#3b82f6',
  },
  toastIcon: {
    fontSize: 16,
    color: '#fff',
    marginRight: 8,
    fontWeight: 'bold',
  },
  toastText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
  },
});
