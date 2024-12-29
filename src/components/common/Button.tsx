import React, { forwardRef } from 'react';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useAppStore } from '../../store/useAppStore';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  tooltip,
  tooltipPosition = 'top',
  className = '',
  onClick,
  ...props
}, ref) => {
  const { reducedMotion } = useAppStore();
  
  const { accessibilityProps } = useAccessibility({
    role: 'button',
    ariaLabel: props['aria-label'],
    focusable: !disabled,
    keyboardShortcuts: {
      'Enter': () => !disabled && !loading && onClick?.(null as any),
      ' ': () => !disabled && !loading && onClick?.(null as any),
    },
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  const baseClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    loading ? 'btn-loading' : '',
    disabled ? 'btn-disabled' : '',
    fullWidth ? 'btn-full-width' : '',
    reducedMotion ? 'reduced-motion' : '',
    className,
  ].filter(Boolean).join(' ');

  const spinnerSize = {
    small: 16,
    medium: 20,
    large: 24,
  }[size];

  const LoadingSpinner = () => (
    <svg
      className="btn-spinner"
      width={spinnerSize}
      height={spinnerSize}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="btn-spinner-circle"
        cx="12"
        cy="12"
        r="10"
        fill="none"
        strokeWidth="3"
      />
    </svg>
  );

  const content = (
    <>
      {loading && <LoadingSpinner />}
      {icon && iconPosition === 'left' && <span className="btn-icon">{icon}</span>}
      {children && <span className="btn-text">{children}</span>}
      {icon && iconPosition === 'right' && <span className="btn-icon">{icon}</span>}
    </>
  );

  return (
    <button
      {...props}
      {...accessibilityProps}
      ref={ref}
      className={baseClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      data-tooltip={tooltip}
      data-tooltip-position={tooltipPosition}
    >
      {content}
    </button>
  );
});
