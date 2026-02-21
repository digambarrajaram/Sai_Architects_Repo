import { createRef } from 'react';
import {
  NavigationContainerRef,
  CommonActions,
  StackActions,
} from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef =
  createRef<NavigationContainerRef<RootStackParamList>>();

export function isNavigationReady(): boolean {
  return navigationRef.current?.isReady() ?? false;
}

export function navigate<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T],
  retries = 3
): void {
  const attemptNavigate = (remainingRetries: number) => {
    if (isNavigationReady()) {
      navigationRef.current?.navigate(name as any, params as any);
    } else if (remainingRetries > 0) {
      // Retry after a short delay if navigation isn't ready
      setTimeout(() => attemptNavigate(remainingRetries - 1), 100);
    }
  };
  attemptNavigate(retries);
}

export function reset(state: any, retries = 3): void {
  const attemptReset = (remainingRetries: number) => {
    if (isNavigationReady()) {
      navigationRef.current?.dispatch(CommonActions.reset(state));
    } else if (remainingRetries > 0) {
      // Retry after a short delay if navigation isn't ready
      setTimeout(() => attemptReset(remainingRetries - 1), 100);
    }
  };
  attemptReset(retries);
}

export function navigateToLogin(): void {
  reset({
    index: 0,
    routes: [{ name: 'Auth' }],
  });
}
