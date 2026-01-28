import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressBar from './ProgressBar';
import React from 'react';

describe('ProgressBar Component', () => {
  it('renders correctly with default props', () => {
    render(<ProgressBar value={50} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeDefined();
    expect(progressBar.getAttribute('aria-valuenow')).toBe('50');
    expect(progressBar.getAttribute('aria-valuemax')).toBe('100');
    expect(progressBar.style.width).toBe('50%');
  });

  it('calculates percentage correctly with custom max', () => {
    render(<ProgressBar value={25} max={50} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar.style.width).toBe('50%');
  });

  it('clamps values between 0 and 100%', () => {
    const { rerender } = render(<ProgressBar value={-10} />);
    let progressBar = screen.getByRole('progressbar');
    expect(progressBar.style.width).toBe('0%');

    rerender(<ProgressBar value={150} max={100} />);
    progressBar = screen.getByRole('progressbar');
    expect(progressBar.style.width).toBe('100%');
  });

  it('displays label when provided', () => {
    render(<ProgressBar value={50} label="Loading..." />);
    expect(screen.getByText('Loading...')).toBeDefined();
  });

  it('displays percentage text when showValue is true', () => {
    render(<ProgressBar value={75} showValue={true} />);
    expect(screen.getByText('75%')).toBeDefined();
  });

  it('applies correct color classes', () => {
    const { rerender } = render(<ProgressBar value={50} color="success" />);
    let progressBar = screen.getByRole('progressbar');
    expect(progressBar.className).toContain('bg-green-500');

    rerender(<ProgressBar value={50} color="error" />);
    progressBar = screen.getByRole('progressbar');
    expect(progressBar.className).toContain('bg-red-500');
  });

  it('applies custom className to container', () => {
    const { container } = render(<ProgressBar value={50} className="mt-4" />);
    expect(container.firstChild?.parentElement?.innerHTML).toContain('mt-4');
  });
});
