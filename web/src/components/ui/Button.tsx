import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

    const variants = {
      primary: 'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900 shadow-sm',
      secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300',
      outline: 'border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 active:bg-zinc-100',
      ghost: 'text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 min-h-[36px]',
      md: 'text-sm px-4 py-2.5 min-h-[44px]', // 44px min target for touch
      lg: 'text-base px-5 py-3 min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
