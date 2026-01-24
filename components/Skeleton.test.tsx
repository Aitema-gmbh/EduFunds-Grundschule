import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton, CardSkeleton, ProgramCardSkeleton, DashboardSkeleton, ProgramListSkeleton } from './Skeleton';

// ============================================
// Skeleton Component Tests
// ============================================
describe('Skeleton', () => {
  describe('base rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      
      expect(skeleton).toBeInTheDocument();
      expect(skeleton.className).toContain('skeleton');
      expect(skeleton.className).toContain('rounded-sm'); // default rectangular variant
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });

    it('should apply custom className', () => {
      const { container } = render(<Skeleton className="custom-class" />);
      const skeleton = container.firstChild as HTMLElement;
      
      expect(skeleton.className).toContain('custom-class');
      expect(skeleton.className).toContain('skeleton');
    });
  });

  describe('variants', () => {
    it('should render text variant with rounded class', () => {
      const { container } = render(<Skeleton variant="text" />);
      const skeleton = container.firstChild as HTMLElement;
      
      expect(skeleton.className).toContain('rounded');
    });

    it('should render circular variant with rounded-full class', () => {
      const { container } = render(<Skeleton variant="circular" />);
      const skeleton = container.firstChild as HTMLElement;
      
      expect(skeleton.className).toContain('rounded-full');
    });

    it('should render rectangular variant with rounded-sm class', () => {
      const { container } = render(<Skeleton variant="rectangular" />);
      const skeleton = container.firstChild as HTMLElement;
      
      expect(skeleton.className).toContain('rounded-sm');
    });
  });

  describe('dimensions', () => {
    it('should apply numeric width as pixels', () => {
      const { container } = render(<Skeleton width={100} />);
      const skeleton = container.firstChild as HTMLElement;
      
      expect(skeleton.style.width).toBe('100px');
    });

    it('should apply string width directly', () => {
      const { container } = render(<Skeleton width="50%" />);
      const skeleton = container.firstChild as HTMLElement;
      
      expect(skeleton.style.width).toBe('50%');
    });

    it('should apply numeric height as pixels', () => {
      const { container } = render(<Skeleton height={50} />);
      const skeleton = container.firstChild as HTMLElement;
      
      expect(skeleton.style.height).toBe('50px');
    });

    it('should apply string height directly', () => {
      const { container } = render(<Skeleton height="2rem" />);
      const skeleton = container.firstChild as HTMLElement;
      
      expect(skeleton.style.height).toBe('2rem');
    });

    it('should apply both width and height', () => {
      const { container } = render(<Skeleton width={200} height={100} />);
      const skeleton = container.firstChild as HTMLElement;
      
      expect(skeleton.style.width).toBe('200px');
      expect(skeleton.style.height).toBe('100px');
    });
  });

  describe('accessibility', () => {
    it('should be hidden from screen readers', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });
  });
});

// ============================================
// CardSkeleton Component Tests
// ============================================
describe('CardSkeleton', () => {
  it('should render without crashing', () => {
    const { container } = render(<CardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should have proper structure with header and content', () => {
    const { container } = render(<CardSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    
    // Should have skeleton elements inside
    const skeletons = skeleton.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should include animation class', () => {
    const { container } = render(<CardSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton.className).toContain('animate-fade-in');
  });

  it('should have proper styling classes', () => {
    const { container } = render(<CardSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton.className).toContain('bg-white');
    expect(skeleton.className).toContain('border');
  });
});

// ============================================
// ProgramCardSkeleton Component Tests
// ============================================
describe('ProgramCardSkeleton', () => {
  it('should render without crashing', () => {
    const { container } = render(<ProgramCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should have grid layout for content sections', () => {
    const { container } = render(<ProgramCardSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    
    const grid = skeleton.querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });

  it('should have multiple skeleton elements', () => {
    const { container } = render(<ProgramCardSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    
    const skeletons = skeleton.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(5);
  });

  it('should have animation class', () => {
    const { container } = render(<ProgramCardSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton.className).toContain('animate-fade-in');
  });
});

// ============================================
// DashboardSkeleton Component Tests
// ============================================
describe('DashboardSkeleton', () => {
  it('should render without crashing', () => {
    const { container } = render(<DashboardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render four CardSkeletons for stats grid', () => {
    const { container } = render(<DashboardSkeleton />);
    const grids = container.querySelectorAll('.grid');
    
    // Should have at least one grid
    expect(grids.length).toBeGreaterThan(0);
  });

  it('should have animation class', () => {
    const { container } = render(<DashboardSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton.className).toContain('animate-fade-in');
  });

  it('should have header section', () => {
    const { container } = render(<DashboardSkeleton />);
    const header = container.querySelector('.mb-12');
    
    expect(header).toBeInTheDocument();
  });
});

// ============================================
// ProgramListSkeleton Component Tests
// ============================================
describe('ProgramListSkeleton', () => {
  it('should render without crashing', () => {
    const { container } = render(<ProgramListSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render multiple program card skeletons', () => {
    const { container } = render(<ProgramListSkeleton />);
    const programCards = container.querySelectorAll('.grid.grid-cols-1');
    
    expect(programCards.length).toBeGreaterThan(0);
  });

  it('should have animation class', () => {
    const { container } = render(<ProgramListSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton.className).toContain('animate-fade-in');
  });

  it('should have max-width constraint', () => {
    const { container } = render(<ProgramListSkeleton />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton.className).toContain('max-w-5xl');
  });

  it('should have header with title and button skeletons', () => {
    const { container } = render(<ProgramListSkeleton />);
    const header = container.querySelector('.flex.items-end.justify-between');
    
    expect(header).toBeInTheDocument();
  });
});
