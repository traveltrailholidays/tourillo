'use server';

import { prisma } from '@/lib/prisma';

export interface DashboardStats {
  totalPackages: number;
  totalBlogs: number;
  totalContacts: number;
  totalQuotes: number;
  unreadContacts: number;
  unreadQuotes: number;
  publishedBlogs: number;
  featuredBlogs: number;
  recentPackages: Array<{
    id: string;
    title: string;
    category: string;
    price: number;
    createdAt: string;
  }>;
  recentBlogs: Array<{
    id: string;
    title: string;
    category: string;
    published: boolean;
    createdAt: string;
  }>;
  recentContacts: Array<{
    id: string;
    name: string;
    email: string;
    subject: string;
    isRead: boolean;
    createdAt: string;
  }>;
  recentQuotes: Array<{
    id: string;
    name: string;
    destination: string;
    days: number;
    isRead: boolean;
    createdAt: string;
  }>;
  packagesByCategory: Array<{
    category: string;
    count: number;
  }>;
  blogsByCategory: Array<{
    category: string;
    count: number;
  }>;
  monthlyStats: Array<{
    month: string;
    packages: number;
    blogs: number;
    contacts: number;
    quotes: number;
  }>;
}

export async function getDashboardStats(dateRange?: { from: Date; to: Date }): Promise<DashboardStats> {
  try {
    const whereClause = dateRange
      ? {
          createdAt: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        }
      : {};

    // Get counts
    const [
      totalPackages,
      totalBlogs,
      totalContacts,
      totalQuotes,
      unreadContacts,
      unreadQuotes,
      publishedBlogs,
      featuredBlogs,
    ] = await Promise.all([
      prisma.listing.count({ where: whereClause }),
      prisma.blog.count({ where: whereClause }),
      prisma.contact.count({ where: whereClause }),
      prisma.quote.count({ where: whereClause }),
      prisma.contact.count({ where: { ...whereClause, isRead: false } }),
      prisma.quote.count({ where: { ...whereClause, isRead: false } }),
      prisma.blog.count({ where: { ...whereClause, published: true } }),
      prisma.blog.count({ where: { ...whereClause, featured: true } }),
    ]);

    // Get recent items
    const [recentPackages, recentBlogs, recentContacts, recentQuotes] = await Promise.all([
      prisma.listing.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          category: true,
          price: true,
          createdAt: true,
        },
      }),
      prisma.blog.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          category: true,
          published: true,
          createdAt: true,
        },
      }),
      prisma.contact.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          isRead: true,
          createdAt: true,
        },
      }),
      prisma.quote.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          destination: true,
          days: true,
          isRead: true,
          createdAt: true,
        },
      }),
    ]);

    // Get packages by category
    const packagesGrouped = await prisma.listing.groupBy({
      by: ['category'],
      where: whereClause,
      _count: true,
    });

    const packagesByCategory = packagesGrouped.map((item) => ({
      category: item.category,
      count: item._count,
    }));

    // Get blogs by category
    const blogsGrouped = await prisma.blog.groupBy({
      by: ['category'],
      where: whereClause,
      _count: true,
    });

    const blogsByCategory = blogsGrouped.map((item) => ({
      category: item.category,
      count: item._count,
    }));

    // Get monthly stats for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyPackages = await prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month,
        COUNT(*) as count
      FROM listings
      WHERE created_at >= ${sixMonthsAgo}
      GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
      ORDER BY EXTRACT(MONTH FROM created_at)
    `;

    const monthlyBlogs = await prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
      SELECT 
        TO_CHAR("createdAt", 'Mon') as month,
        COUNT(*) as count
      FROM blogs
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY TO_CHAR("createdAt", 'Mon'), EXTRACT(MONTH FROM "createdAt")
      ORDER BY EXTRACT(MONTH FROM "createdAt")
    `;

    const monthlyContacts = await prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month,
        COUNT(*) as count
      FROM contacts
      WHERE created_at >= ${sixMonthsAgo}
      GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
      ORDER BY EXTRACT(MONTH FROM created_at)
    `;

    const monthlyQuotes = await prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month,
        COUNT(*) as count
      FROM quotes
      WHERE created_at >= ${sixMonthsAgo}
      GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
      ORDER BY EXTRACT(MONTH FROM created_at)
    `;

    // Combine monthly stats
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last6Months.push(monthNames[monthIndex]);
    }

    const monthlyStats = last6Months.map((month) => {
      const packagesData = monthlyPackages.find((m) => m.month === month);
      const blogsData = monthlyBlogs.find((m) => m.month === month);
      const contactsData = monthlyContacts.find((m) => m.month === month);
      const quotesData = monthlyQuotes.find((m) => m.month === month);

      return {
        month,
        packages: packagesData ? Number(packagesData.count) : 0,
        blogs: blogsData ? Number(blogsData.count) : 0,
        contacts: contactsData ? Number(contactsData.count) : 0,
        quotes: quotesData ? Number(quotesData.count) : 0,
      };
    });

    return {
      totalPackages,
      totalBlogs,
      totalContacts,
      totalQuotes,
      unreadContacts,
      unreadQuotes,
      publishedBlogs,
      featuredBlogs,
      recentPackages: recentPackages.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
      })),
      recentBlogs: recentBlogs.map((b) => ({
        ...b,
        createdAt: b.createdAt.toISOString(),
      })),
      recentContacts: recentContacts.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      })),
      recentQuotes: recentQuotes.map((q) => ({
        ...q,
        createdAt: q.createdAt.toISOString(),
      })),
      packagesByCategory,
      blogsByCategory,
      monthlyStats,
    };
  } catch (error) {
    console.error('Dashboard stats error:', error);
    throw new Error('Failed to fetch dashboard stats');
  }
}
