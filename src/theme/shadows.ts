/**
 * CivManager - Shadow Utilities
 * Cross-platform shadow definitions
 * Uses boxShadow for web, shadow* props for native
 */

import { Platform, StyleSheet } from 'react-native';

export type ShadowStyle = {
  // iOS shadow props
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  // Android elevation
  elevation?: number;
  // Web boxShadow
  boxShadow?: string;
};

/**
 * Creates a cross-platform shadow style
 * On web: uses boxShadow
 * On native: uses shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation
 */
export function createShadow(
  options: {
    color?: string;
    offset?: { width: number; height: number };
    opacity?: number;
    radius?: number;
    elevation?: number;
  }
): ShadowStyle {
  const {
    color = '#000',
    offset = { width: 0, height: 2 },
    opacity = 0.1,
    radius = 4,
    elevation = 2,
  } = options;

  if (Platform.OS === 'web') {
    // Convert to boxShadow for web
    // boxShadow: offsetX offsetY blurRadius spreadRadius color
    const r = Math.round(opacity * 255);
    const alpha = r.toString(16).padStart(2, '0');
    const boxShadowColor = `${color}${alpha}`;
    return {
      boxShadow: `${offset.width}px ${offset.height}px ${radius}px ${boxShadowColor}`,
    };
  }

  // Native platforms use shadow* props
  return {
    shadowColor: color,
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
}

/**
 * Predefined shadow styles for common use cases
 */
export const shadows = StyleSheet.create({
  none: {},
  sm: createShadow({ opacity: 0.05, radius: 2, elevation: 1 }),
  md: createShadow({ opacity: 0.1, radius: 4, elevation: 2 }),
  lg: createShadow({ opacity: 0.15, radius: 8, elevation: 4 }),
  xl: createShadow({ opacity: 0.25, radius: 12, elevation: 8 }),
});

/**
 * Shadow presets matching common design patterns
 */
export const shadowPresets = {
  card: createShadow({ opacity: 0.1, radius: 4, elevation: 3 }),
  button: createShadow({ opacity: 0.1, radius: 2, elevation: 2 }),
  modal: createShadow({ opacity: 0.25, radius: 8, elevation: 5 }),
  fab: createShadow({ opacity: 0.25, radius: 4, elevation: 8 }),
  header: createShadow({ opacity: 0.05, radius: 2, elevation: 2 }),
  listItem: createShadow({ opacity: 0.03, radius: 2, elevation: 1 }),
};
