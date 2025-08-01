import { useState, useEffect, useCallback, useRef } from "react";

// Hook for localStorage management
export const useLocalStorage = (key, initialValue, options = {}) => {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    onError = console.error,
  } = options;

  // Use ref to track if component is mounted
  const isMounted = useRef(false);

  // Get initial value from localStorage or use provided initial value
  const getInitialValue = useCallback(() => {
    try {
      if (typeof window === "undefined") return initialValue;

      const item = window.localStorage.getItem(key);
      if (item === null) return initialValue;

      return deserializer(item);
    } catch (error) {
      onError(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue, deserializer, onError]);

  const [storedValue, setStoredValue] = useState(getInitialValue);

  // Set value in localStorage and state
  const setValue = useCallback(
    (value) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save to state
        setStoredValue(valueToStore);

        // Save to localStorage
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, serializer(valueToStore));
        }
      } catch (error) {
        onError(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, serializer, onError]
  );

  // Remove value from localStorage and state
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      onError(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue, onError]);

  // Clear all localStorage
  const clearAll = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== "undefined") {
        window.localStorage.clear();
      }
    } catch (error) {
      onError("Error clearing localStorage:", error);
    }
  }, [initialValue, onError]);

  // Listen for changes to localStorage from other tabs/windows
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserializer(e.newValue));
        } catch (error) {
          onError(`Error deserializing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, deserializer, onError]);

  // Set mounted flag
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    value: storedValue,
    setValue,
    removeValue,
    clearAll,
    isMounted: isMounted.current,
  };
};

// Hook for sessionStorage management
export const useSessionStorage = (key, initialValue, options = {}) => {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    onError = console.error,
  } = options;

  const isMounted = useRef(false);

  const getInitialValue = useCallback(() => {
    try {
      if (typeof window === "undefined") return initialValue;

      const item = window.sessionStorage.getItem(key);
      if (item === null) return initialValue;

      return deserializer(item);
    } catch (error) {
      onError(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue, deserializer, onError]);

  const [storedValue, setStoredValue] = useState(getInitialValue);

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(key, serializer(valueToStore));
        }
      } catch (error) {
        onError(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue, serializer, onError]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(key);
      }
    } catch (error) {
      onError(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue, onError]);

  const clearAll = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== "undefined") {
        window.sessionStorage.clear();
      }
    } catch (error) {
      onError("Error clearing sessionStorage:", error);
    }
  }, [initialValue, onError]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserializer(e.newValue));
        } catch (error) {
          onError(`Error deserializing sessionStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, deserializer, onError]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    value: storedValue,
    setValue,
    removeValue,
    clearAll,
    isMounted: isMounted.current,
  };
};

// Hook for managing multiple localStorage keys
export const useLocalStorageMulti = (keys, options = {}) => {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    onError = console.error,
  } = options;

  const [values, setValues] = useState(() => {
    const initialValues = {};
    keys.forEach((key) => {
      try {
        if (typeof window === "undefined") {
          initialValues[key] = undefined;
          return;
        }

        const item = window.localStorage.getItem(key);
        initialValues[key] = item === null ? undefined : deserializer(item);
      } catch (error) {
        onError(`Error reading localStorage key "${key}":`, error);
        initialValues[key] = undefined;
      }
    });
    return initialValues;
  });

  const setValue = useCallback(
    (key, value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(values[key]) : value;

        setValues((prev) => ({ ...prev, [key]: valueToStore }));

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, serializer(valueToStore));
        }
      } catch (error) {
        onError(`Error setting localStorage key "${key}":`, error);
      }
    },
    [values, serializer, onError]
  );

  const removeValue = useCallback(
    (key) => {
      try {
        setValues((prev) => {
          const newValues = { ...prev };
          delete newValues[key];
          return newValues;
        });

        if (typeof window !== "undefined") {
          window.localStorage.removeItem(key);
        }
      } catch (error) {
        onError(`Error removing localStorage key "${key}":`, error);
      }
    },
    [onError]
  );

  const clearAll = useCallback(() => {
    try {
      setValues({});
      if (typeof window !== "undefined") {
        keys.forEach((key) => window.localStorage.removeItem(key));
      }
    } catch (error) {
      onError("Error clearing localStorage keys:", error);
    }
  }, [keys, onError]);

  return {
    values,
    setValue,
    removeValue,
    clearAll,
  };
};

export default useLocalStorage;
