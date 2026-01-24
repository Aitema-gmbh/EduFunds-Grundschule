import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { ErrorProvider, useError } from './ErrorContext';

// Test component that uses the useError hook
const TestComponent: React.FC<{ errorToSet?: string | null }> = ({ errorToSet }) => {
  const { error, setError } = useError();
  
  return (
    <div>
      <span data-testid="error-value">{error ?? 'no-error'}</span>
      <button 
        data-testid="set-error-btn" 
        onClick={() => setError(errorToSet !== undefined ? errorToSet : 'Test error')}
      >
        Set Error
      </button>
      <button 
        data-testid="clear-error-btn" 
        onClick={() => setError(null)}
      >
        Clear Error
      </button>
    </div>
  );
};

describe('ErrorContext', () => {
  describe('ErrorProvider', () => {
    it('should render children correctly', () => {
      render(
        <ErrorProvider>
          <div data-testid="child">Child content</div>
        </ErrorProvider>
      );
      
      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('should initially have no error', () => {
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );
      
      expect(screen.getByTestId('error-value')).toHaveTextContent('no-error');
    });

    it('should not show error banner when error is null', () => {
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );
      
      // Error banner should not be present
      expect(screen.queryByText('×')).not.toBeInTheDocument();
    });
  });

  describe('setError', () => {
    it('should set an error message', () => {
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );
      
      const setErrorBtn = screen.getByTestId('set-error-btn');
      fireEvent.click(setErrorBtn);
      
      expect(screen.getByTestId('error-value')).toHaveTextContent('Test error');
    });

    it('should show error banner when error is set', () => {
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );

      const setErrorBtn = screen.getByTestId('set-error-btn');
      fireEvent.click(setErrorBtn);

      // Error banner should show the error message (there are 2 elements with 'Test error')
      const errorElements = screen.getAllByText('Test error');
      expect(errorElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should clear error when setError is called with null', () => {
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );
      
      // First set an error
      fireEvent.click(screen.getByTestId('set-error-btn'));
      expect(screen.getByTestId('error-value')).toHaveTextContent('Test error');
      
      // Then clear it
      fireEvent.click(screen.getByTestId('clear-error-btn'));
      expect(screen.getByTestId('error-value')).toHaveTextContent('no-error');
    });

    it('should update error when setError is called with a new value', () => {
      const TestMultiError: React.FC = () => {
        const { error, setError } = useError();
        return (
          <div>
            <span data-testid="error-value">{error ?? 'no-error'}</span>
            <button data-testid="set-error-1" onClick={() => setError('First error')}>
              Error 1
            </button>
            <button data-testid="set-error-2" onClick={() => setError('Second error')}>
              Error 2
            </button>
          </div>
        );
      };

      render(
        <ErrorProvider>
          <TestMultiError />
        </ErrorProvider>
      );
      
      // Set first error
      fireEvent.click(screen.getByTestId('set-error-1'));
      expect(screen.getByTestId('error-value')).toHaveTextContent('First error');
      
      // Set second error
      fireEvent.click(screen.getByTestId('set-error-2'));
      expect(screen.getByTestId('error-value')).toHaveTextContent('Second error');
    });
  });

  describe('Error Banner', () => {
    it('should have a close button that clears the error', () => {
      render(
        <ErrorProvider>
          <TestComponent />
        </ErrorProvider>
      );

      // Set an error first
      fireEvent.click(screen.getByTestId('set-error-btn'));
      // Error appears in both test component and error banner
      const errorElements = screen.getAllByText('Test error');
      expect(errorElements.length).toBeGreaterThanOrEqual(2);

      // Click the close button (×)
      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);

      // Error should be cleared
      expect(screen.getByTestId('error-value')).toHaveTextContent('no-error');
      expect(screen.queryByText('Test error')).not.toBeInTheDocument();
    });

    it('should display the error message text', () => {
      const TestCustomError: React.FC = () => {
        const { setError } = useError();
        React.useEffect(() => {
          setError('Custom error message');
        }, [setError]);
        return null;
      };

      render(
        <ErrorProvider>
          <TestCustomError />
        </ErrorProvider>
      );
      
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });
  });

  describe('useError hook', () => {
    it('should throw error when used outside ErrorProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const TestOutsideProvider: React.FC = () => {
        const { error } = useError();
        return <div>{error}</div>;
      };

      expect(() => {
        render(<TestOutsideProvider />);
      }).toThrow('useError must be used within an ErrorProvider');
      
      consoleSpy.mockRestore();
    });

    it('should return the correct context type with error and setError', () => {
      let capturedContext: { error: string | null; setError: (e: string | null) => void } | null = null;
      
      const TestCaptureContext: React.FC = () => {
        const context = useError();
        capturedContext = context;
        return null;
      };

      render(
        <ErrorProvider>
          <TestCaptureContext />
        </ErrorProvider>
      );
      
      expect(capturedContext).not.toBeNull();
      expect(capturedContext).toHaveProperty('error');
      expect(capturedContext).toHaveProperty('setError');
      expect(typeof capturedContext?.setError).toBe('function');
    });
  });

  describe('Multiple consumers', () => {
    it('should share error state between multiple consumers', () => {
      const Consumer1: React.FC = () => {
        const { error, setError } = useError();
        return (
          <div>
            <span data-testid="consumer-1-error">{error ?? 'no-error'}</span>
            <button data-testid="consumer-1-btn" onClick={() => setError('From consumer 1')}>
              Set from 1
            </button>
          </div>
        );
      };

      const Consumer2: React.FC = () => {
        const { error } = useError();
        return <span data-testid="consumer-2-error">{error ?? 'no-error'}</span>;
      };

      render(
        <ErrorProvider>
          <Consumer1 />
          <Consumer2 />
        </ErrorProvider>
      );
      
      // Both should start with no error
      expect(screen.getByTestId('consumer-1-error')).toHaveTextContent('no-error');
      expect(screen.getByTestId('consumer-2-error')).toHaveTextContent('no-error');
      
      // Set error from consumer 1
      fireEvent.click(screen.getByTestId('consumer-1-btn'));
      
      // Both should show the same error
      expect(screen.getByTestId('consumer-1-error')).toHaveTextContent('From consumer 1');
      expect(screen.getByTestId('consumer-2-error')).toHaveTextContent('From consumer 1');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string as error', () => {
      render(
        <ErrorProvider>
          <TestComponent errorToSet="" />
        </ErrorProvider>
      );
      
      fireEvent.click(screen.getByTestId('set-error-btn'));
      
      // Empty string is still a string, so error-value shows empty content
      expect(screen.getByTestId('error-value')).toHaveTextContent('');
    });

    it('should handle special characters in error message', () => {
      const specialMessage = '<script>alert("xss")</script>';
      const TestSpecialChars: React.FC = () => {
        const { setError } = useError();
        React.useEffect(() => {
          setError(specialMessage);
        }, [setError]);
        return null;
      };

      render(
        <ErrorProvider>
          <TestSpecialChars />
        </ErrorProvider>
      );
      
      // The special characters should be escaped/displayed as text
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it('should handle very long error messages', () => {
      const longMessage = 'A'.repeat(1000);
      const TestLongError: React.FC = () => {
        const { setError } = useError();
        React.useEffect(() => {
          setError(longMessage);
        }, [setError]);
        return null;
      };

      render(
        <ErrorProvider>
          <TestLongError />
        </ErrorProvider>
      );
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle unicode characters in error message', () => {
      const unicodeMessage = '错误: 发生了问题 🚨 ⚠️ ❌';
      const TestUnicodeError: React.FC = () => {
        const { setError } = useError();
        React.useEffect(() => {
          setError(unicodeMessage);
        }, [setError]);
        return null;
      };

      render(
        <ErrorProvider>
          <TestUnicodeError />
        </ErrorProvider>
      );
      
      expect(screen.getByText(unicodeMessage)).toBeInTheDocument();
    });
  });
});
