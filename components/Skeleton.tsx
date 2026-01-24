import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
}) => {
  const baseClasses = 'skeleton';
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-sm',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

export const CardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 animate-fade-in">
    <div className="flex items-start justify-between mb-4">
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton width={60} height={20} />
    </div>
    <Skeleton width="60%" height={32} className="mb-2" />
    <Skeleton width="40%" height={16} />
  </div>
);

export const ProgramCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 p-6 animate-fade-in">
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Score section */}
      <div className="col-span-12 md:col-span-2">
        <Skeleton width={60} height={40} className="mb-2" />
        <Skeleton width="100%" height={6} />
      </div>

      {/* Main content */}
      <div className="col-span-12 md:col-span-7">
        <Skeleton width="70%" height={24} className="mb-3" />
        <Skeleton width="100%" height={16} className="mb-2" />
        <Skeleton width="80%" height={16} className="mb-4" />
        <div className="flex gap-2">
          <Skeleton width={60} height={24} />
          <Skeleton width={80} height={24} />
          <Skeleton width={50} height={24} />
        </div>
      </div>

      {/* Facts section */}
      <div className="col-span-12 md:col-span-3 border-l border-stone-100 dark:border-stone-800 pl-6">
        <Skeleton width="80%" height={20} className="mb-3" />
        <Skeleton width="60%" height={20} className="mb-3" />
        <Skeleton width="70%" height={20} />
      </div>
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="animate-fade-in">
    {/* Header skeleton */}
    <div className="mb-12 border-b border-stone-200 dark:border-stone-800 pb-8">
      <Skeleton width={100} height={16} className="mb-3" />
      <Skeleton width="60%" height={48} className="mb-4" />
      <Skeleton width="50%" height={24} />
    </div>

    {/* Stats grid skeleton */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {[1, 2, 3, 4].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>

    {/* Main content skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3">
          <Skeleton width={150} height={24} className="mb-4" />
          <Skeleton width="100%" height={80} />
          <Skeleton width="100%" height={80} />
          <Skeleton width="100%" height={80} />
        </div>
      ))}
    </div>
  </div>
);

export const ProgramListSkeleton: React.FC = () => (
  <div className="max-w-5xl animate-fade-in">
    <div className="flex items-end justify-between mb-12">
      <div>
        <Skeleton width={200} height={32} className="mb-2" />
        <Skeleton width={300} height={16} />
      </div>
      <Skeleton width={150} height={40} />
    </div>
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <ProgramCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
