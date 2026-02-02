/**
 * CivManager - Loading State Component
 * Reusable loading indicator for screens
 * UI Testing Ready - fixed dimensions, testID support
 */

import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  DimensionValue,
} from 'react-native';
import { colors } from '../../theme/colors';

// =====================================================
// TYPES
// =====================================================

interface LoadingStateProps {
  /** Loading message to display */
  message?: string;
  /** Size of the loading indicator */
  size?: 'small' | 'large';
  /** Whether to show full screen overlay */
  fullScreen?: boolean;
  /** Custom container style */
  style?: ViewStyle;
  /** Test ID for UI testing */
  testID?: string;
}

// =====================================================
// COMPONENT
// =====================================================

export function LoadingState({
  message = 'Loading...',
  size = 'large',
  fullScreen = false,
  style,
  testID = 'loading-state',
}: LoadingStateProps): React.ReactElement {
  const containerStyle = fullScreen
    ? [styles.fullScreenContainer, style]
    : [styles.container, style];

  return (
    <View style={containerStyle} testID={testID}>
      <ActivityIndicator
        size={size}
        color={colors.primary}
        testID={`${testID}-indicator`}
      />
      {message && (
        <Text style={styles.message} testID={`${testID}-message`}>
          {message}
        </Text>
      )}
    </View>
  );
}

// =====================================================
// INLINE LOADING (for buttons, etc.)
// =====================================================

interface InlineLoadingProps {
  size?: 'small' | 'large';
  color?: string;
  testID?: string;
}

export function InlineLoading({
  size = 'small',
  color = colors.primary,
  testID = 'inline-loading',
}: InlineLoadingProps): React.ReactElement {
  return (
    <ActivityIndicator
      size={size}
      color={color}
      testID={testID}
    />
  );
}

// =====================================================
// SKELETON LOADING
// =====================================================

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  testID?: string;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  testID = 'skeleton',
}: SkeletonProps): React.ReactElement {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
      testID={testID}
    />
  );
}

// =====================================================
// SKELETON LIST
// =====================================================

interface SkeletonListProps {
  count?: number;
  itemHeight?: number;
  spacing?: number;
  testID?: string;
}

export function SkeletonList({
  count = 5,
  itemHeight = 60,
  spacing = 12,
  testID = 'skeleton-list',
}: SkeletonListProps): React.ReactElement {
  return (
    <View style={styles.skeletonList} testID={testID}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[styles.skeletonItem, { marginBottom: spacing }]}
          testID={`${testID}-item-${index}`}
        >
          <Skeleton height={itemHeight} />
        </View>
      ))}
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
    padding: 20,
    minHeight: 200, // Fixed minimum height for testing
  } as ViewStyle,
  fullScreenContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
  } as ViewStyle,
  message: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary || '#666',
    textAlign: 'center',
  } as TextStyle,
  skeleton: {
    backgroundColor: '#E1E9EE',
    overflow: 'hidden',
  } as ViewStyle,
  skeletonList: {
    padding: 16,
  } as ViewStyle,
  skeletonItem: {
    width: '100%',
  } as ViewStyle,
});

export default LoadingState;
