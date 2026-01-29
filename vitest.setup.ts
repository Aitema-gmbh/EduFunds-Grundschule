import '@testing-library/jest-dom';
import React from 'react';

// RTL 16 / React 19 fix
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// React 19 test fix: Ensure React.act is available
if (typeof React.act !== 'function') {
  (React as any).act = (cb: any) => {
    return cb();
  };
}

// Global mocks for common browser APIs
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
