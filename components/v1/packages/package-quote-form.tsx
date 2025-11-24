'use client';

import { useState } from 'react';
import { createQuote } from '@/lib/actions/quote-actions';
import toast from 'react-hot-toast';
import { User, Mail, Phone } from 'lucide-react';

interface PackageQuoteFormProps {
  packageTitle: string; // This will be used as destination
  price: number;
  discount: number;
  days: number;
}

const PackageQuoteForm: React.FC<PackageQuoteFormProps> = ({ packageTitle, price, discount, days }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    name: '',
    email: '',
    phone: '',
  });

  const discountedPrice = discount > 0 ? Math.round(price - price * (discount / 100)) : price;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use packageTitle as destination
      await createQuote({
        destination: packageTitle,
        date: formData.date,
        days: days,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      toast.success('Quote request sent successfully! We will contact you soon.');

      // Reset form
      setFormData({
        date: '',
        name: '',
        email: '',
        phone: '',
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit quote request');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return Boolean(formData.date && formData.name && formData.email && formData.phone);
  };

  return (
    <div className="rounded overflow-hidden shadow-xl">
      {/* Price Header */}
      <div className="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-4">
        <div className="flex items-baseline gap-2">
          <span className="text-white text-4xl font-bold">{formatPrice(discountedPrice)}</span>
          <span className="text-white/80 text-sm">/ per person</span>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 bg-foreground">
        <h3 className="text-2xl font-bold mb-6">Get Quote</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email address"
              required
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Phone Input */}
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your Phone number"
              required
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Date Input */}
          <div>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid() || isLoading}
            className="w-full bg-linear-to-r from-indigo-500 hover:from-indigo-500/90 via-purple-500 hover:via-purple-500/90 to-pink-500 hover:to-pink-500/90 text-white py-3 rounded font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PackageQuoteForm;
