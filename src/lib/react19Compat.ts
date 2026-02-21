'use client';

// React 19 Compatibility Helper
// This suppresses the "Accessing element.ref was removed in React 19" warning
// which comes from third-party libraries that haven't updated yet

export function suppressReact19RefWarnings() {
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
}

// Auto-suppress warnings when this module is imported
if (typeof window !== 'undefined') {
  suppressReact19RefWarnings();
}