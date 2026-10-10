import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-zinc-200 rounded-md ${className}`}
      {...props}
    />
  );
}
