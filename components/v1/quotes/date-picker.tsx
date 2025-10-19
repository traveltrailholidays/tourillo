'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  error?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  error,
  disabled,
  placeholder = 'Select a date',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const selectedDate = value ? new Date(value) : null;

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Fixed date formatting to avoid timezone issues
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onChange(formatDate(selectedDate));
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8 sm:h-9 sm:w-9"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate()) && !isToday;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          disabled={isPast}
          className={`
            h-8 w-8 sm:h-9 sm:w-9 rounded-xs text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center
            ${
              isSelected
                ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow'
                : isPast
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : isToday
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 font-semibold'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:scale-105'
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <label
        htmlFor="date-picker"
        className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 text-left"
      >
        {label}
      </label>

      <div onClick={() => !disabled && setIsOpen(!isOpen)} className="cursor-pointer">
        <input
          id="date-picker"
          type="text"
          value={value ? formatDisplayDate(value) : ''}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-xs focus:outline-none cursor-pointer transition-colors
            bg-foreground dark:text-gray-100
            ${disabled ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-gray-500 focus:border-indigo-500 dark:focus:border-indigo-400'}
            ${error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}
            ${!value ? '' : ''}
          `}
        />
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xs shadow-xl p-3 sm:p-4 w-full min-w-0">
          {/* Header with navigation arrows */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xs transition-colors flex items-center justify-center"
            >
              <FaChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
            </button>

            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>

            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xs transition-colors flex items-center justify-center"
            >
              <FaChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="h-8 sm:h-9 flex items-center justify-center text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                {day.slice(0, 2)}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
