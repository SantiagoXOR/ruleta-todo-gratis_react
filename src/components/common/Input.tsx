import React, { forwardRef, useState } from 'react';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useAppStore } from '../../store/useAppStore';
import './Input.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled' | 'standard';
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  size = 'medium',
  variant = 'outlined',
  fullWidth = false,
  startIcon,
  endIcon,
  loading = false,
  showCharCount = false,
  maxLength,
  onClear,
  disabled = false,
  required = false,
  id,
  className = '',
  value = '',
  onChange,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const { reducedMotion } = useAppStore();

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const { accessibilityProps, announceToScreenReader } = useAccessibility({
    role: 'textbox',
    ariaLabel: label,
    ariaDescribedBy: [hint && hintId, error && errorId].filter(Boolean).join(' '),
    focusable: !disabled,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
    if (showCharCount && maxLength) {
      const remaining = maxLength - e.target.value.length;
      if (remaining <= 10) {
        announceToScreenReader(`${remaining} caracteres restantes`);
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    setTouched(true);
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  const baseClasses = [
    'input-container',
    `input-${variant}`,
    `input-${size}`,
    focused ? 'input-focused' : '',
    error ? 'input-error' : '',
    disabled ? 'input-disabled' : '',
    fullWidth ? 'input-full-width' : '',
    reducedMotion ? 'reduced-motion' : '',
    className,
  ].filter(Boolean).join(' ');

  const showError = error && (touched || focused);
  const showHint = hint && !showError;
  const characterCount = typeof value === 'string' ? value.length : 0;
  const showClearButton = value && onClear && !disabled;

  return (
    <div className={baseClasses}>
      {label && (
        <label
          htmlFor={inputId}
          className="input-label"
        >
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}

      <div className="input-wrapper">
        {startIcon && (
          <div className="input-icon input-icon-start">
            {startIcon}
          </div>
        )}

        <input
          {...props}
          {...accessibilityProps}
          ref={ref}
          id={inputId}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled || loading}
          required={required}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-errormessage={errorId}
          className="input-field"
        />

        {(endIcon || showClearButton || loading) && (
          <div className="input-icon input-icon-end">
            {loading ? (
              <div className="input-spinner" />
            ) : (
              <>
                {showClearButton && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="input-clear-button"
                    aria-label="Limpiar entrada"
                  >
                    ×
                  </button>
                )}
                {endIcon}
              </>
            )}
          </div>
        )}
      </div>

      <div className="input-footer">
        {showError && (
          <div id={errorId} className="input-error-text" role="alert">
            {error}
          </div>
        )}

        {showHint && (
          <div id={hintId} className="input-hint-text">
            {hint}
          </div>
        )}

        {showCharCount && maxLength && (
          <div className="input-char-count">
            {characterCount}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
});
