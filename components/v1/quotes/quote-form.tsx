'use client';

import type React from 'react';
import { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import DatePicker from './date-picker';
import { createQuote } from '@/lib/actions/quote-actions';

interface QuoteFormProps {
  onClose?: () => void;
}

const QuoteForm = ({ onClose }: QuoteFormProps) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    destination: '',
    date: '',
    days: '',
    name: '',
    email: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleDateChange = (value: string) => {
    setFormData((prevData) => ({ ...prevData, date: value }));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStep1Valid()) {
      setStep(2);
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep(1);
    if (isLoading) {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      destination: '',
      date: '',
      days: '',
      name: '',
      email: '',
      phone: '',
    });
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep2Valid() || isLoading) return;

    setIsLoading(true);

    try {
      await createQuote({
        destination: formData.destination,
        date: formData.date,
        days: parseInt(formData.days),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      resetForm();
      toast.success('Quote request sent successfully! We will contact you soon.');

      if (onClose) {
        onClose();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit quote request');
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isStep1Valid = () => {
    return Boolean(formData.destination && formData.date && formData.days);
  };

  const isStep2Valid = () => {
    return Boolean(formData.name && formData.email && formData.phone);
  };

  return (
    <div className="w-full max-w-[500px] bg-background rounded-xs">
      <div className="p-6 relative overflow-visible">
        {step === 1 ? (
          <form onSubmit={handleNext} className="space-y-4">
            <div>
              <label htmlFor="destination" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Destination
              </label>
              <input
                type="text"
                id="destination"
                name="destination"
                disabled={isLoading}
                value={formData.destination}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-xs focus:outline-none focus:border-indigo-500 transition-colors bg-foreground dark:text-gray-100 border-gray-300 dark:border-gray-600 ${
                  isLoading
                    ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                    : 'hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                required
                placeholder="Enter your destination"
              />
            </div>

            <DatePicker
              label="Date"
              value={formData.date}
              onChange={handleDateChange}
              disabled={isLoading}
              placeholder="Select date"
            />

            <div>
              <label htmlFor="days" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Number of Days
              </label>
              <input
                type="number"
                id="days"
                name="days"
                disabled={isLoading}
                value={formData.days}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-xs focus:outline-none focus:border-indigo-500 transition-colors bg-foreground dark:text-gray-100 border-gray-300 dark:border-gray-600 
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                  ${
                    isLoading
                      ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                      : 'hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                required
                min="1"
                placeholder="Enter number of days"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className={`py-2 px-5 cursor-pointer bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xs font-medium w-fit flex items-center justify-center gap-3 text-white transition-all duration-300 ${
                  isStep1Valid()
                    ? 'hover:from-indigo-500/90 hover:via-purple-500/90 hover:to-pink-500/90'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                disabled={!isStep1Valid() || isLoading}
              >
                Next
                <FaArrowRight />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                disabled={isLoading}
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-xs focus:outline-none focus:border-indigo-500 transition-colors bg-foreground dark:text-gray-100 border-gray-300 dark:border-gray-600 ${
                  isLoading
                    ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                    : 'hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                required
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                disabled={isLoading}
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-xs focus:outline-none focus:border-indigo-500 transition-colors bg-foreground dark:text-gray-100 border-gray-300 dark:border-gray-600 ${
                  isLoading
                    ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                    : 'hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                required
                placeholder="Enter your email address"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                disabled={isLoading}
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-xs focus:outline-none focus:border-indigo-500 transition-colors bg-foreground dark:text-gray-100 border-gray-300 dark:border-gray-600 ${
                  isLoading
                    ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                    : 'hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                required
                placeholder="Enter your phone number"
              />
            </div>
            <div className="flex justify-between space-x-4 pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="w-full max-w-1/2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-xs hover:bg-gray-400 dark:hover:bg-gray-500 transition duration-300"
              >
                Back
              </button>
              <button
                type="submit"
                className={`w-full max-w-1/2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xs text-white py-2 px-4 transition duration-300 ${
                  isStep2Valid() && !isLoading ? 'hover:shadow-lg' : 'opacity-50 cursor-not-allowed'
                }`}
                disabled={!isStep2Valid() || isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default QuoteForm;
