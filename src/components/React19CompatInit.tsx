'use client';

import { useEffect } from 'react';

export function React19CompatInit() {
  useEffect(() => {
    // Initialize React 19 compatibility fixes
    if (typeof window !== 'undefined') {
      const originalConsoleWarn = console.warn;
      const originalConsoleError = console.error;
      
      console.warn = (...args) => {
        // Suppress specific React 19 ref warnings
        if (
          typeof args[0] === 'string' && 
          (args[0].includes('Accessing element.ref was removed in React 19') ||
           args[0].includes('ref is now a regular prop') ||
           args[0].includes('It will be removed from the JSX Element type'))
        ) {
          return; // Don't log these warnings
        }
        originalConsoleWarn.apply(console, args);
      };

      console.error = (...args) => {
        // Suppress specific React 19 ref errors
        if (
          typeof args[0] === 'string' && 
          (args[0].includes('Accessing element.ref was removed in React 19') ||
           args[0].includes('ref is now a regular prop') ||
           args[0].includes('It will be removed from the JSX Element type'))
        ) {
          return; // Don't log these errors
        }
        originalConsoleError.apply(console, args);
      };
    }
  }, []);

  return null;
}
