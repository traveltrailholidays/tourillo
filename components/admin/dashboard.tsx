'use client';

import { useState, useTransition, useMemo } from 'react';
import {
  Package,
  FileText,
  Mail,
  MessageSquare,
  TrendingUp,
  Eye,
  EyeOff,
  ArrowUpRight,
  Calendar,
  X,
  MapPin,
  Users,
  Building2,
  Receipt,
  Hotel,
  DollarSign,
  Target,
  Award,
  BarChart3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import type { DashboardStats } from '@/lib/actions/dashboard-actions';
import { getDashboardStats } from '@/lib/actions/dashboard-actions';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DashboardProps {
  initialStats: DashboardStats;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316'];

const Dashboard = ({ initialStats }: DashboardProps) => {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | '90d' | 'all' | 'custom'>('today');
  const [isPending, startTransition] = useTransition();
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Calculate the dynamic date range text
  const dateRangeText = useMemo(() => {
    const today = new Date();

    switch (dateRange) {
      case 'today':
        return format(today, 'EEEE, MMMM dd, yyyy');
      case '7d':
        return `${format(subDays(today, 7), 'MMM dd')} - ${format(today, 'MMM dd, yyyy')}`;
      case '30d':
        return `${format(subDays(today, 30), 'MMM dd')} - ${format(today, 'MMM dd, yyyy')}`;
      case '90d':
        return `${format(subDays(today, 90), 'MMM dd')} - ${format(today, 'MMM dd, yyyy')}`;
      case 'custom':
        if (customStartDate && customEndDate) {
          return `${format(new Date(customStartDate), 'MMM dd, yyyy')} - ${format(new Date(customEndDate), 'MMM dd, yyyy')}`;
        }
        return 'Custom Range';
      case 'all':
        return 'All Time Data';
      default:
        return format(today, 'EEEE, MMMM dd, yyyy');
    }
  }, [dateRange, customStartDate, customEndDate]);

  const handleDateRangeChange = (range: 'today' | '7d' | '30d' | '90d' | 'all' | 'custom') => {
    if (range === 'custom') {
      setShowCustomDatePicker(true);
      return;
    }

    setDateRange(range);
    setShowCustomDatePicker(false);

    startTransition(async () => {
      let dateFilter;
      const today = new Date();

      switch (range) {
        case 'today':
          dateFilter = { from: startOfDay(today), to: endOfDay(today) };
          break;
        case '7d':
          dateFilter = { from: subDays(today, 7), to: today };
          break;
        case '30d':
          dateFilter = { from: subDays(today, 30), to: today };
          break;
        case '90d':
          dateFilter = { from: subDays(today, 90), to: today };
          break;
        default:
          dateFilter = undefined;
      }

      const newStats = await getDashboardStats(dateFilter);
      setStats(newStats);
    });
  };

  const handleCustomDateApply = () => {
    if (!customStartDate || !customEndDate) {
      alert('Please select both start and end dates');
      return;
    }

    const startDate = new Date(customStartDate);
    const endDate = new Date(customEndDate);

    if (startDate > endDate) {
      alert('Start date must be before end date');
      return;
    }

    setDateRange('custom');
    setShowCustomDatePicker(false);

    startTransition(async () => {
      const dateFilter = {
        from: startOfDay(startDate),
        to: endOfDay(endDate),
      };

      const newStats = await getDashboardStats(dateFilter);
      setStats(newStats);
    });
  };

  const handleCustomDateClear = () => {
    setCustomStartDate('');
    setCustomEndDate('');
    setShowCustomDatePicker(false);
    if (dateRange === 'custom') {
      handleDateRangeChange('today');
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderCustomLabel = (entry: any) => {
    const percent = entry.percent || 0;
    if (percent < 0.05) return '';
    return `${(percent * 100).toFixed(0)}%`;
  };

  interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: number;
    sublabel?: string;
    color: string;
    link: string;
  }

  const StatCard = ({ icon: Icon, label, value, sublabel, color, link }: StatCardProps) => (
    <Link href={link} className="group block">
      <div
        className={`relative bg-foreground rounded shadow-sm hover:shadow-md transition-all duration-300 p-5 border-l-4 overflow-hidden ${color} h-full`}
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-linear-to-br from-transparent via-white to-transparent" />
        </div>

        <div className="relative">
          {/* Header with icon and arrow */}
          <div className="flex items-start justify-between mb-4">
            <div
              className={`p-3 rounded ${color.replace('border-l-', 'bg-').replace('-500', '-100')} dark:${color.replace('border-l-', 'bg-').replace('-500', '-900/30')} group-hover:scale-105 transition-transform duration-300`}
            >
              <Icon className={`h-6 w-6 ${color.replace('border-l-', 'text-')}`} />
            </div>
            <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
          </div>

          {/* Label */}
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{label}</p>

          {/* Value */}
          <p className="text-3xl font-bold bg-linear-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
            {value.toLocaleString()}
          </p>

          {/* Sublabel */}
          {sublabel && (
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{sublabel}</p>
          )}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-[2000px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {dateRangeText}
            </p>
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-col gap-2 w-full lg:w-auto">
            <div className="flex gap-2 bg-foreground rounded p-1.5 border border-gray-200 dark:border-gray-700 shadow-sm flex-wrap">
              {(['today', '7d', '30d', '90d', 'all', 'custom'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => handleDateRangeChange(range)}
                  disabled={isPending}
                  className={`px-3 py-2 rounded text-xs font-bold transition-all duration-200 disabled:opacity-50 whitespace-nowrap cursor-pointer ${
                    dateRange === range
                      ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {range === 'today' && 'Today'}
                  {range === '7d' && '7 Days'}
                  {range === '30d' && '30 Days'}
                  {range === '90d' && '90 Days'}
                  {range === 'all' && 'All Time'}
                  {range === 'custom' && 'Custom'}
                </button>
              ))}
            </div>

            {dateRange === 'custom' && customStartDate && customEndDate && (
              <div className="flex justify-end">
                <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded text-xs font-semibold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {format(new Date(customStartDate), 'MMM dd')} - {format(new Date(customEndDate), 'MMM dd, yyyy')}
                  </span>
                  <button
                    onClick={handleCustomDateClear}
                    className="ml-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Custom Date Picker Modal */}
        {showCustomDatePicker && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-foreground rounded shadow-2xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Select Date Range</h3>
                <button
                  onClick={() => setShowCustomDatePicker(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-background"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-background"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowCustomDatePicker(false)}
                    className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomDateApply}
                    disabled={isPending}
                    className="flex-1 px-4 py-2.5 text-sm bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold rounded hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 shadow-md"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Stats Grid - Existing + New Voucher Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            icon={MapPin}
            label="Total Itineraries"
            value={stats.totalItineraries}
            sublabel={`TRL: ${stats.tourilloItineraries} • TTH: ${stats.tthItineraries}`}
            color="border-l-pink-500"
            link="/admin/itinerary/all-itinerary"
          />
          <StatCard
            icon={Package}
            label="Total Packages"
            value={stats.totalPackages}
            color="border-l-purple-500"
            link="/admin/package/package-list"
          />
          <StatCard
            icon={FileText}
            label="Total Blogs"
            value={stats.totalBlogs}
            sublabel={`${stats.publishedBlogs} published • ${stats.featuredBlogs} featured`}
            color="border-l-blue-500"
            link="/admin/blog/blog-list"
          />
          <StatCard
            icon={Mail}
            label="Contacts"
            value={stats.totalContacts}
            sublabel={`${stats.unreadContacts} unread messages`}
            color="border-l-green-500"
            link="/admin/contact"
          />
          <StatCard
            icon={MessageSquare}
            label="Quote Requests"
            value={stats.totalQuotes}
            sublabel={`${stats.unreadQuotes} pending quotes`}
            color="border-l-orange-500"
            link="/admin/quotes/quotes-list"
          />
          {/* ✅ NEW: Voucher Cards */}
          <StatCard
            icon={Receipt}
            label="Total Vouchers"
            value={stats.totalVouchers}
            sublabel={`TRL: ${stats.tourilloVouchers} • TTH: ${stats.tthVouchers}`}
            color="border-l-cyan-500"
            link="/admin/voucher/voucher-list"
          />
          <StatCard
            icon={Hotel}
            label="Total Nights"
            value={stats.totalVoucherNights}
            sublabel={`${stats.vouchersWithHotels} with hotels • ${stats.vouchersWithoutHotels} without`}
            color="border-l-indigo-500"
            link="/admin/voucher/voucher-list"
          />
          <StatCard
            icon={Users}
            label="Total Guests"
            value={stats.totalVoucherGuests}
            sublabel="Across all vouchers"
            color="border-l-rose-500"
            link="/admin/voucher/voucher-list"
          />
        </div>

        {/* ✅ NEW: Business Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded p-5 border border-purple-200 dark:border-purple-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-purple-200 dark:bg-purple-800 rounded">
                <DollarSign className="h-5 w-5 text-purple-700 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-purple-900 dark:text-purple-100 uppercase">Total Revenue</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1">
              {formatPrice(stats.businessMetrics.totalItineraryRevenue)}
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
              From {stats.totalItineraries} itineraries
            </p>
          </div>

          <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded p-5 border border-blue-200 dark:border-blue-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-blue-200 dark:bg-blue-800 rounded">
                <Target className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-900 dark:text-blue-100 uppercase">Avg Package Price</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
              {formatPrice(stats.businessMetrics.averageItineraryPrice)}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Average per itinerary</p>
          </div>

          <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded p-5 border border-green-200 dark:border-green-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-green-200 dark:bg-green-800 rounded">
                <TrendingUp className="h-5 w-5 text-green-700 dark:text-green-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-green-900 dark:text-green-100 uppercase">Conversion Rate</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">
              {stats.businessMetrics.conversionRate.toFixed(1)}%
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 font-medium">Itineraries with vouchers</p>
          </div>

          <div className="bg-linear-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded p-5 border border-amber-200 dark:border-amber-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-amber-200 dark:bg-amber-800 rounded">
                <BarChart3 className="h-5 w-5 text-amber-700 dark:text-amber-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-100 uppercase">Avg Vouchers</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-1">
              {stats.businessMetrics.averageVouchersPerItinerary.toFixed(2)}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Per itinerary</p>
          </div>
        </div>

        {/* ✅ Monthly Trends Chart - Updated with Vouchers */}
        <div className="bg-foreground rounded p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Trends</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Last 6 months activity</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={stats.monthlyStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" opacity={0.5} />
              <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px', fontWeight: 500 }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
              <Line
                type="monotone"
                dataKey="itineraries"
                stroke="#ec4899"
                strokeWidth={2.5}
                name="Itineraries"
                dot={{ fill: '#ec4899', r: 4 }}
                activeDot={{ r: 6 }}
              />
              {/* ✅ NEW: Vouchers line */}
              <Line
                type="monotone"
                dataKey="vouchers"
                stroke="#06b6d4"
                strokeWidth={2.5}
                name="Vouchers"
                dot={{ fill: '#06b6d4', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="packages"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                name="Packages"
                dot={{ fill: '#8b5cf6', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="blogs"
                stroke="#3b82f6"
                strokeWidth={2.5}
                name="Blogs"
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="contacts"
                stroke="#10b981"
                strokeWidth={2.5}
                name="Contacts"
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="quotes"
                stroke="#f59e0b"
                strokeWidth={2.5}
                name="Quotes"
                dot={{ fill: '#f59e0b', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ Tabs for Organized Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
            <TabsTrigger value="advisors">Advisors</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Existing Charts */}
          <TabsContent value="overview" className="space-y-5 mt-5">
            {/* Distribution Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Itineraries by Company */}
              <div className="bg-foreground rounded p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-pink-100 dark:bg-pink-900/30 rounded">
                    <Building2 className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">By Company</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Company distribution</p>
                  </div>
                </div>
                {stats.itinerariesByCompany.length > 0 ? (
                  <div className="h-[280px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.itinerariesByCompany}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomLabel}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="company"
                        >
                          <Cell fill="#8b5cf6" />
                          <Cell fill="#3b82f6" />
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--foreground))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[280px] flex flex-col items-center justify-center text-gray-400">
                    <Building2 className="h-14 w-14 mb-2 opacity-20" />
                    <p className="text-xs font-semibold">No data available</p>
                  </div>
                )}
              </div>

              {/* Packages by Category */}
              <div className="bg-foreground rounded p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded">
                    <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Packages</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">By category</p>
                  </div>
                </div>
                {stats.packagesByCategory.length > 0 ? (
                  <div className="h-[280px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.packagesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomLabel}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="category"
                        >
                          {stats.packagesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--foreground))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[280px] flex flex-col items-center justify-center text-gray-400">
                    <Package className="h-14 w-14 mb-2 opacity-20" />
                    <p className="text-xs font-semibold">No data available</p>
                  </div>
                )}
              </div>

              {/* Blogs by Category */}
              <div className="bg-foreground rounded p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Blogs</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Content distribution</p>
                  </div>
                </div>
                {stats.blogsByCategory.length > 0 ? (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.blogsByCategory} margin={{ top: 15, right: 10, left: -10, bottom: 35 }}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                          className="dark:stroke-gray-700"
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="category"
                          stroke="#6b7280"
                          style={{ fontSize: '10px', fontWeight: 500 }}
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--foreground))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[280px] flex flex-col items-center justify-center text-gray-400">
                    <FileText className="h-14 w-14 mb-2 opacity-20" />
                    <p className="text-xs font-semibold">No data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Itineraries by Trip Advisor */}
            <div className="bg-foreground rounded p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-pink-100 dark:bg-pink-900/30 rounded">
                  <Users className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Itineraries by Trip Advisor</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Top 10 advisors performance</p>
                </div>
              </div>
              {stats.itinerariesByAdvisor.length > 0 ? (
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart
                    data={stats.itinerariesByAdvisor}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      className="dark:stroke-gray-700"
                      opacity={0.5}
                    />
                    <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px', fontWeight: 500 }} />
                    <YAxis
                      dataKey="advisor"
                      type="category"
                      stroke="#6b7280"
                      style={{ fontSize: '12px', fontWeight: 500 }}
                      width={160}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--foreground))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      cursor={{ fill: 'rgba(236, 72, 153, 0.1)' }}
                    />
                    <Bar dataKey="count" fill="#ec4899" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[380px] flex flex-col items-center justify-center text-gray-400">
                  <Users className="h-14 w-14 mb-2 opacity-20" />
                  <p className="text-xs font-semibold">No data available</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ✅ NEW: Vouchers Tab */}
          <TabsContent value="vouchers" className="space-y-5 mt-5">
            {/* Vouchers by Company */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-foreground rounded p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-cyan-100 dark:bg-cyan-900/30 rounded">
                    <Receipt className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Vouchers by Company</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Distribution</p>
                  </div>
                </div>
                {stats.vouchersByCompany.length > 0 ? (
                  <div className="h-[280px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.vouchersByCompany}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomLabel}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="company"
                        >
                          <Cell fill="#8b5cf6" />
                          <Cell fill="#06b6d4" />
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--foreground))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[280px] flex flex-col items-center justify-center text-gray-400">
                    <Receipt className="h-14 w-14 mb-2 opacity-20" />
                    <p className="text-xs font-semibold">No data available</p>
                  </div>
                )}
              </div>

              {/* Revenue Split */}
              <div className="bg-foreground rounded p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Revenue Split</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">By company</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-purple-900 dark:text-purple-100">Tourillo (TRL)</span>
                      <span className="text-xs text-purple-700 dark:text-purple-300 font-semibold">
                        {(
                          (stats.businessMetrics.tourilloRevenue / stats.businessMetrics.totalItineraryRevenue) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-2">
                      {formatPrice(stats.businessMetrics.tourilloRevenue)}
                    </div>
                    <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(stats.businessMetrics.tourilloRevenue / stats.businessMetrics.totalItineraryRevenue) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-cyan-900 dark:text-cyan-100">
                        Travel Trail Holidays (TTH)
                      </span>
                      <span className="text-xs text-cyan-700 dark:text-cyan-300 font-semibold">
                        {(
                          (stats.businessMetrics.tthRevenue / stats.businessMetrics.totalItineraryRevenue) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className="text-xl font-bold text-cyan-900 dark:text-cyan-100 mb-2">
                      {formatPrice(stats.businessMetrics.tthRevenue)}
                    </div>
                    <div className="w-full bg-cyan-200 dark:bg-cyan-800 rounded-full h-2">
                      <div
                        className="bg-cyan-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(stats.businessMetrics.tthRevenue / stats.businessMetrics.totalItineraryRevenue) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Itineraries by Vouchers */}
            <div className="bg-foreground rounded p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                  <Award className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Top Itineraries by Vouchers</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Highest voucher count</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">Itinerary ID</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">Client</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">Company</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">Vouchers</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">Nights</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">Guests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topItinerariesByVouchers.length > 0 ? (
                      stats.topItinerariesByVouchers.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="px-4 py-3 font-mono text-xs font-bold text-pink-600">{item.travelId}</td>
                          <td className="px-4 py-3">{item.clientName}</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                item.company === 'TRL'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                  : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
                              }`}
                            >
                              {item.company}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-purple-600">{item.voucherCount}</td>
                          <td className="px-4 py-3 text-center">{item.totalNights}</td>
                          <td className="px-4 py-3 text-center">{item.totalGuests}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                          <Award className="h-12 w-12 mx-auto mb-2 opacity-20" />
                          <p className="text-xs font-semibold">No data available</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Vouchers */}
            <div className="bg-foreground rounded p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-100 dark:bg-cyan-900/30 rounded">
                    <Receipt className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Vouchers</h3>
                </div>
                <Link
                  href="/admin/voucher/voucher-list"
                  className="text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-500 dark:hover:text-cyan-400 font-bold flex items-center gap-1.5 group"
                >
                  View All
                  <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
              <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
                {stats.recentVouchers.length > 0 ? (
                  stats.recentVouchers.map((voucher) => (
                    <div
                      key={voucher.id}
                      className="p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-500">
                              {voucher.voucherId}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded font-bold ${
                                voucher.company === 'TRL'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                  : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
                              }`}
                            >
                              {voucher.company}
                            </span>
                          </div>
                          <p className="font-bold truncate text-gray-900 dark:text-white text-sm mb-1">
                            {voucher.clientName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                            {voucher.packageTitle}
                          </p>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                            {voucher.totalNights} nights • {voucher.adultNo + voucher.childrenNo} guests
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {format(new Date(voucher.createdAt), 'MMM dd')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-14">
                    <Receipt className="h-14 w-14 mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-semibold">No vouchers yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Itinerary-Voucher Relationship */}
            <div className="bg-foreground rounded p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded">
                  <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Itinerary-Voucher Relationship</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Coverage analysis</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">Itinerary ID</th>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">Client</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">Company</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">Has Voucher</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">Vouchers</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">
                        Itinerary Nights
                      </th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">
                        Voucher Nights
                      </th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">Coverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.itineraryVoucherRelation.length > 0 ? (
                      stats.itineraryVoucherRelation.map((item) => (
                        <tr
                          key={item.itineraryId}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="px-4 py-3 font-mono text-xs font-bold text-pink-600">{item.travelId}</td>
                          <td className="px-4 py-3">{item.clientName}</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                item.company === 'TRL'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                  : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
                              }`}
                            >
                              {item.company}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {item.hasVoucher ? (
                              <span className="text-green-600 font-bold">✓</span>
                            ) : (
                              <span className="text-red-600 font-bold">✗</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold">{item.voucherCount}</td>
                          <td className="px-4 py-3 text-center">{item.totalItineraryNights}</td>
                          <td className="px-4 py-3 text-center">{item.totalVoucherNights}</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                item.totalVoucherNights >= item.totalItineraryNights
                                  ? 'bg-green-100 text-green-800'
                                  : item.totalVoucherNights > 0
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {item.totalItineraryNights > 0
                                ? `${((item.totalVoucherNights / item.totalItineraryNights) * 100).toFixed(0)}%`
                                : 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                          <p className="text-xs font-semibold">No data available</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ✅ NEW: Advisors Tab */}
          <TabsContent value="advisors" className="space-y-5 mt-5">
            <div className="bg-foreground rounded p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded">
                  <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Trip Advisor Performance</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Top performers</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-700 dark:text-gray-300">Advisor Name</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">Itineraries</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">Vouchers</th>
                      <th className="px-4 py-3 text-right font-bold text-gray-700 dark:text-gray-300">Total Revenue</th>
                      <th className="px-4 py-3 text-right font-bold text-gray-700 dark:text-gray-300">Avg Price</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-700 dark:text-gray-300">Conv. Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.advisorPerformance.length > 0 ? (
                      stats.advisorPerformance.map((advisor, index) => {
                        const convRate =
                          advisor.itineraryCount > 0
                            ? ((advisor.voucherCount / advisor.itineraryCount) * 100).toFixed(1)
                            : '0.0';
                        return (
                          <tr
                            key={index}
                            className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                              index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                            }`}
                          >
                            <td className="px-4 py-3 font-semibold">
                              <div className="flex items-center gap-2">
                                {index === 0 && <Award className="h-4 w-4 text-yellow-600" />}
                                {advisor.advisorName}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-purple-600">
                              {advisor.itineraryCount}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-cyan-600">{advisor.voucherCount}</td>
                            <td className="px-4 py-3 text-right font-bold text-green-600">
                              {formatPrice(advisor.totalRevenue)}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-600">{formatPrice(advisor.averagePrice)}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-bold">
                                {convRate}%
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                          <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                          <p className="text-xs font-semibold">No data available</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Activity Tables - Existing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent Itineraries */}
          <div className="bg-foreground rounded p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-pink-100 dark:bg-pink-900/30 rounded">
                  <MapPin className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Itineraries</h3>
              </div>
              <Link
                href="/admin/itinerary/all-itinerary"
                className="text-xs text-pink-600 hover:text-pink-700 dark:text-pink-500 dark:hover:text-pink-400 font-bold flex items-center gap-1.5 group"
              >
                View All
                <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
            <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
              {stats.recentItineraries.length > 0 ? (
                stats.recentItineraries.map((itinerary) => (
                  <div
                    key={itinerary.id}
                    className="p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono text-xs font-bold text-pink-600 dark:text-pink-500">
                            {itinerary.travelId}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-bold ${
                              itinerary.company === 'TOURILLO'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}
                          >
                            {itinerary.company === 'TOURILLO' ? 'TRL' : 'TTH'}
                          </span>
                        </div>
                        <p className="font-bold truncate text-gray-900 dark:text-white text-sm mb-1">
                          {itinerary.clientName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
                          {itinerary.packageTitle}
                        </p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                          Advisor: {itinerary.tripAdvisorName}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-pink-600 dark:text-pink-500 text-sm mb-1">
                          {formatPrice(itinerary.quotePrice)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {format(new Date(itinerary.createdAt), 'MMM dd')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-14">
                  <MapPin className="h-14 w-14 mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-semibold">No itineraries yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Packages */}
          <div className="bg-foreground rounded p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded">
                  <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Packages</h3>
              </div>
              <Link
                href="/admin/package/package-list"
                className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-500 dark:hover:text-purple-400 font-bold flex items-center gap-1.5 group"
              >
                View All
                <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
            <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
              {stats.recentPackages.length > 0 ? (
                stats.recentPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate text-gray-900 dark:text-white text-sm mb-1">{pkg.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium">
                          {pkg.category}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-purple-600 dark:text-purple-400 text-sm mb-1">
                          ₹{pkg.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {format(new Date(pkg.createdAt), 'MMM dd')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-14">
                  <Package className="h-14 w-14 mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-semibold">No packages yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Blogs */}
          <div className="bg-foreground rounded p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Blogs</h3>
              </div>
              <Link
                href="/admin/blog/blog-list"
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 font-bold flex items-center gap-1.5 group"
              >
                View All
                <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
            <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
              {stats.recentBlogs.length > 0 ? (
                stats.recentBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate text-gray-900 dark:text-white text-sm mb-1">{blog.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium">
                          {blog.category}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        {blog.published ? (
                          <Eye className="h-4 w-4 text-green-600 dark:text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {format(new Date(blog.createdAt), 'MMM dd')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-14">
                  <FileText className="h-14 w-14 mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-semibold">No blogs yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Contacts */}
          <div className="bg-foreground rounded p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded">
                  <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Contacts</h3>
              </div>
              <Link
                href="/admin/contact"
                className="text-xs text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 font-bold flex items-center gap-1.5 group"
              >
                View All
                <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
            <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
              {stats.recentContacts.length > 0 ? (
                stats.recentContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate text-gray-900 dark:text-white text-sm mb-1">{contact.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">
                          {contact.subject}
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div
                          className={`w-2 h-2 rounded-full ${contact.isRead ? 'bg-gray-400' : 'bg-green-500 animate-pulse'}`}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          {format(new Date(contact.createdAt), 'MMM dd')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-14">
                  <Mail className="h-14 w-14 mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-semibold">No contacts yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Quote Requests - Full Width */}
        <div className="bg-foreground rounded p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 rounded">
                <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Quote Requests</h3>
            </div>
            <Link
              href="/admin/quotes/quotes-list"
              className="text-xs text-orange-600 hover:text-orange-700 dark:text-orange-500 dark:hover:text-orange-400 font-bold flex items-center gap-1.5 group"
            >
              View All
              <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
            {stats.recentQuotes.length > 0 ? (
              stats.recentQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="font-bold truncate text-gray-900 dark:text-white text-sm flex-1">{quote.name}</p>
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${quote.isRead ? 'bg-gray-400' : 'bg-orange-500 animate-pulse'}`}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">{quote.destination}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{quote.days} days</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {format(new Date(quote.createdAt), 'MMM dd')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-400 py-14">
                <MessageSquare className="h-14 w-14 mx-auto mb-2 opacity-20" />
                <p className="text-xs font-semibold">No quote requests yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
