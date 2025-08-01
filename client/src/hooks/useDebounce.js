import { useState, useEffect, useCallback, useRef } from "react";

// Hook for debouncing values
export const useDebounce = (value, delay = 500, options = {}) => {
  const {
    immediate = false,
    maxWait,
    leading = false,
    trailing = true,
  } = options;

  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef(null);
  const lastCallTimeRef = useRef(0);
  const lastValueRef = useRef(value);

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTimeRef.current;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Check if we should execute immediately
    if (immediate && value !== lastValueRef.current) {
      setDebouncedValue(value);
      lastValueRef.current = value;
      lastCallTimeRef.current = now;
      return;
    }

    // Check if we should execute due to maxWait
    if (maxWait && timeSinceLastCall >= maxWait) {
      setDebouncedValue(value);
      lastValueRef.current = value;
      lastCallTimeRef.current = now;
      return;
    }

    // Handle leading edge
    if (leading && value !== lastValueRef.current) {
      setDebouncedValue(value);
      lastValueRef.current = value;
      lastCallTimeRef.current = now;
    }

    // Set timeout for trailing edge
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
        lastValueRef.current = value;
        lastCallTimeRef.current = Date.now();
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, immediate, maxWait, leading, trailing]);

  // Cancel the debounce
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Flush the debounce immediately
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setDebouncedValue(value);
    lastValueRef.current = value;
    lastCallTimeRef.current = Date.now();
  }, [value]);

  return {
    value: debouncedValue,
    cancel,
    flush,
    isPending: timeoutRef.current !== null,
  };
};

// Hook for debouncing function calls
export const useDebouncedCallback = (callback, delay = 500, options = {}) => {
  const {
    immediate = false,
    maxWait,
    leading = false,
    trailing = true,
  } = options;

  const timeoutRef = useRef(null);
  const lastCallTimeRef = useRef(0);
  const lastArgsRef = useRef(null);
  const isPendingRef = useRef(false);

  const debouncedCallback = useCallback(
    (...args) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTimeRef.current;

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Store the latest arguments
      lastArgsRef.current = args;

      // Check if we should execute immediately
      if (immediate) {
        callback(...args);
        lastCallTimeRef.current = now;
        return;
      }

      // Check if we should execute due to maxWait
      if (maxWait && timeSinceLastCall >= maxWait) {
        callback(...args);
        lastCallTimeRef.current = now;
        isPendingRef.current = false;
        return;
      }

      // Handle leading edge
      if (leading && !isPendingRef.current) {
        callback(...args);
        lastCallTimeRef.current = now;
        isPendingRef.current = true;
      }

      // Set timeout for trailing edge
      if (trailing) {
        timeoutRef.current = setTimeout(() => {
          callback(...lastArgsRef.current);
          lastCallTimeRef.current = Date.now();
          isPendingRef.current = false;
        }, delay);
      }
    },
    [callback, delay, immediate, maxWait, leading, trailing]
  );

  // Cancel the debounce
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isPendingRef.current = false;
  }, []);

  // Flush the debounce immediately
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (lastArgsRef.current) {
      callback(...lastArgsRef.current);
      lastCallTimeRef.current = Date.now();
    }
    isPendingRef.current = false;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    callback: debouncedCallback,
    cancel,
    flush,
    isPending: isPendingRef.current,
  };
};

// Hook for debouncing async function calls
export const useDebouncedAsyncCallback = (
  asyncCallback,
  delay = 500,
  options = {}
) => {
  const {
    immediate = false,
    maxWait,
    leading = false,
    trailing = true,
  } = options;

  const timeoutRef = useRef(null);
  const lastCallTimeRef = useRef(0);
  const lastArgsRef = useRef(null);
  const isPendingRef = useRef(false);
  const isExecutingRef = useRef(false);

  const debouncedAsyncCallback = useCallback(
    async (...args) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTimeRef.current;

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Store the latest arguments
      lastArgsRef.current = args;

      // Check if we should execute immediately
      if (immediate) {
        isExecutingRef.current = true;
        try {
          const result = await asyncCallback(...args);
          lastCallTimeRef.current = now;
          return result;
        } finally {
          isExecutingRef.current = false;
        }
      }

      // Check if we should execute due to maxWait
      if (maxWait && timeSinceLastCall >= maxWait) {
        isExecutingRef.current = true;
        try {
          const result = await asyncCallback(...args);
          lastCallTimeRef.current = now;
          isPendingRef.current = false;
          return result;
        } finally {
          isExecutingRef.current = false;
        }
      }

      // Handle leading edge
      if (leading && !isPendingRef.current) {
        isExecutingRef.current = true;
        try {
          const result = await asyncCallback(...args);
          lastCallTimeRef.current = now;
          isPendingRef.current = true;
          return result;
        } finally {
          isExecutingRef.current = false;
        }
      }

      // Set timeout for trailing edge
      if (trailing) {
        return new Promise((resolve, reject) => {
          timeoutRef.current = setTimeout(async () => {
            isExecutingRef.current = true;
            try {
              const result = await asyncCallback(...lastArgsRef.current);
              lastCallTimeRef.current = Date.now();
              isPendingRef.current = false;
              resolve(result);
            } catch (error) {
              reject(error);
            } finally {
              isExecutingRef.current = false;
            }
          }, delay);
        });
      }
    },
    [asyncCallback, delay, immediate, maxWait, leading, trailing]
  );

  // Cancel the debounce
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isPendingRef.current = false;
  }, []);

  // Flush the debounce immediately
  const flush = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (lastArgsRef.current) {
      isExecutingRef.current = true;
      try {
        const result = await asyncCallback(...lastArgsRef.current);
        lastCallTimeRef.current = Date.now();
        return result;
      } finally {
        isExecutingRef.current = false;
        isPendingRef.current = false;
      }
    }
  }, [asyncCallback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    callback: debouncedAsyncCallback,
    cancel,
    flush,
    isPending: isPendingRef.current,
    isExecuting: isExecutingRef.current,
  };
};

export default useDebounce;
