import { useState, useEffect, useCallback } from "react";

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  persist?: boolean; // Use localStorage for persistence
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Hook للتخزين المؤقت الذكي (Smart Caching)
 * يخزن البيانات مؤقتاً ويعيد استخدامها
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const { ttl = 5 * 60 * 1000, persist = false } = options; // Default 5 minutes
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check if cache is valid
  const isCacheValid = useCallback(
    (entry: CacheEntry<T> | null): boolean => {
      if (!entry) return false;
      const now = Date.now();
      return now - entry.timestamp < ttl;
    },
    [ttl]
  );

  // Get from cache
  const getFromCache = useCallback((): CacheEntry<T> | null => {
    try {
      const storageKey = `cache_${key}`;
      const cached = persist
        ? localStorage.getItem(storageKey)
        : sessionStorage.getItem(storageKey);

      if (!cached) return null;

      return JSON.parse(cached) as CacheEntry<T>;
    } catch {
      return null;
    }
  }, [key, persist]);

  // Save to cache
  const saveToCache = useCallback(
    (data: T) => {
      try {
        const storageKey = `cache_${key}`;
        const entry: CacheEntry<T> = {
          data,
          timestamp: Date.now(),
        };

        const serialized = JSON.stringify(entry);

        if (persist) {
          localStorage.setItem(storageKey, serialized);
        } else {
          sessionStorage.setItem(storageKey, serialized);
        }
      } catch (err) {
        console.error("Failed to save to cache:", err);
      }
    },
    [key, persist]
  );

  // Clear cache
  const clearCache = useCallback(() => {
    try {
      const storageKey = `cache_${key}`;
      localStorage.removeItem(storageKey);
      sessionStorage.removeItem(storageKey);
    } catch (err) {
      console.error("Failed to clear cache:", err);
    }
  }, [key]);

  // Fetch data
  const fetchData = useCallback(
    async (force = false) => {
      setIsLoading(true);
      setError(null);

      try {
        // Check cache first
        if (!force) {
          const cached = getFromCache();
          if (cached && isCacheValid(cached)) {
            setData(cached.data);
            setIsLoading(false);
            return cached.data;
          }
        }

        // Fetch new data
        const newData = await fetcher();
        setData(newData);
        saveToCache(newData);
        setIsLoading(false);
        return newData;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        setIsLoading(false);
        throw error;
      }
    },
    [fetcher, getFromCache, isCacheValid, saveToCache]
  );

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [key]); // Only refetch when key changes

  return {
    data,
    isLoading,
    error,
    refetch: () => fetchData(true),
    clearCache,
  };
}

/**
 * Hook لإدارة ذاكرة التخزين المؤقت الكلية
 */
export function useCacheManager() {
  const clearAllCache = useCallback(() => {
    try {
      // Clear all cache entries
      const keysToRemove: string[] = [];

      // Check localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("cache_")) {
          keysToRemove.push(key);
        }
      }

      // Check sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith("cache_")) {
          keysToRemove.push(key);
        }
      }

      // Remove all cache keys
      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      return keysToRemove.length;
    } catch (err) {
      console.error("Failed to clear all cache:", err);
      return 0;
    }
  }, []);

  const getCacheSize = useCallback((): number => {
    let size = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("cache_")) {
        const value = localStorage.getItem(key);
        if (value) {
          size += value.length;
        }
      }
    }

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith("cache_")) {
        const value = sessionStorage.getItem(key);
        if (value) {
          size += value.length;
        }
      }
    }

    return size;
  }, []);

  return {
    clearAllCache,
    getCacheSize,
  };
}
