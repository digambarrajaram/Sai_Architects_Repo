/**
 * CivManager - Error State Component
 * Reusable error display for screens
 * UI Testing Ready - fixed dimensions, testID support
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';

// =====================================================
// TYPES
// =====================================================

interface ErrorStateProps {
  /** Error message to display */
  message?: string;
  /** Error title */
  title?: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Retry button text */
  retryText?: string;
  /** Whether to show full screen */
  fullScreen?: boolean;
  /** Custom container style */
  style?: ViewStyle;
  /** Test ID for UI testing */
  testID?: string;
}

// =====================================================
// COMPONENT
// =====================================================

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  title = 'Error',
  onRetry,
  retryText = 'Try Again',
  fullScreen = false,
  style,
  testID = 'error-state',
}: ErrorStateProps): React.ReactElement {
  const containerStyle = fullScreen
    ? [styles.fullScreenContainer, style]
    : [styles.container, style];

  return (
    <View style={containerStyle} testID={testID}>
      <View style={styles.iconContainer} testID={`${testID}-icon`}>
        <Text style={styles.icon}>⚠️</Text>
      </View>
      
      <Text style={styles.title} testID={`${testID}-title`}>
        {title}
      </Text>
      
      <Text style={styles.message} testID={`${testID}-message`}>
        {message}
      </Text>
      
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          testID={`${testID}-retry-button`}
          accessibilityRole="button"
          accessibilityLabel={retryText}
        >
          <Text style={styles.retryButtonText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// =====================================================
// INLINE ERROR
// =====================================================

interface InlineErrorProps {
  message: string;
  style?: ViewStyle;
  testID?: string;
}

export function InlineError({
  message,
  style,
  testID = 'inline-error',
}: InlineErrorProps): React.ReactElement {
  return (
    <View style={[styles.inlineContainer, style]} testID={testID}>
      <Text style={styles.inlineIcon}>⚠️</Text>
      <Text style={styles.inlineMessage}>{message}</Text>
    </View>
  );
}

// =====================================================
// NETWORK ERROR
// =====================================================

interface NetworkErrorProps {
  onRetry?: () => void;
  testID?: string;
}

export function NetworkError({
  onRetry,
  testID = 'network-error',
}: NetworkErrorProps): React.ReactElement {
  return (
    <ErrorState
      title="No Connection"
      message="Please check your internet connection and try again."
      onRetry={onRetry}
      retryText="Retry"
      testID={testID}
    />
  );
}

// =====================================================
// NOT FOUND ERROR
// =====================================================

interface NotFoundErrorProps {
  entityName?: string;
  onGoBack?: () => void;
  testID?: string;
}

export function NotFoundError({
  entityName = 'Item',
  onGoBack,
  testID = 'not-found-error',
}: NotFoundErrorProps): React.ReactElement {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🔍</Text>
      </View>
      
      <Text style={styles.title}>{entityName} Not Found</Text>
      
      <Text style={styles.message}>
        The {entityName.toLowerCase()} you're looking for doesn't exist or has been removed.
      </Text>
      
      {onGoBack && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onGoBack}
          testID={`${testID}-back-button`}
          accessibilityRole="button"
          accessibilityLabel="Go Back"
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// =====================================================
// PERMISSION ERROR
// =====================================================

interface PermissionErrorProps {
  message?: string;
  testID?: string;
}

export function PermissionError({
  message = "You don't have permission to view this content.",
  testID = 'permission-error',
}: PermissionErrorProps): React.ReactElement {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🔒</Text>
      </View>
      
      <Text style={styles.title}>Access Denied</Text>
      
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 250, // Fixed minimum height for testing
  } as ViewStyle,
  fullScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background || '#fff',
    padding: 24,
  } as ViewStyle,
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.errorLight || '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,
  icon: {
    fontSize: 36,
  } as TextStyle,
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text || '#333',
    marginBottom: 8,
    textAlign: 'center',
  } as TextStyle,
  message: {
    fontSize: 16,
    color: colors.textSecondary || '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  } as TextStyle,
  retryButton: {
    backgroundColor: colors.primary || '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  } as ViewStyle,
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight || '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  } as ViewStyle,
  inlineIcon: {
    fontSize: 16,
    marginRight: 8,
  } as TextStyle,
  inlineMessage: {
    flex: 1,
    fontSize: 14,
    color: colors.error || '#D32F2F',
  } as TextStyle,
});

export default ErrorState;
