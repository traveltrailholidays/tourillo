'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Pencil,
  Trash2,
  Star,
  Search,
  MapPin,
  Calendar,
  Tag,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  User,
  Download,
  Sheet,
  File,
  FileText,
  CalendarIcon,
  X,
  Package as PackageIcon,
  Percent,
} from 'lucide-react';
import Link from 'next/link';
import { deleteListing } from '@/lib/actions/listing-actions';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import toast from 'react-hot-toast';
import LoadingSpinner from './loading-spinner';

export interface Listing {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  category: string;
  location: string;
  price: number;
  days: number;
  nights: number;
  rating: number;
  discount: number;
  itinary: string[];
  createdAt: string;
  updatedAt?: string;
  createdById?: string | null;
  creator?: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  } | null;
}

interface PackageListProps {
  packages: Listing[];
}

type SortField = 'title' | 'category' | 'location' | 'price' | 'days' | 'rating' | 'discount' | 'createdAt' | 'creator';
type SortDirection = 'asc' | 'desc' | null;
type DiscountFilterType = 'ALL' | 'WITH_DISCOUNT' | 'NO_DISCOUNT';
type RatingFilterType = 'ALL' | '4.5' | '4.0' | '3.5' | '3.0';
type ExportType = 'csv' | 'excel' | 'pdf';

