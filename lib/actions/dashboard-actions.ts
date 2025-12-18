'use server';

import { prisma } from '@/lib/prisma';

export interface DashboardStats {
  // ✅ Existing counts (kept as is)
  totalPackages: number;
  totalBlogs: number;
  totalContacts: number;
  totalQuotes: number;
  totalItineraries: number;
  unreadContacts: number;
  unreadQuotes: number;
  publishedBlogs: number;
  featuredBlogs: number;
  tourilloItineraries: number;
  tthItineraries: number;

  // ✅ NEW: Voucher counts
  totalVouchers: number;
  tourilloVouchers: number;
  tthVouchers: number;
  vouchersWithHotels: number;
  vouchersWithoutHotels: number;
  totalVoucherNights: number;
  totalVoucherGuests: number;

  // ✅ Existing recent items (kept as is)
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
  recentItineraries: Array<{
    id: string;
    travelId: string;
    clientName: string;
    packageTitle: string;
    company: string;
    tripAdvisorName: string;
    quotePrice: number;
    createdAt: string;
  }>;

  // ✅ NEW: Recent vouchers
  recentVouchers: Array<{
    id: string;
    voucherId: string;
    clientName: string;
    totalNights: number;
    adultNo: number;
    childrenNo: number;
    company: string;
    itineraryTravelId: string;
    packageTitle: string;
    createdAt: string;
  }>;

  // ✅ Existing categories (kept as is)
  packagesByCategory: Array<{
    category: string;
    count: number;
  }>;
  blogsByCategory: Array<{
    category: string;
    count: number;
  }>;
  itinerariesByCompany: Array<{
    company: string;
    count: number;
  }>;
  itinerariesByAdvisor: Array<{
    advisor: string;
    count: number;
  }>;

  // ✅ NEW: Voucher analytics
  vouchersByCompany: Array<{
    company: string;
    count: number;
  }>;
  topItinerariesByVouchers: Array<{
    travelId: string;
    clientName: string;
    packageTitle: string;
    company: string;
    voucherCount: number;
    totalNights: number;
    totalGuests: number;
  }>;
  itineraryVoucherRelation: Array<{
    itineraryId: string;
    travelId: string;
    clientName: string;
    packageTitle: string;
    company: string;
    hasVoucher: boolean;
    voucherCount: number;
    totalItineraryNights: number;
    totalVoucherNights: number;
  }>;

  // ✅ Existing monthly stats (enhanced with vouchers)
  monthlyStats: Array<{
    month: string;
    packages: number;
    blogs: number;
    contacts: number;
    quotes: number;
    itineraries: number;
    vouchers: number; // ✅ Added
  }>;

  // ✅ NEW: Business metrics
  businessMetrics: {
    totalItineraryRevenue: number;
    averageItineraryPrice: number;
    averageVouchersPerItinerary: number;
    conversionRate: number;
    tourilloRevenue: number;
    tthRevenue: number;
  };

  // ✅ NEW: Advisor performance
  advisorPerformance: Array<{
    advisorName: string;
    itineraryCount: number;
    voucherCount: number;
    totalRevenue: number;
    averagePrice: number;
  }>;
}

