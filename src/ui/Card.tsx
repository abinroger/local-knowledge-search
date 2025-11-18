import React from 'react';

export interface CardProps {
  variant?: 'default' | 'elevated' | 'bordered' | 'glass';
  interactive?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const variants = {
  default: 'bg-white border border-neutral-200',
  elevated: 'bg-white shadow-md hover:shadow-lg',
  bordered: 'bg-white/50 backdrop-blur border border-neutral-200/50',
  glass: 'bg-white/80 backdrop-blur-lg border border-neutral-200/50',
};

/**
 * Card container component with multiple variants
 */
export const Card: React.FC<CardProps> = ({
  variant = 'default',
  interactive = false,
  children,
  className = '',
  onClick,
  onKeyDown,
}) => {
  const isInteractive = interactive || !!onClick;

  return (
    <div
      className={`
        ${variants[variant]}
        rounded-lg
        ${isInteractive ? 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg' : ''}
        ${className}
      `}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};
