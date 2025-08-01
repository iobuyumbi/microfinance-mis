import { useState, useEffect, useMemo } from "react";
import { designTokens } from "@/lib/theme";

// Breakpoint values from design tokens
const breakpoints = designTokens.breakpoints;

// Convert breakpoint strings to numbers for comparison
const breakpointValues = {
  sm: parseInt(breakpoints.sm),
  md: parseInt(breakpoints.md),
  lg: parseInt(breakpoints.lg),
  xl: parseInt(breakpoints.xl),
  "2xl": parseInt(breakpoints["2xl"]),
};

// Hook for responsive design
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call once to set initial size

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const breakpoint = useMemo(() => {
    const { width } = windowSize;

    if (width >= breakpointValues["2xl"]) return "2xl";
    if (width >= breakpointValues.xl) return "xl";
    if (width >= breakpointValues.lg) return "lg";
    if (width >= breakpointValues.md) return "md";
    if (width >= breakpointValues.sm) return "sm";
    return "xs";
  }, [windowSize.width]);

  const isMobile = useMemo(
    () => breakpoint === "xs" || breakpoint === "sm",
    [breakpoint]
  );
  const isTablet = useMemo(() => breakpoint === "md", [breakpoint]);
  const isDesktop = useMemo(
    () => breakpoint === "lg" || breakpoint === "xl" || breakpoint === "2xl",
    [breakpoint]
  );
  const isLargeScreen = useMemo(
    () => breakpoint === "xl" || breakpoint === "2xl",
    [breakpoint]
  );

  const isAbove = (targetBreakpoint) => {
    const targetValue = breakpointValues[targetBreakpoint];
    return windowSize.width >= targetValue;
  };

  const isBelow = (targetBreakpoint) => {
    const targetValue = breakpointValues[targetBreakpoint];
    return windowSize.width < targetValue;
  };

  const isBetween = (minBreakpoint, maxBreakpoint) => {
    const minValue = breakpointValues[minBreakpoint];
    const maxValue = breakpointValues[maxBreakpoint];
    return windowSize.width >= minValue && windowSize.width < maxValue;
  };

  return {
    // Current state
    windowSize,
    breakpoint,

    // Device type helpers
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,

    // Breakpoint comparison helpers
    isAbove,
    isBelow,
    isBetween,

    // Raw values
    breakpoints: breakpointValues,
  };
};

// Hook for responsive values
export const useResponsiveValue = (values) => {
  const { breakpoint } = useResponsive();

  return useMemo(() => {
    // If values is a function, call it with the current breakpoint
    if (typeof values === "function") {
      return values(breakpoint);
    }

    // If values is an object, return the value for current breakpoint
    if (typeof values === "object" && values !== null) {
      // Try to find the exact breakpoint match
      if (values[breakpoint] !== undefined) {
        return values[breakpoint];
      }

      // Fallback logic: find the closest smaller breakpoint
      const breakpointOrder = ["2xl", "xl", "lg", "md", "sm", "xs"];
      const currentIndex = breakpointOrder.indexOf(breakpoint);

      for (let i = currentIndex; i < breakpointOrder.length; i++) {
        const fallbackBreakpoint = breakpointOrder[i];
        if (values[fallbackBreakpoint] !== undefined) {
          return values[fallbackBreakpoint];
        }
      }

      // If no match found, return the first available value
      return Object.values(values)[0];
    }

    // If values is not an object or function, return as is
    return values;
  }, [values, breakpoint]);
};

// Hook for responsive styles
export const useResponsiveStyles = (styles) => {
  const { breakpoint } = useResponsive();

  return useMemo(() => {
    if (typeof styles === "function") {
      return styles(breakpoint);
    }

    if (typeof styles === "object" && styles !== null) {
      // Find the most specific style for current breakpoint
      const breakpointOrder = ["2xl", "xl", "lg", "md", "sm", "xs"];
      const currentIndex = breakpointOrder.indexOf(breakpoint);

      let finalStyles = {};

      // Merge styles from current breakpoint down to xs
      for (let i = currentIndex; i < breakpointOrder.length; i++) {
        const bp = breakpointOrder[i];
        if (styles[bp]) {
          finalStyles = { ...finalStyles, ...styles[bp] };
        }
      }

      return finalStyles;
    }

    return styles;
  }, [styles, breakpoint]);
};

// Hook for responsive visibility
export const useResponsiveVisibility = (visibility) => {
  const { breakpoint } = useResponsive();

  return useMemo(() => {
    if (typeof visibility === "boolean") {
      return visibility;
    }

    if (typeof visibility === "object" && visibility !== null) {
      return visibility[breakpoint] ?? true;
    }

    return true;
  }, [visibility, breakpoint]);
};

// Utility function for responsive class names
export const getResponsiveClasses = (classMap) => {
  const { breakpoint } = useResponsive();

  if (typeof classMap === "string") {
    return classMap;
  }

  if (typeof classMap === "object" && classMap !== null) {
    const breakpointOrder = ["2xl", "xl", "lg", "md", "sm", "xs"];
    const currentIndex = breakpointOrder.indexOf(breakpoint);

    let classes = [];

    // Collect classes from current breakpoint down to xs
    for (let i = currentIndex; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (classMap[bp]) {
        classes.push(classMap[bp]);
      }
    }

    return classes.join(" ");
  }

  return "";
};

export default useResponsive;
