import type { HTMLAttributes, ReactNode } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeStyles = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  full: 'max-w-full',
};

export function Container({
  children,
  size = 'lg',
  className = '',
  ...props
}: ContainerProps) {
  return (
    <div
      className={`
        mx-auto w-full px-4 sm:px-6 lg:px-8
        ${sizeStyles[size]}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
