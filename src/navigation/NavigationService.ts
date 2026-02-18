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
  params?: RootStackParamList[T]
): void {
  if (isNavigationReady()) {
    navigationRef.current?.navigate(name as any, params as any);
  }
}

export function reset(state: any): void {
  if (isNavigationReady()) {
    navigationRef.current?.dispatch(CommonActions.reset(state));
  }
}

export function navigateToLogin(): void {
  reset({
    index: 0,
    routes: [{ name: 'Auth' }],
  });
}
