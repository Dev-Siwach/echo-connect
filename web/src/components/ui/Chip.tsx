import React from 'react';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
}

export function Chip({
  children,
  selected = false,
  onRemove,
  icon,
  className = '',
  disabled,
  ...props
}: ChipProps) {
  const baseStyles =
    'inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-sm font-medium rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-1 select-none';

  const stateStyles = selected
    ? 'bg-brand-700 text-white shadow-sm hover:bg-brand-800'
    : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border border-zinc-200';

  return (
    <button
      type="button"
      disabled={disabled}
      className={`${baseStyles} ${stateStyles} ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          aria-label="Remove item"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 -mr-1 p-0.5 rounded-full hover:bg-black/10 inline-flex items-center justify-center"
        >
          &times;
        </span>
      )}
    </button>
  );
}
