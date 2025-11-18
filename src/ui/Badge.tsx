import React from 'react';

export interface BadgeProps {
  variant?: 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'primary';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const variants = {
  success: 'bg-green-100 text-green-700',
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  neutral: 'bg-neutral-100 text-neutral-700',
  primary: 'bg-primary-100 text-primary-700',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

/**
 * Badge component for labels and status indicators
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'sm',
  children,
  className = '',
  icon,
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        ${variants[variant]}
        ${sizes[size]}
        rounded-full font-medium
        ${className}
      `}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