export async function getDashboardStats(dateRange?: { from: Date; to: Date }): Promise<DashboardStats> {
  try {
    console.log('🔄 Fetching dashboard stats...');

    const whereClause = dateRange
      ? {
          createdAt: {
            gte: dateRange.from,
            lte: dateRange.to,
          },
        }
      : {};

    // ============================================
    // PART 1: Existing Basic Counts + Voucher Counts
    // ============================================
    const [
      totalPackages,
      totalBlogs,
      totalContacts,
      totalQuotes,
      totalItineraries,
      totalVouchers,
      unreadContacts,
      unreadQuotes,
      publishedBlogs,
      featuredBlogs,
      tourilloItineraries,
      tthItineraries,
    ] = await Promise.all([
      prisma.listing.count({ where: whereClause }),
      prisma.blog.count({ where: whereClause }),
      prisma.contact.count({ where: whereClause }),
      prisma.quote.count({ where: whereClause }),
      prisma.itinerary.count({ where: whereClause }),
      prisma.voucher.count({ where: whereClause }),
      prisma.contact.count({ where: { ...whereClause, isRead: false } }),
      prisma.quote.count({ where: { ...whereClause, isRead: false } }),
      prisma.blog.count({ where: { ...whereClause, published: true } }),
      prisma.blog.count({ where: { ...whereClause, featured: true } }),
      prisma.itinerary.count({ where: { ...whereClause, company: 'TOURILLO' } }),
      prisma.itinerary.count({ where: { ...whereClause, company: 'TRAVEL_TRAIL_HOLIDAYS' } }),
    ]);

    // ✅ Voucher-specific counts
    const [tourilloVouchers, tthVouchers, allVouchers] = await Promise.all([
      prisma.voucher.count({
        where: {
          ...whereClause,
          itinerary: {
            company: 'TOURILLO',
          },
        },
      }),
      prisma.voucher.count({
        where: {
          ...whereClause,
          itinerary: {
            company: 'TRAVEL_TRAIL_HOLIDAYS',
          },
        },
      }),
      prisma.voucher.findMany({
        where: whereClause,
        select: {
          hotelStays: true,
          totalNights: true,
          adultNo: true,
          childrenNo: true,
        },
      }),
    ]);

    const vouchersWithHotels = allVouchers.filter((v) => Array.isArray(v.hotelStays) && v.hotelStays.length > 0).length;
    const vouchersWithoutHotels = totalVouchers - vouchersWithHotels;
    const totalVoucherNights = allVouchers.reduce((sum, v) => sum + v.totalNights, 0);
    const totalVoucherGuests = allVouchers.reduce((sum, v) => sum + v.adultNo + v.childrenNo, 0);

    // ============================================
    // PART 2: Recent Items (Existing + New Vouchers)
    // ============================================
    const [recentPackages, recentBlogs, recentContacts, recentQuotes, recentItineraries, recentVouchers] =
      await Promise.all([
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
        prisma.itinerary.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            travelId: true,
            clientName: true,
            packageTitle: true,
            company: true,
            tripAdvisorName: true,
            quotePrice: true,
            createdAt: true,
          },
        }),
        prisma.voucher.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            voucherId: true,
            clientName: true,
            totalNights: true,
            adultNo: true,
            childrenNo: true,
            itineraryTravelId: true,
            createdAt: true,
            itinerary: {
              select: {
                company: true,
                packageTitle: true,
              },
            },
          },
        }),
      ]);

    // ============================================
    // PART 3: Existing Category Groupings
    // ============================================
    const packagesGrouped = await prisma.listing.groupBy({
      by: ['category'],
      where: whereClause,
      _count: true,
    });

    const packagesByCategory = packagesGrouped.map((item) => ({
      category: item.category,
      count: item._count,
    }));

    const blogsGrouped = await prisma.blog.groupBy({
      by: ['category'],
      where: whereClause,
      _count: true,
    });

    const blogsByCategory = blogsGrouped.map((item) => ({
      category: item.category,
      count: item._count,
    }));

    const itinerariesByCompanyGrouped = await prisma.itinerary.groupBy({
      by: ['company'],
      where: whereClause,
      _count: true,
    });

    const itinerariesByCompany = itinerariesByCompanyGrouped.map((item) => ({
      company: item.company === 'TOURILLO' ? 'TRL' : 'TTH',
      count: item._count,
    }));

    const itinerariesByAdvisorGrouped = await prisma.itinerary.groupBy({
      by: ['tripAdvisorName'],
      where: {
        ...whereClause,
        tripAdvisorName: {
          not: '',
        },
      },
      _count: {
        tripAdvisorName: true,
      },
      orderBy: {
        _count: {
          tripAdvisorName: 'desc',
        },
      },
      take: 10,
    });

    const itinerariesByAdvisor = itinerariesByAdvisorGrouped
      .filter((item) => item.tripAdvisorName && item.tripAdvisorName.trim() !== '')
      .map((item) => ({
        advisor: item.tripAdvisorName,
        count: item._count.tripAdvisorName,
      }));

    // ============================================
    // PART 4: NEW Voucher Analytics
    // ============================================

    // Vouchers by company
    const vouchersByCompany = [
      { company: 'TRL', count: tourilloVouchers },
      { company: 'TTH', count: tthVouchers },
    ];

    // Get all itineraries with their voucher counts
    const itinerariesWithVouchers = await prisma.itinerary.findMany({
      where: whereClause,
      select: {
        id: true,
        travelId: true,
        clientName: true,
        packageTitle: true,
        company: true,
        numberOfNights: true,
        quotePrice: true,
        tripAdvisorName: true,
        _count: {
          select: {
            vouchers: true,
          },
        },
        vouchers: {
          select: {
            totalNights: true,
            adultNo: true,
            childrenNo: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Top itineraries by voucher count
    const topItinerariesByVouchers = itinerariesWithVouchers
      .filter((i) => i._count.vouchers > 0)
      .sort((a, b) => b._count.vouchers - a._count.vouchers)
      .slice(0, 10)
      .map((itinerary) => {
        const totalNights = itinerary.vouchers.reduce((sum, v) => sum + v.totalNights, 0);
        const totalGuests = itinerary.vouchers.reduce((sum, v) => sum + v.adultNo + v.childrenNo, 0);

        return {
          travelId: itinerary.travelId,
          clientName: itinerary.clientName,
          packageTitle: itinerary.packageTitle,
          company: itinerary.company === 'TOURILLO' ? 'TRL' : 'TTH',
          voucherCount: itinerary._count.vouchers,
          totalNights,
          totalGuests,
        };
      });

    // Itinerary-Voucher relationship data
    const itineraryVoucherRelation = itinerariesWithVouchers.slice(0, 20).map((itinerary) => {
      const totalVoucherNights = itinerary.vouchers.reduce((sum, v) => sum + v.totalNights, 0);

      return {
        itineraryId: itinerary.id,
        travelId: itinerary.travelId,
        clientName: itinerary.clientName,
        packageTitle: itinerary.packageTitle,
        company: itinerary.company === 'TOURILLO' ? 'TRL' : 'TTH',
        hasVoucher: itinerary._count.vouchers > 0,
        voucherCount: itinerary._count.vouchers,
        totalItineraryNights: itinerary.numberOfNights,
        totalVoucherNights,
      };
    });

    // ============================================
    // PART 5: NEW Business Metrics
    // ============================================
    const itinerariesForRevenue = await prisma.itinerary.findMany({
      where: whereClause,
      select: {
        quotePrice: true,
        company: true,
        _count: {
          select: {
            vouchers: true,
          },
        },
      },
    });

    const totalItineraryRevenue = itinerariesForRevenue.reduce((sum, i) => sum + i.quotePrice, 0);
    const averageItineraryPrice =
      itinerariesForRevenue.length > 0 ? totalItineraryRevenue / itinerariesForRevenue.length : 0;

    const itinerariesWithVoucherCount = itinerariesForRevenue.filter((i) => i._count.vouchers > 0).length;
    const conversionRate =
      itinerariesForRevenue.length > 0 ? (itinerariesWithVoucherCount / itinerariesForRevenue.length) * 100 : 0;

    const totalVoucherCount = itinerariesForRevenue.reduce((sum, i) => sum + i._count.vouchers, 0);
    const averageVouchersPerItinerary =
      itinerariesForRevenue.length > 0 ? totalVoucherCount / itinerariesForRevenue.length : 0;

    const tourilloRevenue = itinerariesForRevenue
      .filter((i) => i.company === 'TOURILLO')
      .reduce((sum, i) => sum + i.quotePrice, 0);

    const tthRevenue = itinerariesForRevenue
      .filter((i) => i.company === 'TRAVEL_TRAIL_HOLIDAYS')
      .reduce((sum, i) => sum + i.quotePrice, 0);

    const businessMetrics = {
      totalItineraryRevenue,
      averageItineraryPrice,
      averageVouchersPerItinerary,
      conversionRate,
      tourilloRevenue,
      tthRevenue,
    };

    // ============================================
    // PART 6: NEW Advisor Performance
    // ============================================
    const advisorData = await prisma.itinerary.groupBy({
      by: ['tripAdvisorName'],
      where: {
        ...whereClause,
        tripAdvisorName: {
          not: '',
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        quotePrice: true,
      },
    });

    const advisorPerformancePromises = advisorData.map(async (advisor) => {
      const voucherCount = await prisma.voucher.count({
        where: {
          ...whereClause,
          itinerary: {
            tripAdvisorName: advisor.tripAdvisorName,
          },
        },
      });

      const totalRevenue = advisor._sum.quotePrice || 0;
      const averagePrice = advisor._count.id > 0 ? totalRevenue / advisor._count.id : 0;

      return {
        advisorName: advisor.tripAdvisorName,
        itineraryCount: advisor._count.id,
        voucherCount,
        totalRevenue,
        averagePrice,
      };
    });

    const advisorPerformance = (await Promise.all(advisorPerformancePromises))
      .filter((a) => a.advisorName && a.advisorName.trim() !== '')
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // ============================================
    // PART 7: Monthly Stats (Existing + Vouchers)
    // ============================================
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [monthlyPackages, monthlyBlogs, monthlyContacts, monthlyQuotes, monthlyItineraries, monthlyVouchers] =
      await Promise.all([
        prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
          SELECT 
            TO_CHAR(created_at, 'Mon') as month,
            COUNT(*) as count
          FROM listings
          WHERE created_at >= ${sixMonthsAgo}
          GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
          ORDER BY EXTRACT(MONTH FROM created_at)
        `,
        prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
          SELECT 
            TO_CHAR("createdAt", 'Mon') as month,
            COUNT(*) as count
          FROM blogs
          WHERE "createdAt" >= ${sixMonthsAgo}
          GROUP BY TO_CHAR("createdAt", 'Mon'), EXTRACT(MONTH FROM "createdAt")
          ORDER BY EXTRACT(MONTH FROM "createdAt")
        `,
        prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
          SELECT 
            TO_CHAR(created_at, 'Mon') as month,
            COUNT(*) as count
          FROM contacts
          WHERE created_at >= ${sixMonthsAgo}
          GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
          ORDER BY EXTRACT(MONTH FROM created_at)
        `,
        prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
          SELECT 
            TO_CHAR(created_at, 'Mon') as month,
            COUNT(*) as count
          FROM quotes
          WHERE created_at >= ${sixMonthsAgo}
          GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
          ORDER BY EXTRACT(MONTH FROM created_at)
        `,
        prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
          SELECT 
            TO_CHAR(created_at, 'Mon') as month,
            COUNT(*) as count
          FROM itineraries
          WHERE created_at >= ${sixMonthsAgo}
          GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
          ORDER BY EXTRACT(MONTH FROM created_at)
        `,
        prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
          SELECT 
            TO_CHAR(created_at, 'Mon') as month,
            COUNT(*) as count
          FROM vouchers
          WHERE created_at >= ${sixMonthsAgo}
          GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
          ORDER BY EXTRACT(MONTH FROM created_at)
        `,
      ]);

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
      const itinerariesData = monthlyItineraries.find((m) => m.month === month);
      const vouchersData = monthlyVouchers.find((m) => m.month === month);

      return {
        month,
        packages: packagesData ? Number(packagesData.count) : 0,
        blogs: blogsData ? Number(blogsData.count) : 0,
        contacts: contactsData ? Number(contactsData.count) : 0,
        quotes: quotesData ? Number(quotesData.count) : 0,
        itineraries: itinerariesData ? Number(itinerariesData.count) : 0,
        vouchers: vouchersData ? Number(vouchersData.count) : 0,
      };
    });

    console.log('✅ Dashboard stats fetched successfully');

    // ============================================
    // PART 8: Return Complete Stats
    // ============================================
    return {
      // Existing counts
      totalPackages,
      totalBlogs,
      totalContacts,
      totalQuotes,
      totalItineraries,
      unreadContacts,
      unreadQuotes,
      publishedBlogs,
      featuredBlogs,
      tourilloItineraries,
      tthItineraries,

      // NEW Voucher counts
      totalVouchers,
      tourilloVouchers,
      tthVouchers,
      vouchersWithHotels,
      vouchersWithoutHotels,
      totalVoucherNights,
      totalVoucherGuests,

      // Existing recent items
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
      recentItineraries: recentItineraries.map((i) => ({
        ...i,
        createdAt: i.createdAt.toISOString(),
      })),

      // NEW Recent vouchers
      recentVouchers: recentVouchers.map((v) => ({
        id: v.id,
        voucherId: v.voucherId,
        clientName: v.clientName,
        totalNights: v.totalNights,
        adultNo: v.adultNo,
        childrenNo: v.childrenNo,
        company: v.itinerary.company === 'TOURILLO' ? 'TRL' : 'TTH',
        itineraryTravelId: v.itineraryTravelId,
        packageTitle: v.itinerary.packageTitle,
        createdAt: v.createdAt.toISOString(),
      })),

      // Existing categories
      packagesByCategory,
      blogsByCategory,
      itinerariesByCompany,
      itinerariesByAdvisor,

      // NEW Voucher analytics
      vouchersByCompany,
      topItinerariesByVouchers,
      itineraryVoucherRelation,

      // Existing + Enhanced monthly stats
      monthlyStats,

      // NEW Business metrics
      businessMetrics,

      // NEW Advisor performance
      advisorPerformance,
    };
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    throw new Error('Failed to fetch dashboard stats');
  }
}
