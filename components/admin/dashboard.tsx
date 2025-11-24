'use client';

import { useState, useTransition } from 'react';
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
import { format, subDays } from 'date-fns';
import type { DashboardStats } from '@/lib/actions/dashboard-actions';
import { getDashboardStats } from '@/lib/actions/dashboard-actions';
import Link from 'next/link';

interface DashboardProps {
  initialStats: DashboardStats;
}

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316'];

const Dashboard = ({ initialStats }: DashboardProps) => {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('all');
  const [isPending, startTransition] = useTransition();

  const handleDateRangeChange = (range: '7d' | '30d' | '90d' | 'all') => {
    setDateRange(range);

    startTransition(async () => {
      let dateFilter;
      const today = new Date();

      switch (range) {
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

  interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: number;
    sublabel?: string;
    color: string;
    link: string;
  }

  const StatCard = ({ icon: Icon, label, value, sublabel, color, link }: StatCardProps) => (
    <Link href={link} className="group">
      <div
        className={`relative bg-linear-to-br from-foreground to-foreground/95 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4 overflow-hidden ${color} group-hover:scale-[1.02]`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-linear-to-br from-transparent via-white to-transparent" />
        </div>

        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                {label}
              </p>
              <ArrowUpRight className="h-3 w-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
            </div>
            <p className="text-4xl font-bold bg-linear-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {value.toLocaleString()}
            </p>
            {sublabel && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">{sublabel}</p>
            )}
          </div>
          <div
            className={`p-4 rounded-2xl ${color.replace('border-l-', 'bg-').replace('-500', '-100')} dark:${color.replace('border-l-', 'bg-').replace('-500', '-900/30')} group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className={`h-7 w-7 ${color.replace('border-l-', 'text-')}`} />
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold t">
            Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {format(new Date(), 'EEEE, MMMM dd, yyyy')}
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="flex gap-1 bg-foreground rounded-xl p-1.5 shadow-lg border border-gray-200 dark:border-gray-700">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => handleDateRangeChange(range)}
              disabled={isPending}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
                dateRange === range
                  ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {range === '7d' && '7 Days'}
              {range === '30d' && '30 Days'}
              {range === '90d' && '90 Days'}
              {range === 'all' && 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-foreground rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Trends</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last 6 months activity</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="packages"
                stroke="#8b5cf6"
                strokeWidth={3}
                name="Packages"
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="blogs"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Blogs"
                dot={{ fill: '#3b82f6', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="contacts"
                stroke="#10b981"
                strokeWidth={3}
                name="Contacts"
                dot={{ fill: '#10b981', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="quotes"
                stroke="#f59e0b"
                strokeWidth={3}
                name="Quotes"
                dot={{ fill: '#f59e0b', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Packages by Category */}
        <div className="bg-foreground rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Packages by Category</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Distribution overview</p>
            </div>
          </div>
          {stats.packagesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.packagesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => {
                    const percent = entry.percent || 0;
                    return `${entry.category}: ${(percent * 100).toFixed(0)}%`;
                  }}
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
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-gray-500">
              <Package className="h-12 w-12 mb-2 opacity-20" />
              <p className="text-sm">No data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Blogs by Category */}
      <div className="bg-foreground rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Blogs by Category</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Content distribution</p>
          </div>
        </div>
        {stats.blogsByCategory.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.blogsByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="category" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center text-gray-500">
            <FileText className="h-12 w-12 mb-2 opacity-20" />
            <p className="text-sm">No data available</p>
          </div>
        )}
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Packages */}
        <div className="bg-foreground rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Packages</h2>
            </div>
            <Link
              href="/admin/package/package-list"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 group"
            >
              View All
              <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentPackages.length > 0 ? (
              stats.recentPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-gray-900 dark:text-white">{pkg.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">{pkg.category}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-purple-600 dark:text-purple-400">
                      ₹{pkg.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {format(new Date(pkg.createdAt), 'MMM dd')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-12">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No packages yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Blogs */}
        <div className="bg-foreground rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Blogs</h2>
            </div>
            <Link
              href="/admin/blog/blog-list"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 group"
            >
              View All
              <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentBlogs.length > 0 ? (
              stats.recentBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-gray-900 dark:text-white">{blog.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">{blog.category}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    {blog.published ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(blog.createdAt), 'MMM dd')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-12">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No blogs yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="bg-foreground rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Contacts</h2>
            </div>
            <Link
              href="/admin/contact"
              className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1 group"
            >
              View All
              <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentContacts.length > 0 ? (
              stats.recentContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-gray-900 dark:text-white">{contact.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{contact.subject}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${contact.isRead ? 'bg-gray-400' : 'bg-green-500 animate-pulse'}`}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(contact.createdAt), 'MMM dd')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-12">
                <Mail className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No contacts yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Quote Requests */}
        <div className="bg-foreground rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <MessageSquare className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Quote Requests</h2>
            </div>
            <Link
              href="/admin/quotes/quotes-list"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 group"
            >
              View All
              <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentQuotes.length > 0 ? (
              stats.recentQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-gray-900 dark:text-white">{quote.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {quote.destination} • {quote.days} days
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${quote.isRead ? 'bg-gray-400' : 'bg-orange-500 animate-pulse'}`}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(quote.createdAt), 'MMM dd')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No quote requests yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
