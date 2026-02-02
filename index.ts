/**
 * CivManager Navigation Exports
 * Project-centric, Role-aware, Production-grade
 */

/* =========================
   MAIN NAVIGATOR
   ========================= */
export { default as AppNavigator } from './src/navigation/AppNavigator';

/* =========================
   TYPES
   ========================= */
export type {
  RootStackParamList,
} from './src/navigation/types';

export {
  UserRole,
} from './src/navigation/types';

/* =========================
   REACT NAVIGATION TYPES
   (Convenience re-exports)
   ========================= */
export type {
  NavigationContainerRef,
  NavigationProp,
  RouteProp,
  ParamListBase,
} from '@react-navigation/native';

export type {
  StackNavigationProp,
  StackScreenProps,
} from '@react-navigation/stack';
