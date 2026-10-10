import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export function Card({
  as: Component = 'div',
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <Component
      className={`bg-white rounded-xl border border-zinc-200 p-4 sm:p-5 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mb-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  as: Component = 'h3',
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: React.ElementType }) {
  return (
    <Component className={`text-base sm:text-lg font-semibold text-zinc-900 ${className}`} {...props}>
      {children}
    </Component>
  );
}

export function CardContent({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`text-sm text-zinc-600 ${className}`} {...props}>
      {children}
    </div>
  );
}
