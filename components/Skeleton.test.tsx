import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { Skeleton, CardSkeleton, ProgramCardSkeleton, DashboardSkeleton, ProgramListSkeleton } from './Skeleton';

// ============================================
// Skeleton Component Tests
// ============================================
describe('Skeleton', () => {
  describe('base rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<Skeleton />);
      // We check for the class since we can't easily access the div if it's null (it shouldn't be null)
      const skeleton = container.querySelector('.skeleton');
      
      expect(skeleton).toBeTruthy();
      expect(skeleton?.className).toContain('rounded-sm'); // default rectangular variant
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });

    it('should apply custom className', () => {
      const { container } = render(<Skeleton className="custom-class" />);
      const skeleton = container.querySelector('.skeleton');
      
      expect(skeleton?.className).toContain('custom-class');
    });
  });

  describe('variants', () => {
    it('should render text variant with rounded class', () => {
      const { container } = render(<Skeleton variant="text" />);
      const skeleton = container.querySelector('.skeleton');
      
      expect(skeleton?.className).toContain('rounded');
    });

    it('should render circular variant with rounded-full class', () => {
      const { container } = render(<Skeleton variant="circular" />);
      const skeleton = container.querySelector('.skeleton');
      
      expect(skeleton?.className).toContain('rounded-full');
    });
  });

  describe('dimensions', () => {
    it('should apply numeric width as pixels', () => {
      const { container } = render(<Skeleton width={100} />);
      const skeleton = container.querySelector('.skeleton') as HTMLElement;
      
      expect(skeleton?.style.width).toBe('100px');
    });

    it('should apply string width directly', () => {
      const { container } = render(<Skeleton width="50%" />);
      const skeleton = container.querySelector('.skeleton') as HTMLElement;
      
      expect(skeleton?.style.width).toBe('50%');
    });
  });
});

// ============================================
// CardSkeleton Component Tests
// ============================================
describe('CardSkeleton', () => {
  it('should render without crashing', () => {
    const { container } = render(<CardSkeleton />);
    expect(container.querySelector('.animate-fade-in')).toBeTruthy();
  });

  it('should have proper structure with header and content', () => {
    const { container } = render(<CardSkeleton />);
    
    // Should have skeleton elements inside
    const skeletons = container.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
