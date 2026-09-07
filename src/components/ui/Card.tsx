import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export function Card({
  children,
  padding = 'md',
  elevated = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-lg border border-border bg-surface-elevated
        ${elevated ? 'shadow-md' : 'shadow-sm'}
        ${paddingStyles[padding]}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
