import React from 'react';
import type { Verification } from '@/shared/contracts';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({
  className = '',
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default: 'bg-zinc-100 text-zinc-800 border border-zinc-200',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    info: 'bg-sky-50 text-sky-800 border border-sky-200',
    neutral: 'bg-zinc-100 text-zinc-600 border border-zinc-200',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs sm:text-sm px-2.5 py-1',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </span>
  );
}

/**
 * Formats ISO date (YYYY-MM-DD) into readable format, e.g. "9 Oct 2026"
 */
function formatDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      const month = monthNames[parseInt(parts[1], 10) - 1] || parts[1];
      const day = parseInt(parts[2], 10).toString();
      return `${day} ${month} ${year}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}

export interface TrustBadgeProps {
  verification: Verification;
  className?: string;
}

export function TrustBadge({ verification, className = '' }: TrustBadgeProps) {
  const dateFormatted = formatDate(verification.verifiedAt);

  switch (verification.level) {
    case 'called':
      return (
        <Badge variant="success" className={`font-semibold ${className}`}>
          <span className="mr-1">✅</span> Confirmed by phone · {dateFormatted}
        </Badge>
      );
    case 'official_list':
      return (
        <Badge variant="info" className={`font-semibold ${className}`}>
          <span className="mr-1">🏛</span> On official authorized list · {dateFormatted}
        </Badge>
      );
    case 'visited' as unknown as string:
      return (
        <Badge variant="success" className={`font-semibold ${className}`}>
          <span className="mr-1">📍</span> Verified in person · {dateFormatted}
        </Badge>
      );
    case 'unverified':
    default:
      return (
        <Badge variant="warning" className={className}>
          <span className="mr-1">⚠</span> Not yet verified
        </Badge>
      );
  }
}
