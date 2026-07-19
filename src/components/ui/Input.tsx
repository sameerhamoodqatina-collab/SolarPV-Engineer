'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      iconLeft,
      iconRight,
      required,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            {label}
            {required && <span className="text-solar-red ms-1">*</span>}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-text-muted pointer-events-none">
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            required={required}
            className={`
              w-full h-10 px-3 text-sm rounded-xl
              bg-surface border transition-all duration-150
              placeholder:text-text-muted
              focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring
              disabled:opacity-50 disabled:cursor-not-allowed
              ${hasError ? 'border-solar-red focus:ring-solar-red/30 focus:border-solar-red' : 'border-border hover:border-border-hover'}
              ${iconLeft ? 'ps-10' : ''}
              ${iconRight ? 'pe-10' : ''}
              ${className}
            `}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />
          {iconRight && (
            <span className="absolute inset-y-0 end-0 flex items-center pe-3 text-text-muted">
              {iconRight}
            </span>
          )}
        </div>
        {hasError && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-solar-red">
            {error}
          </p>
        )}
        {!hasError && helperText && (
          <p id={`${inputId}-helper`} className="mt-1 text-xs text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, type InputProps };