// Helper function to format date to dd/mm/yyyy
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to format price
const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString('en-IN')}`;
};

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 20): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Format display date (dd/mm/yyyy)
const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

// Format date for input field (YYYY-MM-DD)
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to get creator display name
const getCreatorDisplayName = (creator: Listing['creator']): string => {
  if (!creator) return 'Admin';
  return creator.name || creator.email || 'Unknown User';
};

// Helper function to get creator badge color
const getCreatorBadgeClass = (role: string): string => {
  switch (role) {
    case 'Admin':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
    case 'Agent':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
    default:
      return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300';
  }
};

export const PackageList: React.FC<PackageListProps> = ({ packages }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Filter States with proper types
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [discountFilter, setDiscountFilter] = useState<DiscountFilterType>('ALL');
  const [ratingFilter, setRatingFilter] = useState<RatingFilterType>('ALL');
  const [creatorFilter, setCreatorFilter] = useState<string>('ALL');

  // Date Range Filter States with proper types
  const [showDateRangeDialog, setShowDateRangeDialog] = useState(false);
  const [exportType, setExportType] = useState<ExportType>('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [applyDateFilter, setApplyDateFilter] = useState(false);

  const PAGE_SIZE = 10;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get user info from session
  const currentUser = useMemo(() => {
    if (status === 'loading' || !session?.user) return null;
    return {
      id: session.user.id,
      isAdmin: session.user.isAdmin || false,
      isAgent: session.user.isAgent || false,
      email: session.user.email,
      name: session.user.name,
    };
  }, [session, status]);

  const isAdmin = useMemo(() => {
    if (!isMounted || !currentUser) return false;
    return currentUser.isAdmin;
  }, [currentUser, isMounted]);

  const isAgent = useMemo(() => {
    if (!isMounted || !currentUser) return false;
    return currentUser.isAgent;
  }, [currentUser, isMounted]);

  // Check if user can edit package
  const canEditPackage = (pkg: Listing): boolean => {
    if (!currentUser) return false;
    return currentUser.isAdmin || currentUser.isAgent;
  };

  // Check if user can delete package
  const canDeletePackage = (): boolean => {
    if (!currentUser) return false;
    return currentUser.isAdmin;
  };

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(packages.map((p) => p.category)));
    return uniqueCategories.sort();
  }, [packages]);

  // Get unique creators
  const creators = useMemo(() => {
    const uniqueCreators = new Map<string, { name: string; role: string }>();
    packages.forEach((p) => {
      if (p.creator) {
        const key = p.creator.id;
        if (!uniqueCreators.has(key)) {
          uniqueCreators.set(key, {
            name: getCreatorDisplayName(p.creator),
            role: p.creator.role,
          });
        }
      }
    });
    return Array.from(uniqueCreators.entries()).map(([id, data]) => ({ id, ...data }));
  }, [packages]);

  // Statistics
  const stats = useMemo(() => {
    const withDiscount = packages.filter((p) => p.discount > 0).length;
    const avgRating = packages.reduce((acc, p) => acc + p.rating, 0) / packages.length || 0;

    return {
      total: packages.length,
      withDiscount,
      avgRating: avgRating.toFixed(1),
    };
  }, [packages]);

  // Handler functions with proper types
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setPage(1);
  };

  const handleDiscountChange = (value: string) => {
    setDiscountFilter(value as DiscountFilterType);
    setPage(1);
  };

  const handleRatingChange = (value: string) => {
    setRatingFilter(value as RatingFilterType);
    setPage(1);
  };

  const handleCreatorChange = (value: string) => {
    setCreatorFilter(value);
    setPage(1);
  };

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(1);
  };

  // Filter and Sort
  const filtered = useMemo(() => {
    let result = packages;

    // Search filter
    if (search.trim()) {
      result = result.filter((p) =>
        [p.title, p.category, p.location].some((v) => v.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Discount filter
    if (discountFilter === 'WITH_DISCOUNT') {
      result = result.filter((p) => p.discount > 0);
    } else if (discountFilter === 'NO_DISCOUNT') {
      result = result.filter((p) => p.discount === 0);
    }

    // Rating filter
    if (ratingFilter !== 'ALL') {
      const minRating = parseFloat(ratingFilter);
      result = result.filter((p) => p.rating >= minRating);
    }

    // Creator filter
    if (creatorFilter !== 'ALL') {
      result = result.filter((p) => p.creator?.id === creatorFilter);
    }

    // Date Range Filter
    if (applyDateFilter && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      result = result.filter((p) => {
        const itemDate = new Date(p.createdAt);
        return itemDate >= start && itemDate <= end;
      });
    }

    // Sorting
    if (sortField && sortDirection) {
      result = [...result].sort((a, b) => {
        let aVal: string | number;
        let bVal: string | number;

        if (sortField === 'creator') {
          aVal = getCreatorDisplayName(a.creator).toLowerCase();
          bVal = getCreatorDisplayName(b.creator).toLowerCase();
        } else {
          aVal = a[sortField];
          bVal = b[sortField];
        }

        if (sortField === 'createdAt') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }

        if (typeof aVal === 'string' && sortField !== 'creator') {
          aVal = aVal.toLowerCase();
          bVal = (bVal as string).toLowerCase();
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [
    search,
    packages,
    sortField,
    sortDirection,
    categoryFilter,
    discountFilter,
    ratingFilter,
    creatorFilter,
    applyDateFilter,
    startDate,
    endDate,
  ]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getDateFilteredData = (data: Listing[]): Listing[] => {
    if (!startDate || !endDate) return data;
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return data.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= start && itemDate <= end;
    });
  };

  // ✅ Export to CSV - Dynamic Itinerary Days
  const exportToCSV = (data: Listing[]) => {
    const filteredData = getDateFilteredData(data);
    if (filteredData.length === 0) {
      toast.error('No data found in selected date range');
      return;
    }

    // ✅ Find ACTUAL max itinerary days from the data
    const maxDays = Math.max(...filteredData.map((item) => item.itinary?.length || 0), 1);

    console.log('📊 Export CSV - Max days found:', maxDays);

    const headers = [
      'Package Title',
      'Description',
      'Category',
      'Location',
      'Price (₹)',
      'Days',
      'Nights',
      'Rating (out of 5)',
      'Discount (%)',
      'Image URL',
      ...Array.from({ length: maxDays }, (_, i) => `Day ${i + 1}`),
      'Created By (Name)',
      'Created By (Role)',
      'Created Date',
      'Last Updated',
    ];

    const csvContent = [
      headers.join(','),
      ...filteredData.map((item) => {
        const itineraryDays = Array.from({ length: maxDays }, (_, i) =>
          item.itinary && item.itinary[i] ? `"${item.itinary[i].replace(/"/g, '""')}"` : ''
        );

        return [
          `"${item.title.replace(/"/g, '""')}"`,
          `"${item.description.replace(/"/g, '""')}"`,
          item.category,
          `"${item.location}"`,
          item.price,
          item.days,
          item.nights,
          item.rating,
          item.discount,
          `"${item.imageSrc}"`,
          ...itineraryDays,
          `"${getCreatorDisplayName(item.creator)}"`,
          item.creator?.role || 'Admin',
          formatDate(item.createdAt),
          item.updatedAt ? formatDate(item.updatedAt) : formatDate(item.createdAt),
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];
    const dateLabel = startDate && endDate ? `_${startDate}_to_${endDate}` : '';

    link.setAttribute('href', url);
    link.setAttribute('download', `packages_complete${dateLabel}_${timestamp}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${filteredData.length} packages exported to CSV with ${maxDays} days of itinerary!`);
  };

  // ✅ Export to Excel - Dynamic Itinerary Days
  const exportToExcel = async (data: Listing[]) => {
    const filteredData = getDateFilteredData(data);
    if (filteredData.length === 0) {
      toast.error('No data found in selected date range');
      return;
    }

    try {
      setIsExporting(true);
      const XLSX = await import('xlsx');

      // ✅ Find ACTUAL max itinerary days from the data
      const maxDays = Math.max(...filteredData.map((item) => item.itinary?.length || 0), 1);

      console.log('📊 Export Excel - Max days found:', maxDays);

      const excelData = filteredData.map((item, index) => {
        const row: any = {
          'S.No': index + 1,
          'Package Title': item.title,
          Description: item.description,
          Category: item.category,
          Location: item.location,
          'Price (₹)': item.price,
          Days: item.days,
          Nights: item.nights,
          Duration: `${item.days}D / ${item.nights}N`,
          'Rating (out of 5)': item.rating,
          'Discount (%)': item.discount,
          'Discounted Price (₹)':
            item.discount > 0 ? Math.round(item.price - (item.price * item.discount) / 100) : item.price,
          'Image URL': item.imageSrc,
        };

        // ✅ Add all itinerary days dynamically
        for (let i = 0; i < maxDays; i++) {
          row[`Day ${i + 1}`] = item.itinary && item.itinary[i] ? item.itinary[i] : '';
        }

        row['Created By (Name)'] = getCreatorDisplayName(item.creator);
        row['Created By (Role)'] = item.creator?.role || 'Admin';
        row['Created Date'] = formatDate(item.createdAt);
        row['Last Updated'] = item.updatedAt ? formatDate(item.updatedAt) : formatDate(item.createdAt);

        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Packages Complete');

      // ✅ Set column widths dynamically
      const columnWidths = [
        { wch: 6 }, // S.No
        { wch: 35 }, // Package Title
        { wch: 50 }, // Description
        { wch: 15 }, // Category
        { wch: 25 }, // Location
        { wch: 12 }, // Price
        { wch: 8 }, // Days
        { wch: 8 }, // Nights
        { wch: 15 }, // Duration
        { wch: 12 }, // Rating
        { wch: 12 }, // Discount
        { wch: 18 }, // Discounted Price
        { wch: 40 }, // Image URL
        ...Array.from({ length: maxDays }, () => ({ wch: 50 })), // Itinerary days
        { wch: 20 }, // Created By Name
        { wch: 15 }, // Created By Role
        { wch: 15 }, // Created Date
        { wch: 15 }, // Last Updated
      ];
      worksheet['!cols'] = columnWidths;

      const timestamp = new Date().toISOString().split('T')[0];
      const dateLabel = startDate && endDate ? `_${startDate}_to_${endDate}` : '';

      XLSX.writeFile(workbook, `packages_complete${dateLabel}_${timestamp}.xlsx`);
      toast.success(`${filteredData.length} packages exported to Excel with ${maxDays} days of itinerary!`);
    } catch (error) {
      toast.error('Failed to export to Excel');
      console.error('Excel export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // ✅ Export to PDF - Complete Data
  const exportToPDF = async (data: Listing[]) => {
    const filteredData = getDateFilteredData(data);
    if (filteredData.length === 0) {
      toast.error('No data found in selected date range');
      return;
    }

    try {
      setIsExporting(true);
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const timestamp = new Date().toLocaleDateString('en-IN');

      // Title
      doc.setFontSize(18);
      doc.setTextColor(147, 51, 234);
      doc.text('Complete Package Report', 14, 15);

      // Subtitle
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      let subtitle = `Total Packages: ${filteredData.length} | Generated: ${timestamp}`;
      if (startDate && endDate) {
        subtitle += `\nDate Range: ${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}`;
      }
      doc.text(subtitle, 14, 24);

      // Summary Table
      const tableData = filteredData.map((item, index) => {
        const discountedPrice =
          item.discount > 0 ? Math.round(item.price - (item.price * item.discount) / 100) : item.price;

        return [
          index + 1,
          truncateText(item.title, 30),
          item.category,
          truncateText(item.location, 20),
          formatPrice(item.price),
          item.discount > 0 ? `${item.discount}%` : '-',
          formatPrice(discountedPrice),
          `${item.days}D/${item.nights}N`,
          item.rating.toFixed(1),
          truncateText(getCreatorDisplayName(item.creator), 18),
          formatDate(item.createdAt),
        ];
      });

      autoTable(doc, {
        head: [
          [
            '#',
            'Package Title',
            'Category',
            'Location',
            'Original Price',
            'Discount',
            'Final Price',
            'Duration',
            'Rating',
            'Created By',
            'Date',
          ],
        ],
        body: tableData,
        startY: startDate && endDate ? 34 : 30,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [147, 51, 234],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 8 },
          1: { cellWidth: 35 },
          2: { cellWidth: 20 },
          3: { cellWidth: 25 },
          4: { halign: 'right', cellWidth: 20 },
          5: { halign: 'center', cellWidth: 15 },
          6: { halign: 'right', cellWidth: 20 },
          7: { halign: 'center', cellWidth: 20 },
          8: { halign: 'center', cellWidth: 15 },
          9: { cellWidth: 25 },
          10: { cellWidth: 20 },
        },
        alternateRowStyles: { fillColor: [249, 250, 251] },
      });

      // Detailed pages
      filteredData.forEach((item, index) => {
        doc.addPage();

        doc.setFontSize(16);
        doc.setTextColor(147, 51, 234);
        doc.text(`${index + 1}. ${truncateText(item.title, 50)}`, 14, 15);

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        let yPos = 25;

        const details = [
          ['Category:', item.category],
          ['Location:', item.location],
          ['Price:', formatPrice(item.price)],
          ['Discount:', item.discount > 0 ? `${item.discount}% OFF` : 'No Discount'],
          [
            'Final Price:',
            formatPrice(item.discount > 0 ? Math.round(item.price - (item.price * item.discount) / 100) : item.price),
          ],
          ['Duration:', `${item.days} Days / ${item.nights} Nights`],
          ['Rating:', `${item.rating.toFixed(1)} / 5.0 ⭐`],
          ['Created By:', `${getCreatorDisplayName(item.creator)} (${item.creator?.role || 'Admin'})`],
          ['Created Date:', formatDate(item.createdAt)],
          ['Last Updated:', item.updatedAt ? formatDate(item.updatedAt) : formatDate(item.createdAt)],
        ];

        details.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold');
          doc.text(label, 14, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(String(value), 60, yPos);
          yPos += 7;
        });

        // Description
        yPos += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('Description:', 14, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(item.description, 260);
        doc.text(descLines, 14, yPos);
        yPos += descLines.length * 5 + 5;

        // Itinerary - ALL Days
        if (item.itinary && item.itinary.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.text('Itinerary:', 14, yPos);
          yPos += 7;
          doc.setFont('helvetica', 'normal');

          item.itinary.forEach((day, dayIndex) => {
            if (yPos > 190) {
              doc.addPage();
              yPos = 20;
            }
            doc.setFont('helvetica', 'bold');
            doc.text(`Day ${dayIndex + 1}:`, 14, yPos);
            doc.setFont('helvetica', 'normal');
            const dayLines = doc.splitTextToSize(day, 245);
            doc.text(dayLines, 35, yPos);
            yPos += dayLines.length * 5 + 3;
          });
        } else {
          doc.setTextColor(156, 163, 175);
          doc.text('No itinerary available for this package.', 14, yPos);
          yPos += 7;
        }

        // Image URL
        if (yPos < 180) {
          yPos += 5;
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text('Image URL:', 14, yPos);
          yPos += 7;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(37, 99, 235);
          const urlLines = doc.splitTextToSize(item.imageSrc, 260);
          doc.text(urlLines, 14, yPos);
        }
      });

      // Page numbers
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(156, 163, 175);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      const dateStr = new Date().toISOString().split('T')[0];
      const dateLabel = startDate && endDate ? `_${startDate}_to_${endDate}` : '';

      doc.save(`packages_complete${dateLabel}_${dateStr}.pdf`);
      toast.success(`${filteredData.length} packages exported to PDF with complete details!`);
    } catch (error) {
      toast.error('Failed to export to PDF');
      console.error('PDF export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportClick = (type: ExportType) => {
    setExportType(type);
    setShowDateRangeDialog(true);
  };

  const executeExport = () => {
    setShowDateRangeDialog(false);
    setTimeout(() => {
      switch (exportType) {
        case 'csv':
          exportToCSV(filtered);
          break;
        case 'excel':
          exportToExcel(filtered);
          break;
        case 'pdf':
          exportToPDF(filtered);
          break;
      }
      setStartDate('');
      setEndDate('');
    }, 100);
  };

  const clearAllFilters = () => {
    setSearch('');
    setCategoryFilter('ALL');
    setDiscountFilter('ALL');
    setRatingFilter('ALL');
    setCreatorFilter('ALL');
    setStartDate('');
    setEndDate('');
    setApplyDateFilter(false);
    setPage(1);
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setApplyDateFilter(false);
  };

  const openDeleteDialog = (id: string) => {
    if (!isMounted) return;
    if (!canDeletePackage()) {
      toast.error('Only administrators can delete packages');
      return;
    }
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (!deleteId || !canDeletePackage()) {
      toast.error('Only administrators can delete packages');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteListing(deleteId);
      toast.success('Package deleted successfully!');
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete package');
    } finally {
      setIsDeleting(false);
    }
  };

  // Render sort icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 ml-1 text-gray-400" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-3.5 w-3.5 ml-1 text-purple-600" />;
    }
    return <ArrowDown className="h-3.5 w-3.5 ml-1 text-purple-600" />;
  };

  const hasActiveFilters =
    categoryFilter !== 'ALL' ||
    discountFilter !== 'ALL' ||
    ratingFilter !== 'ALL' ||
    creatorFilter !== 'ALL' ||
    search.trim() ||
    applyDateFilter;

  // ✅ Calculate counts for each filter option
  const filterCounts = useMemo(() => {
    // Category counts
    const categoryCounts = new Map<string, number>();
    categories.forEach((cat) => {
      categoryCounts.set(cat, packages.filter((p) => p.category === cat).length);
    });

    // Discount counts
    const withDiscount = packages.filter((p) => p.discount > 0).length;
    const noDiscount = packages.filter((p) => p.discount === 0).length;

    // Rating counts
    const rating45Plus = packages.filter((p) => p.rating >= 4.5).length;
    const rating40Plus = packages.filter((p) => p.rating >= 4.0).length;
    const rating35Plus = packages.filter((p) => p.rating >= 3.5).length;
    const rating30Plus = packages.filter((p) => p.rating >= 3.0).length;

    // Creator counts
    const creatorCounts = new Map<string, number>();
    creators.forEach((creator) => {
      creatorCounts.set(creator.id, packages.filter((p) => p.creator?.id === creator.id).length);
    });

    return {
      category: categoryCounts,
      discount: { withDiscount, noDiscount },
      rating: {
        '4.5': rating45Plus,
        '4.0': rating40Plus,
        '3.5': rating35Plus,
        '3.0': rating30Plus,
      },
      creator: creatorCounts,
    };
  }, [packages, categories, creators]);

  return (
    <div className="w-full max-w-full">
      <div className="rounded bg-foreground shadow-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        {/* Search, Filters and Export */}
        <div className="mb-6 space-y-4">
          {/* First Row: Search and Export */}
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                className="w-full pl-10 pr-4 py-2.5 rounded border-2 border-gray-300 dark:border-gray-600 bg-background focus:outline-none focus:ring-2 focus:ring-purple-500 transition cursor-text"
                placeholder="Search by title, category, or location..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>

            {/* Export Button - Admin Only */}
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="default"
                    disabled={filtered.length === 0 || isExporting}
                    className="bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 cursor-pointer h-10 shrink-0 rounded"
                  >
                    {isExporting ? (
                      <>
                        <LoadingSpinner />
                        <span className="ml-2">Exporting...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export ({filtered.length})
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => handleExportClick('csv')}
                    disabled={isExporting}
                    className="cursor-pointer"
                  >
                    <Sheet className="h-4 w-4 mr-2 text-blue-600" />
                    <span>Export to CSV</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleExportClick('excel')}
                    disabled={isExporting}
                    className="cursor-pointer"
                  >
                    <FileText className="h-4 w-4 mr-2 text-green-600" />
                    <span>Export to Excel</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleExportClick('pdf')}
                    disabled={isExporting}
                    className="cursor-pointer"
                  >
                    <File className="h-4 w-4 mr-2 text-red-600" />
                    <span>Export to PDF</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Second Row: Filters */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2 items-center justify-start">
              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-fit rounded cursor-pointer min-w-[140px] h-9">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">
                    All Categories <span className="text-gray-500">({packages.length})</span>
                  </SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat} <span className="text-gray-500">({filterCounts.category.get(cat) || 0})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Discount Filter */}
              <Select value={discountFilter} onValueChange={handleDiscountChange}>
                <SelectTrigger className="w-fit rounded cursor-pointer min-w-[140px] h-9">
                  <SelectValue placeholder="All Packages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">
                    All Packages <span className="text-gray-500">({packages.length})</span>
                  </SelectItem>
                  <SelectItem value="WITH_DISCOUNT">
                    With Discount <span className="text-gray-500">({filterCounts.discount.withDiscount})</span>
                  </SelectItem>
                  <SelectItem value="NO_DISCOUNT">
                    No Discount <span className="text-gray-500">({filterCounts.discount.noDiscount})</span>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Rating Filter */}
              <Select value={ratingFilter} onValueChange={handleRatingChange}>
                <SelectTrigger className="w-fit rounded cursor-pointer min-w-[130px] h-9">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">
                    All Ratings <span className="text-gray-500">({packages.length})</span>
                  </SelectItem>
                  <SelectItem value="4.5">
                    4.5+ Stars <span className="text-gray-500">({filterCounts.rating['4.5']})</span>
                  </SelectItem>
                  <SelectItem value="4.0">
                    4.0+ Stars <span className="text-gray-500">({filterCounts.rating['4.0']})</span>
                  </SelectItem>
                  <SelectItem value="3.5">
                    3.5+ Stars <span className="text-gray-500">({filterCounts.rating['3.5']})</span>
                  </SelectItem>
                  <SelectItem value="3.0">
                    3.0+ Stars <span className="text-gray-500">({filterCounts.rating['3.0']})</span>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Created By Filter */}
              <Select value={creatorFilter} onValueChange={handleCreatorChange}>
                <SelectTrigger className="w-fit rounded cursor-pointer min-w-[140px] h-9">
                  <SelectValue placeholder="All Creators" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">
                    All Creators <span className="text-gray-500">({packages.length})</span>
                  </SelectItem>
                  {creators.map((creator) => (
                    <SelectItem key={creator.id} value={creator.id}>
                      {creator.name} ({creator.role}){' '}
                      <span className="text-gray-500">({filterCounts.creator.get(creator.id) || 0})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button - New Line */}
            {hasActiveFilters && (
              <div className="flex justify-start">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearAllFilters}
                  className="cursor-pointer rounded text-red-600 hover:text-red-700 hover:border-red-600 h-9"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="px-4 py-3 bg-linear-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded">
              <div className="flex items-center gap-2 mb-1">
                <PackageIcon className="h-4 w-4 text-purple-600" />
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Total Packages</p>
              </div>
              <p className="text-2xl font-bold text-purple-600">{stats.total}</p>
            </div>

            <div className="px-4 py-3 bg-linear-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded">
              <div className="flex items-center gap-2 mb-1">
                <Percent className="h-4 w-4 text-orange-600" />
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">With Discount</p>
              </div>
              <p className="text-2xl font-bold text-orange-600">{stats.withDiscount}</p>
            </div>

            <div className="px-4 py-3 bg-linear-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Avg Rating</p>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{stats.avgRating}</p>
            </div>
          </div>

          {/* Active Filter Indicator */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
              <span>
                Showing {filtered.length} of {stats.total} packages
              </span>
              {categoryFilter !== 'ALL' && (
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded text-purple-700 dark:text-purple-300 capitalize">
                  {categoryFilter}
                </span>
              )}
              {discountFilter !== 'ALL' && (
                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded text-orange-700 dark:text-orange-300">
                  {discountFilter === 'WITH_DISCOUNT' ? 'With Discount' : 'No Discount'}
                </span>
              )}
              {ratingFilter !== 'ALL' && (
                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded text-yellow-700 dark:text-yellow-300">
                  {ratingFilter}+ Stars
                </span>
              )}
              {creatorFilter !== 'ALL' && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-700 dark:text-blue-300">
                  {creators.find((c) => c.id === creatorFilter)?.name}
                </span>
              )}
              {applyDateFilter && startDate && endDate && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <CalendarIcon className="h-3 w-3" />
                  {formatDisplayDate(startDate)} to {formatDisplayDate(endDate)}
                  <button
                    onClick={clearDateFilter}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block w-full">
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded scrollbar-visible">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableHead className="font-bold text-gray-700 dark:text-gray-300 w-16 min-w-[60px]">S.No</TableHead>
                  <TableHead
                    className="font-bold text-gray-700 dark:text-gray-300 min-w-[180px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center whitespace-nowrap">
                      Title
                      <SortIcon field="title" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-bold text-gray-700 dark:text-gray-300 min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center whitespace-nowrap">
                      Category
                      <SortIcon field="category" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-bold text-gray-700 dark:text-gray-300 min-w-40 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center whitespace-nowrap">
                      Location
                      <SortIcon field="location" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-bold text-gray-700 dark:text-gray-300 min-w-[110px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center whitespace-nowrap">
                      Price
                      <SortIcon field="price" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-bold text-gray-700 dark:text-gray-300 min-w-[110px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('days')}
                  >
                    <div className="flex items-center whitespace-nowrap">
                      Duration
                      <SortIcon field="days" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-bold text-gray-700 dark:text-gray-300 min-w-[90px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('rating')}
                  >
                    <div className="flex items-center whitespace-nowrap">
                      Rating
                      <SortIcon field="rating" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-bold text-gray-700 dark:text-gray-300 min-w-[100px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('discount')}
                  >
                    <div className="flex items-center whitespace-nowrap">
                      Discount
                      <SortIcon field="discount" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-bold text-gray-700 dark:text-gray-300 min-w-[100px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center whitespace-nowrap">
                      Created At
                      <SortIcon field="createdAt" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-bold text-gray-700 dark:text-gray-300 min-w-[140px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSort('creator')}
                  >
                    <div className="flex items-center whitespace-nowrap">
                      Created By
                      <SortIcon field="creator" />
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 dark:text-gray-300 text-right min-w-[100px] sticky right-0 bg-gray-50 dark:bg-gray-800">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Tag className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                          {hasActiveFilters ? 'No packages found matching your filters' : 'No packages available'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {pageData.map((pkg, index) => (
                  <TableRow key={pkg.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell className="font-semibold text-gray-600 dark:text-gray-400">
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </TableCell>

                    <TableCell className="font-medium">
                      <Link
                        href={`/packages/${pkg.id}`}
                        className="hover:text-purple-600 dark:hover:text-purple-400 hover:underline capitalize line-clamp-2 cursor-pointer"
                        target="_blank"
                      >
                        {pkg.title}
                      </Link>
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 capitalize text-xs px-2.5 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold whitespace-nowrap">
                        <Tag className="h-3 w-3" />
                        {pkg.category}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm" title={pkg.location}>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{pkg.location}</span>
                      </div>
                    </TableCell>

                    <TableCell className="font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                      {formatPrice(pkg.price)}
                    </TableCell>

                    <TableCell className="text-sm whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {pkg.days}D / {pkg.nights}N
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{pkg.rating.toFixed(1)}</span>
                      </div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      {pkg.discount > 0 ? (
                        <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                          {pkg.discount}% OFF
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>

                    <TableCell className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(pkg.createdAt)}
                    </TableCell>

                    <TableCell>
                      {pkg.creator ? (
                        <div className="space-y-1">
                          <p
                            className="font-semibold text-sm truncate max-w-[120px]"
                            title={pkg.creator.email || 'Unknown'}
                          >
                            {truncateText(getCreatorDisplayName(pkg.creator), 15)}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded ${getCreatorBadgeClass(pkg.creator.role)}`}
                          >
                            <User className="h-3 w-3" />
                            {pkg.creator.role}
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-semibold text-sm text-gray-600 dark:text-gray-400">Admin</p>
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                            <User className="h-3 w-3" />
                            Admin
                          </span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-right sticky right-0 bg-white dark:bg-gray-900">
                      <div className="flex justify-end gap-2">
                        {canEditPackage(pkg) && (
                          <Link href={`/admin/package/edit/${pkg.id}`}>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Edit Package"
                              className="h-8 w-8 hover:bg-purple-100 dark:hover:bg-purple-900/30 cursor-pointer"
                            >
                              <Pencil className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </Button>
                          </Link>
                        )}
                        {isMounted && canDeletePackage() && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openDeleteDialog(pkg.id)}
                                title="Delete Package"
                                className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded">
                              <DialogHeader>
                                <DialogTitle>Delete Package</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete &quot;{pkg.title}&quot;? This action cannot be undone
                                  and will permanently remove this package.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button
                                    variant="outline"
                                    onClick={() => setDeleteId(null)}
                                    className="rounded cursor-pointer"
                                    disabled={isDeleting}
                                  >
                                    Cancel
                                  </Button>
                                </DialogClose>
                                <Button
                                  variant="destructive"
                                  onClick={handleDelete}
                                  disabled={isDeleting}
                                  className="rounded cursor-pointer"
                                >
                                  {isDeleting ? 'Deleting...' : 'Delete Package'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-3">
          {pageData.length === 0 && (
            <div className="bg-foreground rounded border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Tag className="h-12 w-12 mx-auto mb-3 text-gray-400 opacity-50" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {hasActiveFilters ? 'No packages found matching your filters' : 'No packages available'}
              </p>
            </div>
          )}
          {pageData.map((pkg, index) => (
            <div
              key={pkg.id}
              className="bg-foreground rounded border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      #{(page - 1) * PAGE_SIZE + index + 1}
                    </span>
                  </div>
                  <Link
                    href={`/packages/${pkg.id}`}
                    className="hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer"
                    target="_blank"
                  >
                    <h3 className="font-bold text-base capitalize line-clamp-2 mb-2">{pkg.title}</h3>
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 capitalize text-xs px-2.5 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold">
                      <Tag className="h-3 w-3" />
                      {pkg.category}
                    </span>
                    {pkg.discount > 0 && (
                      <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                        {pkg.discount}% OFF
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {canEditPackage(pkg) && (
                    <Link href={`/admin/package/edit/${pkg.id}`}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-purple-100 dark:hover:bg-purple-900/30 cursor-pointer"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4 text-purple-600" />
                      </Button>
                    </Link>
                  )}
                  {isMounted && canDeletePackage() && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer"
                          onClick={() => openDeleteDialog(pkg.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] sm:max-w-md rounded">
                        <DialogHeader>
                          <DialogTitle>Delete Package</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete &quot;{pkg.title}&quot;? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                          <DialogClose asChild>
                            <Button
                              variant="outline"
                              onClick={() => setDeleteId(null)}
                              className="w-full sm:w-auto rounded cursor-pointer"
                              disabled={isDeleting}
                            >
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full sm:w-auto rounded cursor-pointer"
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    Location:
                  </span>
                  <span className="font-medium text-right" title={pkg.location}>
                    {truncateText(pkg.location, 25)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Price:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{formatPrice(pkg.price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Duration:
                  </span>
                  <span className="font-medium">
                    {pkg.days}D / {pkg.nights}N
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Rating:</span>
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{pkg.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Created:</span>
                  <span className="text-gray-600 dark:text-gray-400">{formatDate(pkg.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Created By:
                  </span>
                  {pkg.creator ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{truncateText(getCreatorDisplayName(pkg.creator), 15)}</span>
                      <span
                        className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded ${getCreatorBadgeClass(pkg.creator.role)}`}
                      >
                        {pkg.creator.role}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Admin</span>
                      <span className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        Admin
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <Button
              disabled={page === 1}
              size="sm"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              variant="outline"
              className="rounded cursor-pointer"
            >
              Previous
            </Button>
            <Button
              disabled={page === totalPages || totalPages === 0}
              size="sm"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              variant="outline"
              className="rounded cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog open={showDateRangeDialog} onOpenChange={setShowDateRangeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-purple-600" />
              Select Export Options
            </DialogTitle>
            <DialogDescription>Choose to export all data or select a specific date range.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded hover:border-purple-500 transition">
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  executeExport();
                }}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-linear-to-r from-green-500 to-emerald-600 rounded-full">
                    <Download className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-base group-hover:text-purple-600 transition">Export All Data</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  {filtered.length}
                </div>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-gray-500">OR</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">Select Custom Date Range</p>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  From Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={formatDateForInput(new Date())}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:ring-2 focus:ring-purple-500 bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  To Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={formatDateForInput(new Date())}
                  disabled={!startDate}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:ring-2 focus:ring-purple-500 bg-background disabled:opacity-50"
                />
              </div>

              {startDate && endDate && (
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      <strong>{formatDisplayDate(startDate)}</strong> to <strong>{formatDisplayDate(endDate)}</strong>
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDateRangeDialog(false);
                setStartDate('');
                setEndDate('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={executeExport}
              disabled={!startDate || !endDate}
              className="bg-linear-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700"
            >
              Export Date Range
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackageList;
