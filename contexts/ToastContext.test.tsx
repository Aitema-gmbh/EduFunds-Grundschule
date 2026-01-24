import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ToastProvider, useToast, ToastType } from './ToastContext';

// Helper wrapper for testing hooks
const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // ============================================
  // useToast Hook Tests
  // ============================================
  describe('useToast hook', () => {
    it('should throw error when used outside ToastProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useToast());
      }).toThrow('useToast must be used within a ToastProvider');
      
      consoleSpy.mockRestore();
    });

    it('should return showToast function when used within ToastProvider', () => {
      const { result } = renderHook(() => useToast(), { wrapper });
      
      expect(result.current.showToast).toBeDefined();
      expect(typeof result.current.showToast).toBe('function');
    });
  });

  // ============================================
  // Toast Display Tests
  // ============================================
  describe('toast display', () => {
    it('should display a toast message when showToast is called', () => {
      const TestComponent = () => {
        const { showToast } = useToast();
        return (
          <button onClick={() => showToast('Test message')}>
            Show Toast
          </button>
        );
      };

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Toast'));
      
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    it('should display success toast with correct styling', () => {
      const TestComponent = () => {
        const { showToast } = useToast();
        return (
          <button onClick={() => showToast('Success!', 'success')}>
            Show Toast
          </button>
        );
      };

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Toast'));
      
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });

    it('should display error toast', () => {
      const TestComponent = () => {
        const { showToast } = useToast();
        return (
          <button onClick={() => showToast('Error occurred', 'error')}>
            Show Toast
          </button>
        );
      };

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Toast'));
      
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('should display warning toast', () => {
      const TestComponent = () => {
        const { showToast } = useToast();
        return (
          <button onClick={() => showToast('Warning message', 'warning')}>
            Show Toast
          </button>
        );
      };

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Toast'));
      
      expect(screen.getByText('Warning message')).toBeInTheDocument();
    });

    it('should display info toast by default', () => {
      const TestComponent = () => {
        const { showToast } = useToast();
        return (
          <button onClick={() => showToast('Info message')}>
            Show Toast
          </button>
        );
      };

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Toast'));
      
      expect(screen.getByText('Info message')).toBeInTheDocument();
    });
  });

  // ============================================
  // Toast Auto-dismiss Tests
  // ============================================
  describe('toast auto-dismiss', () => {
    it('should auto-dismiss toast after 5 seconds', async () => {
      const TestComponent = () => {
        const { showToast } = useToast();
        return (
          <button onClick={() => showToast('Auto dismiss test')}>
            Show Toast
          </button>
        );
      };

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Toast'));
      expect(screen.getByText('Auto dismiss test')).toBeInTheDocument();

      // Advance past the exit animation start (5000ms) and animation duration (300ms)
      act(() => {
        vi.advanceTimersByTime(5300);
      });

      expect(screen.queryByText('Auto dismiss test')).not.toBeInTheDocument();
    });

    it('should set isExiting state before removing toast', () => {
      const TestComponent = () => {
        const { showToast } = useToast();
        return (
          <button onClick={() => showToast('Exit test')}>
            Show Toast
          </button>
        );
      };

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Toast'));
      
      // Toast should be visible
      expect(screen.getByText('Exit test')).toBeInTheDocument();

      // Advance to trigger exit state (5000ms)
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Toast should still be in DOM during exit animation
      expect(screen.getByText('Exit test')).toBeInTheDocument();

      // Advance past exit animation (300ms more)
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Toast should be removed
      expect(screen.queryByText('Exit test')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // Toast Manual Close Tests
  // ============================================
  describe('toast manual close', () => {
    it('should close toast when close button is clicked', () => {
      const TestComponent = () => {
        const { showToast } = useToast();
        return (
          <button onClick={() => showToast('Closable toast')}>
            Show Toast
          </button>
        );
      };

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Toast'));
      expect(screen.getByText('Closable toast')).toBeInTheDocument();

      // Click the close button
      const closeButton = screen.getByLabelText('Toast schließen');
      fireEvent.click(closeButton);

      // Wait for exit animation
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.queryByText('Closable toast')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // Multiple Toasts Tests
  // ============================================
  describe('multiple toasts', () => {
    it('should display multiple toasts simultaneously', () => {
      const TestComponent = () => {
        const { showToast } = useToast();
        return (
          <>
            <button onClick={() => showToast('First toast')}>First</button>
            <button onClick={() => showToast('Second toast')}>Second</button>
            <button onClick={() => showToast('Third toast')}>Third</button>
          </>
        );
      };

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('First'));
      fireEvent.click(screen.getByText('Second'));
      fireEvent.click(screen.getByText('Third'));

      expect(screen.getByText('First toast')).toBeInTheDocument();
      expect(screen.getByText('Second toast')).toBeInTheDocument();
      expect(screen.getByText('Third toast')).toBeInTheDocument();
    });

    it('should dismiss toasts independently', () => {
      const TestComponent = () => {
        const { showToast } = useToast();
        return (
          <>
            <button onClick={() => showToast('First toast')}>First</button>
            <button onClick={() => showToast('Second toast')}>Second</button>
          </>
        );
      };

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('First'));
      
      // Add slight delay between toasts
      act(() => {
        vi.advanceTimersByTime(100);
      });
      
      fireEvent.click(screen.getByText('Second'));

      expect(screen.getByText('First toast')).toBeInTheDocument();
      expect(screen.getByText('Second toast')).toBeInTheDocument();

      // Close first toast manually
      const closeButtons = screen.getAllByLabelText('Toast schließen');
      fireEvent.click(closeButtons[0]);

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.queryByText('First toast')).not.toBeInTheDocument();
      expect(screen.getByText('Second toast')).toBeInTheDocument();
    });
  });

  // ============================================
  // Toast Container Tests
  // ============================================
  describe('toast container', () => {
    it('should render toast container with correct aria attributes', () => {
      render(
        <ToastProvider>
          <div>Test</div>
        </ToastProvider>
      );

      const container = document.querySelector('[aria-live="polite"]');
      
      expect(container).toHaveAttribute('aria-live', 'polite');
      expect(container).toHaveAttribute('aria-label', 'Benachrichtigungen');
    });
  });

  // ============================================
  // Toast Type Edge Cases
  // ============================================
  describe('toast type edge cases', () => {
    it('should handle all toast types', () => {
      const toastTypes: ToastType[] = ['success', 'error', 'warning', 'info'];
      
      const TestComponent = () => {
        const { showToast } = useToast();
        return (
          <>
            {toastTypes.map((type) => (
              <button key={type} onClick={() => showToast(`${type} toast`, type)}>
                {type}
              </button>
            ))}
          </>
        );
      };

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      toastTypes.forEach((type) => {
        fireEvent.click(screen.getByText(type));
        expect(screen.getByText(`${type} toast`)).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // Children Rendering Tests
  // ============================================
  describe('provider children', () => {
    it('should render children correctly', () => {
      render(
        <ToastProvider>
          <div data-testid="child">Child content</div>
        </ToastProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });
  });
});
