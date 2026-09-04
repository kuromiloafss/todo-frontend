'use client';

import { useSyncExternalStore, useCallback, useMemo } from 'react';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('local-storage-update', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('local-storage-update', callback);
  };
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Stabilkan nilai initialValue agar tidak memicu re-render saat berbentuk Array/Object
  const initialValueString = useMemo(
    () => JSON.stringify(initialValue),
    [JSON.stringify(initialValue)]
  );

  // Stabilkan getSnapshot menggunakan useCallback
  const getSnapshot = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? item : initialValueString;
    } catch {
      return initialValueString;
    }
  }, [key, initialValueString]);

  const getServerSnapshot = useCallback(() => {
    return initialValueString;
  }, [initialValueString]);

  const rawValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Parse JSON dengan proteksi try-catch
  const storedValue: T = useMemo(() => {
    try {
      return JSON.parse(rawValue);
    } catch (error) {
      console.warn(`Gagal parse data dari localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [rawValue, initialValue]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const item = window.localStorage.getItem(key);
        const current: T = item !== null ? JSON.parse(item) : initialValue;
        const nextValue = value instanceof Function ? value(current) : value;

        window.localStorage.setItem(key, JSON.stringify(nextValue));
        window.dispatchEvent(new Event('local-storage-update'));
      } catch (error) {
        console.warn(`Gagal menyimpan ke localStorage untuk key "${key}":`, error);
      }
    },
    [key, initialValue]
  );

  return [storedValue, setValue] as const;
}