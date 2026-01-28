import React from 'react';

interface ProgressBarProps {
  value: number; // Current progress value (0 to max)
  max?: number;  // Maximum progress value (default: 100)
  label?: string; // Optional label to display above the bar
  showValue?: boolean; // Whether to show the percentage text
  className?: string; // Additional Tailwind classes for the container
  color?: 'primary' | 'success' | 'warning' | 'error'; // Color variant
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  className = '',
  color = 'primary'
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  const colorClasses = {
    primary: 'bg-blue-600',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
          {showValue && (
            <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className={`${colorClasses[color]} h-2.5 rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
