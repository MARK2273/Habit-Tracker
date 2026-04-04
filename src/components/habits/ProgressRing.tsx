import React from 'react';

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ 
  progress, 
  size = 48, 
  strokeWidth = 4,
  className 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  return (
    <svg 
      width={size} 
      height={size} 
      className={className}
      viewBox={`0 0 ${size} ${size}`}
    >
      {/* Background Circle */}
      <circle
        className="text-surface-low stroke-current"
        strokeWidth={strokeWidth}
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      {/* Progress Circle */}
      <circle
        className="text-secondary stroke-current transition-all duration-500 ease-out"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        style={{ strokeDashoffset: offset }}
        strokeLinecap="round"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
  );
};
