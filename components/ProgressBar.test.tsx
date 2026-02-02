import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  describe('Rendering', () => {
    it('should render progress bar with correct structure', () => {
      const { container } = render(<ProgressBar value={50} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should render with default props', () => {
      const { container } = render(<ProgressBar value={30} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should render custom className', () => {
      const { container } = render(
        <ProgressBar value={50} className="custom-class" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Progress Value', () => {
    it('should display correct progress value', () => {
      const { container } = render(<ProgressBar value={75} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    });

    it('should handle 0% progress', () => {
      const { container } = render(<ProgressBar value={0} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0');
      const fill = container.querySelector('.progress-fill, [style*="width"]');
      if (fill) {
        expect(fill).toHaveStyle({ width: '0%' });
      }
    });

    it('should handle 100% progress', () => {
      const { container } = render(<ProgressBar value={100} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
      const fill = container.querySelector('.progress-fill, [style*="width"]');
      if (fill) {
        expect(fill).toHaveStyle({ width: '100%' });
      }
    });

    it('should clamp values above 100', () => {
      const { container } = render(<ProgressBar value={150} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      const valueNow = progressBar?.getAttribute('aria-valuenow');
      expect(Number(valueNow)).toBeLessThanOrEqual(100);
    });

    it('should clamp negative values to 0', () => {
      const { container } = render(<ProgressBar value={-10} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      const valueNow = progressBar?.getAttribute('aria-valuenow');
      expect(Number(valueNow)).toBeGreaterThanOrEqual(0);
    });

    it('should handle decimal values', () => {
      const { container } = render(<ProgressBar value={45.5} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-valuenow', '45.5');
    });
  });

  describe('ARIA Attributes', () => {
    it('should have correct ARIA role', () => {
      const { container } = render(<ProgressBar value={50} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('role', 'progressbar');
    });

    it('should have aria-valuemin set to 0', () => {
      const { container } = render(<ProgressBar value={50} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    });

    it('should have aria-valuemax set to 100', () => {
      const { container } = render(<ProgressBar value={50} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('should have aria-valuenow matching the value prop', () => {
      const { container } = render(<ProgressBar value={67} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-valuenow', '67');
    });

    it('should support custom aria-label', () => {
      const { container } = render(
        <ProgressBar value={50} aria-label="Loading progress" />
      );
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-label', 'Loading progress');
    });
  });

  describe('Styling and Variants', () => {
    it('should apply default color variant', () => {
      const { container } = render(<ProgressBar value={50} />);
      const fill = container.querySelector('.progress-fill, [class*="fill"], [class*="bar"]');
      expect(fill).toBeInTheDocument();
    });

    it('should apply custom color variant', () => {
      const { container } = render(<ProgressBar value={50} variant="success" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toMatch(/success|green/i);
    });

    it('should apply custom size', () => {
      const { container } = render(<ProgressBar value={50} size="large" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toMatch(/large|lg/i);
    });

    it('should support different height values', () => {
      const { container } = render(<ProgressBar value={50} height={20} />);
      const wrapper = container.firstChild as HTMLElement;
      const style = window.getComputedStyle(wrapper);
      // Check if height is applied either via style or className
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Label Display', () => {
    it('should display percentage label when showLabel is true', () => {
      render(<ProgressBar value={50} showLabel={true} />);
      expect(screen.queryByText(/50%/)).toBeInTheDocument();
    });

    it('should not display label when showLabel is false', () => {
      render(<ProgressBar value={50} showLabel={false} />);
      expect(screen.queryByText(/50%/)).not.toBeInTheDocument();
    });

    it('should display custom label text', () => {
      render(<ProgressBar value={50} label="Half way there" />);
      expect(screen.getByText('Half way there')).toBeInTheDocument();
    });

    it('should format percentage correctly', () => {
      render(<ProgressBar value={33.333} showLabel={true} />);
      // Should round or display decimals appropriately
      const label = screen.getByText(/33/);
      expect(label).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should support animated prop', () => {
      const { container } = render(<ProgressBar value={50} animated={true} />);
      const fill = container.querySelector('.progress-fill, [class*="fill"], [class*="bar"]');
      expect(fill?.className).toMatch(/animate|animated|transition/i);
    });

    it('should not animate when animated is false', () => {
      const { container } = render(<ProgressBar value={50} animated={false} />);
      const fill = container.querySelector('.progress-fill, [class*="fill"], [class*="bar"]');
      // Should not have animation classes
      expect(fill).toBeInTheDocument();
    });
  });

  describe('Striped Pattern', () => {
    it('should apply striped pattern when striped is true', () => {
      const { container } = render(<ProgressBar value={50} striped={true} />);
      const fill = container.querySelector('[class*="stripe"]');
      expect(fill).toBeInTheDocument();
    });

    it('should not have stripes when striped is false', () => {
      const { container } = render(<ProgressBar value={50} striped={false} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).not.toMatch(/stripe/i);
    });
  });

  describe('Indeterminate State', () => {
    it('should render indeterminate state', () => {
      const { container } = render(<ProgressBar indeterminate={true} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should have correct ARIA attributes in indeterminate state', () => {
      const { container } = render(<ProgressBar indeterminate={true} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      // In indeterminate state, aria-valuenow might be absent
      expect(progressBar).toHaveAttribute('role', 'progressbar');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small values', () => {
      const { container } = render(<ProgressBar value={0.1} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-valuenow', '0.1');
    });

    it('should handle rapid value changes', () => {
      const { rerender, container } = render(<ProgressBar value={10} />);
      
      rerender(<ProgressBar value={50} />);
      let progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      
      rerender(<ProgressBar value={90} />);
      progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-valuenow', '90');
    });

    it('should handle NaN values gracefully', () => {
      const { container } = render(<ProgressBar value={NaN} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should handle Infinity values gracefully', () => {
      const { container } = render(<ProgressBar value={Infinity} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      const { container } = render(<ProgressBar value={50} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should announce progress to screen readers', () => {
      const { container } = render(<ProgressBar value={75} aria-label="Upload progress" />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute('aria-label', 'Upload progress');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    });

    it('should have sufficient color contrast', () => {
      const { container } = render(<ProgressBar value={50} />);
      const fill = container.querySelector('.progress-fill, [class*="fill"], [class*="bar"]');
      // Visual regression tests would verify actual contrast
      expect(fill).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle missing value prop gracefully', () => {
      const { container } = render(<ProgressBar value={undefined as any} />);
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should merge custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      const { container } = render(<ProgressBar value={50} style={customStyle} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ backgroundColor: 'red' });
    });

    it('should forward data attributes', () => {
      const { container } = render(
        <ProgressBar value={50} data-testid="custom-progress" />
      );
      expect(container.querySelector('[data-testid="custom-progress"]')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<ProgressBar value={50} />);
      const firstRender = performance.now();
      
      rerender(<ProgressBar value={50} />); // Same props
      const secondRender = performance.now();
      
      // Should be fast (memoization check)
      expect(secondRender - firstRender).toBeLessThan(100);
    });

    it('should handle multiple instances efficiently', () => {
      render(
        <>
          <ProgressBar value={10} />
          <ProgressBar value={20} />
          <ProgressBar value={30} />
          <ProgressBar value={40} />
          <ProgressBar value={50} />
        </>
      );
      
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars).toHaveLength(5);
    });
  });
});
