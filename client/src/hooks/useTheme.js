import { useState, useEffect } from 'react';

/**
 * A custom hook for managing theme (light/dark mode)
 * @returns {Object} Theme state and setter function
 */
export function useTheme() {
  // Check if user has a theme preference in localStorage
  const storedTheme = localStorage.getItem('theme');
  // Check if user has a system preference for dark mode
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Initialize theme state based on stored preference or system preference
  const [theme, setThemeState] = useState(
    storedTheme || (prefersDark ? 'dark' : 'light')
  );

  // Function to set theme and update localStorage
  const setTheme = (newTheme) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
  };

  // Apply theme class to document when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    // Add the current theme class
    root.classList.add(theme);
  }, [theme]);

  return { theme, setTheme };
}