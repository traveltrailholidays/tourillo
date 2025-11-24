'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

interface InputBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: boolean;
}

const InputBox: React.FC<InputBoxProps> = ({
  label,
  error,
  className = '',
  value,
  onChange,
  type = 'text',
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Track value changes for controlled inputs
  useEffect(() => {
    // Check if this is a controlled component
    if (value !== undefined) {
      // Update hasContent based on whether value has content
      setHasContent(value !== '' && value !== null);
    }
  }, [value]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (rest.onFocus) rest.onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (rest.onBlur) rest.onBlur(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // For uncontrolled components, update hasContent directly
    if (value === undefined) {
      setHasContent(e.target.value.length > 0);
    }

    // Call the parent's onChange handler
    if (onChange) onChange(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const showGradient = isFocused || hasContent;
  const isPasswordField = type === 'password';
  const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="relative w-full cursor-text">
      {/* Always use the same size container to prevent layout shifts */}
      <div className="p-[2px] transition-all duration-300 ease-in-out">
        {/* Gradient overlay that appears on focus/content */}
        <div
          className={clsx(
            'absolute inset-0 transition-opacity duration-300 ease-in-out',
            'bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500',
            showGradient ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Default border that's always visible (more visible when gradient is opacity-0) */}
        <div
          className={clsx(
            'absolute inset-0 transition-opacity duration-300 ease-in-out border',
            error ? 'border-red-500' : 'border-border'
          )}
          style={{ opacity: showGradient ? 0 : 1 }}
        />

        {/* Input container */}
        <div className="relative bg-foreground">
          <input
            id={label}
            type={inputType}
            placeholder=" "
            className={clsx(
              'w-full bg-transparent text-lg px-3 pt-5 pb-2 text-theme-text',
              'focus:outline-none border-none transition-all duration-200',
              isPasswordField && 'pr-12', // Add right padding for password toggle button
              className
            )}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...rest}
          />

          {/* Password toggle button */}
          {isPasswordField && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 p-1 text-theme-text/70 hover:text-theme-text transition-colors duration-200 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                // Eye slash icon (hide password)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" x2="22" y1="2" y2="22" />
                </svg>
              ) : (
                // Eye icon (show password)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Label wrapper with enhanced transitions */}
      <div
        className={clsx(
          'absolute left-3 z-10 transition-all duration-300 ease-in-out transform select-none',
          isFocused || hasContent ? 'top-0 -translate-y-1/2' : 'top-1/2 -translate-y-1/2'
        )}
      >
        {/* Solid background behind the label */}
        <div className="bg-foreground px-1">
          <label
            htmlFor={label}
            className={clsx(
              'transition-all duration-300 ease-in-out cursor-text',
              isFocused || hasContent
                ? 'font-semibold text-base bg-clip-text text-transparent bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500'
                : error
                  ? 'text-lg text-red-500 font-medium'
                  : 'text-lg text-theme-text/70'
            )}
          >
            {label}
          </label>
        </div>
      </div>
    </div>
  );
};

export default InputBox;
