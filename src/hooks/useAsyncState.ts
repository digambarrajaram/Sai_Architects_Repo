/**
 * CivManager - Async State Hook
 * Reusable hook for managing async operations
 * Local state management pattern
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { AsyncState, LoadingState } from '../types';

// =====================================================
// ASYNC STATE HOOK
// =====================================================

interface UseAsyncStateOptions<T> {
  initialData?: T | null;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

interface UseAsyncStateReturn<T> extends AsyncState<T> {
  execute: (asyncFn: () => Promise<T>) => Promise<void>;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  loadingState: LoadingState;
}

export function useAsyncState<T>(
  options: UseAsyncStateOptions<T> = {}
): UseAsyncStateReturn<T> {
  const { initialData = null, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (asyncFn: () => Promise<T>) => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFn();
        if (mountedRef.current) {
          setData(result);
          setLoading(false);
          onSuccess?.(result);
        }
      } catch (err) {
        if (mountedRef.current) {
          const errorMessage = err instanceof Error ? err.message : 'An error occurred';
          setError(errorMessage);
          setLoading(false);
          onError?.(errorMessage);
        }
      }
    },
    [onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  const loadingState: LoadingState = loading
    ? 'loading'
    : error
    ? 'error'
    : data !== null
    ? 'success'
    : 'idle';

  return {
    data,
    loading,
    error,
    execute,
    setData,
    setError,
    reset,
    loadingState,
  };
}

// =====================================================
// ASYNC LIST HOOK
// =====================================================

interface UseAsyncListOptions<T> {
  initialData?: T[];
  pageSize?: number;
}

interface UseAsyncListReturn<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  hasMore: boolean;
  page: number;
  loadItems: (fetchFn: () => Promise<T[]>) => Promise<void>;
  loadMore: (fetchFn: (page: number) => Promise<T[]>) => Promise<void>;
  refresh: (fetchFn: () => Promise<T[]>) => Promise<void>;
  addItem: (item: T) => void;
  updateItem: (predicate: (item: T) => boolean, updates: Partial<T>) => void;
  removeItem: (predicate: (item: T) => boolean) => void;
  reset: () => void;
}

export function useAsyncList<T>(
  options: UseAsyncListOptions<T> = {}
): UseAsyncListReturn<T> {
  const { initialData = [], pageSize = 20 } = options;
  
  const [items, setItems] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadItems = useCallback(
    async (fetchFn: () => Promise<T[]>) => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchFn();
        if (mountedRef.current) {
          setItems(result);
          setHasMore(result.length >= pageSize);
          setPage(1);
          setLoading(false);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to load items');
          setLoading(false);
        }
      }
    },
    [pageSize]
  );

  const loadMore = useCallback(
    async (fetchFn: (page: number) => Promise<T[]>) => {
      if (loading || !hasMore) return;

      setLoading(true);
      const nextPage = page + 1;

      try {
        const result = await fetchFn(nextPage);
        if (mountedRef.current) {
          setItems(prev => [...prev, ...result]);
          setHasMore(result.length >= pageSize);
          setPage(nextPage);
          setLoading(false);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to load more items');
          setLoading(false);
        }
      }
    },
    [loading, hasMore, page, pageSize]
  );

  const refresh = useCallback(
    async (fetchFn: () => Promise<T[]>) => {
      setRefreshing(true);
      setError(null);

      try {
        const result = await fetchFn();
        if (mountedRef.current) {
          setItems(result);
          setHasMore(result.length >= pageSize);
          setPage(1);
          setRefreshing(false);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to refresh');
          setRefreshing(false);
        }
      }
    },
    [pageSize]
  );

  const addItem = useCallback((item: T) => {
    setItems(prev => [item, ...prev]);
  }, []);

  const updateItem = useCallback(
    (predicate: (item: T) => boolean, updates: Partial<T>) => {
      setItems(prev =>
        prev.map(item => (predicate(item) ? { ...item, ...updates } : item))
      );
    },
    []
  );

  const removeItem = useCallback((predicate: (item: T) => boolean) => {
    setItems(prev => prev.filter(item => !predicate(item)));
  }, []);

  const reset = useCallback(() => {
    setItems(initialData);
    setLoading(false);
    setError(null);
    setRefreshing(false);
    setHasMore(true);
    setPage(1);
  }, [initialData]);

  return {
    items,
    loading,
    error,
    refreshing,
    hasMore,
    page,
    loadItems,
    loadMore,
    refresh,
    addItem,
    updateItem,
    removeItem,
    reset,
  };
}

// =====================================================
// FORM STATE HOOK
// =====================================================

interface UseFormStateOptions<T> {
  initialValues: T;
  validate?: (values: T) => Record<string, string>;
  onSubmit?: (values: T) => Promise<void>;
}

interface UseFormStateReturn<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  submitting: boolean;
  submitError: string | null;
  isValid: boolean;
  isDirty: boolean;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: string, error: string) => void;
  setTouched: (field: string) => void;
  handleSubmit: () => Promise<void>;
  reset: () => void;
}

export function useFormState<T extends Record<string, any>>(
  options: UseFormStateOptions<T>
): UseFormStateReturn<T> {
  const { initialValues, validate, onSubmit } = options;
  
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
    // Clear error when value changes
    setErrors(prev => {
      const { [field as string]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const setTouched = useCallback((field: string) => {
    setTouchedState(prev => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = useCallback(async () => {
    // Validate all fields
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }

    if (!onSubmit) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(values);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouchedState({});
    setSubmitting(false);
    setSubmitError(null);
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  return {
    values,
    errors,
    touched,
    submitting,
    submitError,
    isValid,
    isDirty,
    setValue,
    setValues,
    setError,
    setTouched,
    handleSubmit,
    reset,
  };
}

export default useAsyncState;
