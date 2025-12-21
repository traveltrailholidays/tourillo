'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Trash2,
  Copy,
  Search,
  Calendar,
  Hotel,
  Edit,
  FileText,
  Building2,
  Download,
  Sheet,
  File,
  CalendarIcon,
  X,
  Package as PackageIcon,
  UserCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { deleteVoucher } from '@/lib/actions/voucher-actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import LoadingSpinner from '../loading-spinner';

export interface Voucher {
  id: string;
  voucherId: string;
  itineraryTravelId: string;
  clientName: string;
  adultNo: number;
  childrenNo: number;
  totalNights: number;
  hotelStays: Array<{
    hotelName: string;
    nights: number;
    fromDate: string;
    toDate: string;
    description: string;
  }>;
  createdAt: string;
  updatedAt: string;
  itinerary: {
    packageTitle: string;
    clientPhone: string;
    clientEmail: string | null;
    numberOfHotels: number;
    tripAdvisorName: string | null;
    tripAdvisorNumber: string | null;
  };
}

interface VoucherListProps {
  vouchers: Voucher[];
}

type SortField =
  | 'voucherId'
  | 'itineraryTravelId'
  | 'clientName'
  | 'tripAdvisorName'
  | 'packageTitle'
  | 'adultNo'
  | 'totalNights'
  | 'createdAt'
  | 'company';

type SortDirection = 'asc' | 'desc' | null;

// Helper to format date (dd/mm/yyyy)
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
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

// Extract company from voucher ID or itinerary ID
const getCompanyFromId = (voucherId: string, itineraryId: string): 'TOURILLO' | 'TRAVEL_TRAIL_HOLIDAYS' => {
  const id = voucherId || itineraryId;
  if (id.startsWith('TRLC') || id.startsWith('TRL')) return 'TOURILLO';
  if (id.startsWith('TTHC') || id.startsWith('TTH')) return 'TRAVEL_TRAIL_HOLIDAYS';
  return 'TOURILLO';
};

export const VoucherList: React.FC<VoucherListProps> = ({ vouchers }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [companyFilter, setCompanyFilter] = useState<'ALL' | 'TOURILLO' | 'TRAVEL_TRAIL_HOLIDAYS'>('ALL');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Sorting states
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Date Range Filter States
  const [showDateRangeDialog, setShowDateRangeDialog] = useState(false);
  const [exportType, setExportType] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [applyDateFilter, setApplyDateFilter] = useState(false);

  const { user } = useAuthStore();
  const PAGE_SIZE = 10;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAdmin = useMemo(() => {
    if (!isMounted) return false;
    return user?.isAdmin || false;
  }, [user, isMounted]);

  // Statistics
  const stats = useMemo(() => {
    const tourilloCount = vouchers.filter(
      (v) => getCompanyFromId(v.voucherId, v.itineraryTravelId) === 'TOURILLO'
    ).length;
    const tthCount = vouchers.filter(
      (v) => getCompanyFromId(v.voucherId, v.itineraryTravelId) === 'TRAVEL_TRAIL_HOLIDAYS'
    ).length;

    return {
      total: vouchers.length,
      tourillo: tourilloCount,
      travelTrail: tthCount,
    };
  }, [vouchers]);

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

  // Filter and Sort Logic
  const filtered = useMemo(() => {
    let result = vouchers;

    // Company Filter
    if (companyFilter !== 'ALL') {
      result = result.filter((v) => getCompanyFromId(v.voucherId, v.itineraryTravelId) === companyFilter);
    }

    // Search Filter
    if (search.trim()) {
      result = result.filter((v) =>
        [
          v.voucherId,
          v.itineraryTravelId,
          v.clientName,
          v.itinerary.clientPhone,
          v.itinerary.packageTitle,
          v.itinerary.tripAdvisorName,
        ].some((val) => val?.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Date Range Filter
    if (applyDateFilter && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      result = result.filter((v) => {
        const itemDate = new Date(v.createdAt);
        return itemDate >= start && itemDate <= end;
      });
    }

    // Sorting
    if (sortField && sortDirection) {
      result = [...result].sort((a, b) => {
        let aVal: string | number;
        let bVal: string | number;

        if (sortField === 'company') {
          aVal = getCompanyFromId(a.voucherId, a.itineraryTravelId);
          bVal = getCompanyFromId(b.voucherId, b.itineraryTravelId);
        } else if (sortField === 'tripAdvisorName') {
          aVal = (a.itinerary.tripAdvisorName || '').toLowerCase();
          bVal = (b.itinerary.tripAdvisorName || '').toLowerCase();
        } else if (sortField === 'packageTitle') {
          aVal = a.itinerary.packageTitle.toLowerCase();
          bVal = b.itinerary.packageTitle.toLowerCase();
        } else if (sortField === 'createdAt') {
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
        } else {
          aVal = a[sortField];
          bVal = b[sortField];
        }

        if (typeof aVal === 'string' && sortField !== 'createdAt') {
          aVal = aVal.toLowerCase();
          bVal = (bVal as string).toLowerCase();
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [search, vouchers, companyFilter, applyDateFilter, startDate, endDate, sortField, sortDirection]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getDateFilteredData = (data: Voucher[]) => {
    if (!startDate || !endDate) return data;
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return data.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= start && itemDate <= end;
    });
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

  // ✅ Export to CSV - Complete Data with Hotel Stays
  const exportToCSV = (data: Voucher[]) => {
    const filteredData = getDateFilteredData(data);
    if (filteredData.length === 0) {
      toast.error('No data found in selected date range');
      return;
    }

    const maxHotels = Math.max(...filteredData.map((item) => item.hotelStays.length), 1);

    const headers = [
      'S.No',
      'Company',
      'Voucher ID',
      'Itinerary ID',
      'Client Name',
      'Client Phone',
      'Client Email',
      'Trip Advisor Name',
      'Trip Advisor Phone',
      'Package Title',
      'Adults',
      'Children',
      'Total Nights',
      ...Array.from({ length: maxHotels }, (_, i) => `Hotel ${i + 1} Name`),
      ...Array.from({ length: maxHotels }, (_, i) => `Hotel ${i + 1} Nights`),
      ...Array.from({ length: maxHotels }, (_, i) => `Hotel ${i + 1} From Date`),
      ...Array.from({ length: maxHotels }, (_, i) => `Hotel ${i + 1} To Date`),
      ...Array.from({ length: maxHotels }, (_, i) => `Hotel ${i + 1} Description`),
      'Created Date',
      'Updated Date',
    ];

    const csvContent = [
      headers.join(','),
      ...filteredData.map((item, index) => {
        const company = getCompanyFromId(item.voucherId, item.itineraryTravelId);
        const hotelStays = item.hotelStays || [];

        const hotelNames = Array.from({ length: maxHotels }, (_, i) => {
          const hotel = hotelStays[i];
          return hotel?.hotelName ? `"${hotel.hotelName.replace(/"/g, '""')}"` : '';
        });
        const hotelNights = Array.from({ length: maxHotels }, (_, i) => {
          const hotel = hotelStays[i];
          return hotel?.nights || '';
        });
        const hotelFromDates = Array.from({ length: maxHotels }, (_, i) => {
          const hotel = hotelStays[i];
          return hotel?.fromDate || '';
        });
        const hotelToDates = Array.from({ length: maxHotels }, (_, i) => {
          const hotel = hotelStays[i];
          return hotel?.toDate || '';
        });
        const hotelDescriptions = Array.from({ length: maxHotels }, (_, i) => {
          const hotel = hotelStays[i];
          return hotel?.description ? `"${hotel.description.replace(/"/g, '""')}"` : '';
        });

        return [
          index + 1,
          company === 'TOURILLO' ? 'TRL' : 'TTH',
          item.voucherId,
          item.itineraryTravelId,
          `"${item.clientName.replace(/"/g, '""')}"`,
          item.itinerary.clientPhone,
          item.itinerary.clientEmail || '',
          `"${(item.itinerary.tripAdvisorName || '').replace(/"/g, '""')}"`,
          item.itinerary.tripAdvisorNumber || '',
          `"${item.itinerary.packageTitle.replace(/"/g, '""')}"`,
          item.adultNo,
          item.childrenNo,
          item.totalNights,
          ...hotelNames,
          ...hotelNights,
          ...hotelFromDates,
          ...hotelToDates,
          ...hotelDescriptions,
          formatDate(item.createdAt),
          item.updatedAt ? formatDate(item.updatedAt) : formatDate(item.createdAt),
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];
    const filterLabel = companyFilter === 'ALL' ? 'all' : companyFilter === 'TOURILLO' ? 'tourillo' : 'traveltrail';
    const dateLabel = startDate && endDate ? `_${startDate}_to_${endDate}` : '';

    link.setAttribute('href', url);
    link.setAttribute('download', `vouchers_complete_${filterLabel}${dateLabel}_${timestamp}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${filteredData.length} vouchers exported to CSV with complete data!`);
  };

  // ✅ Export to Excel - Complete Data with Hotel Stays
  const exportToExcel = async (data: Voucher[]) => {
    const filteredData = getDateFilteredData(data);
    if (filteredData.length === 0) {
      toast.error('No data found in selected date range');
      return;
    }

    try {
      setIsExporting(true);
      const XLSX = await import('xlsx');

      const maxHotels = Math.max(...filteredData.map((item) => item.hotelStays.length), 1);

      const excelData = filteredData.map((item, index) => {
        const company = getCompanyFromId(item.voucherId, item.itineraryTravelId);
        const hotelStays = item.hotelStays || [];

        const row: any = {
          'S.No': index + 1,
          Company: company === 'TOURILLO' ? 'TRL' : 'TTH',
          'Voucher ID': item.voucherId,
          'Itinerary ID': item.itineraryTravelId,
          'Client Name': item.clientName,
          'Client Phone': item.itinerary.clientPhone,
          'Client Email': item.itinerary.clientEmail || '',
          'Trip Advisor Name': item.itinerary.tripAdvisorName || 'N/A',
          'Trip Advisor Phone': item.itinerary.tripAdvisorNumber || 'N/A',
          'Package Title': item.itinerary.packageTitle,
          Adults: item.adultNo,
          Children: item.childrenNo,
          'Total Nights': item.totalNights,
        };

        for (let i = 0; i < maxHotels; i++) {
          const hotel = hotelStays[i];
          row[`Hotel ${i + 1} Name`] = hotel?.hotelName || '';
          row[`Hotel ${i + 1} Nights`] = hotel?.nights || '';
          row[`Hotel ${i + 1} From Date`] = hotel?.fromDate || '';
          row[`Hotel ${i + 1} To Date`] = hotel?.toDate || '';
          row[`Hotel ${i + 1} Description`] = hotel?.description || '';
        }

        row['Created Date'] = formatDate(item.createdAt);
        row['Updated Date'] = item.updatedAt ? formatDate(item.updatedAt) : formatDate(item.createdAt);

        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Vouchers Complete');

      const columnWidths = [
        { wch: 6 },
        { wch: 10 },
        { wch: 25 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 25 },
        { wch: 20 },
        { wch: 15 },
        { wch: 30 },
        { wch: 8 },
        { wch: 8 },
        { wch: 12 },
        ...Array.from({ length: maxHotels * 5 }, () => ({ wch: 25 })),
        { wch: 15 },
        { wch: 15 },
      ];
      worksheet['!cols'] = columnWidths;

      const timestamp = new Date().toISOString().split('T')[0];
      const filterLabel = companyFilter === 'ALL' ? 'all' : companyFilter === 'TOURILLO' ? 'tourillo' : 'traveltrail';
      const dateLabel = startDate && endDate ? `_${startDate}_to_${endDate}` : '';

      XLSX.writeFile(workbook, `vouchers_complete_${filterLabel}${dateLabel}_${timestamp}.xlsx`);
      toast.success(`${filteredData.length} vouchers exported to Excel with complete data!`);
    } catch (error) {
      toast.error('Failed to export to Excel');
      console.error('Excel export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // ✅ Export to PDF - Summary + Details
  const exportToPDF = async (data: Voucher[]) => {
    const filteredData = getDateFilteredData(data);
    if (filteredData.length === 0) {
      toast.error('No data found in selected date range');
      return;
    }

    try {
      setIsExporting(true);
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF({ orientation: 'landscape' });
      const timestamp = new Date().toLocaleDateString('en-IN');
      const filterLabel =
        companyFilter === 'ALL'
          ? 'All Companies'
          : companyFilter === 'TOURILLO'
            ? 'Tourillo (TRL)'
            : 'Travel Trail Holidays (TTH)';

      doc.setFontSize(18);
      doc.setTextColor(99, 102, 241);
      doc.text('Complete Voucher Report', 14, 15);

      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      let subtitle = `Filter: ${filterLabel} | Total: ${filteredData.length} | Generated: ${timestamp}`;
      if (startDate && endDate) {
        subtitle += `\nDate Range: ${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}`;
      }
      doc.text(subtitle, 14, 24);

      const summaryData = filteredData.map((item, index) => {
        const company = getCompanyFromId(item.voucherId, item.itineraryTravelId);
        return [
          index + 1,
          company === 'TOURILLO' ? 'TRL' : 'TTH',
          item.voucherId,
          item.clientName,
          item.itinerary.tripAdvisorName || '-',
          item.itinerary.packageTitle.substring(0, 25) + '...',
          `${item.adultNo}A/${item.childrenNo}C`,
          `${item.totalNights}N`,
          item.hotelStays.length,
          formatDate(item.createdAt),
        ];
      });

      autoTable(doc, {
        head: [['#', 'Co.', 'Voucher ID', 'Client', 'Agent', 'Package', 'Guests', 'Nights', 'Hotels', 'Created']],
        body: summaryData,
        startY: startDate && endDate ? 34 : 30,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { halign: 'center', cellWidth: 8 },
        },
      });

      filteredData.forEach((item, index) => {
        doc.addPage();

        const company = getCompanyFromId(item.voucherId, item.itineraryTravelId);

        doc.setFontSize(14);
        doc.setTextColor(99, 102, 241);
        doc.text(`${index + 1}. ${item.voucherId} - ${item.clientName}`, 14, 15);

        let yPos = 25;
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);

        const details = [
          ['Company:', company === 'TOURILLO' ? 'Tourillo (TRL)' : 'Travel Trail Holidays (TTH)'],
          ['Voucher ID:', item.voucherId],
          ['Itinerary ID:', item.itineraryTravelId],
          ['Client Name:', item.clientName],
          ['Client Phone:', item.itinerary.clientPhone],
          ['Client Email:', item.itinerary.clientEmail || 'N/A'],
          [
            'Trip Advisor:',
            `${item.itinerary.tripAdvisorName || 'N/A'} (${item.itinerary.tripAdvisorNumber || 'N/A'})`,
          ],
          ['Package:', item.itinerary.packageTitle],
          ['Adults:', `${item.adultNo}`],
          ['Children:', `${item.childrenNo}`],
          ['Total Nights:', `${item.totalNights}`],
          ['Created:', formatDate(item.createdAt)],
          ['Updated:', item.updatedAt ? formatDate(item.updatedAt) : formatDate(item.createdAt)],
        ];

        details.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold');
          doc.text(label, 14, yPos);
          doc.setFont('helvetica', 'normal');
          const lines = doc.splitTextToSize(String(value), 230);
          doc.text(lines, 60, yPos);
          yPos += lines.length * 5;
        });

        if (item.hotelStays && item.hotelStays.length > 0) {
          if (yPos > 160) {
            doc.addPage();
            yPos = 20;
          }
          yPos += 5;
          doc.setFont('helvetica', 'bold');
          doc.text('Hotel Stays:', 14, yPos);
          yPos += 7;
          doc.setFont('helvetica', 'normal');

          item.hotelStays.forEach((hotel, hotelIdx) => {
            if (yPos > 180) {
              doc.addPage();
              yPos = 20;
            }
            const nightsText = hotel.nights > 0 ? `${hotel.nights} Night${hotel.nights > 1 ? 's' : ''}` : 'N/A';
            const hotelText = `${hotelIdx + 1}. ${hotel.hotelName} - ${nightsText} (${hotel.fromDate} to ${hotel.toDate})`;
            const hotelLines = doc.splitTextToSize(hotelText, 260);
            doc.text(hotelLines, 14, yPos);
            yPos += hotelLines.length * 4;

            if (hotel.description) {
              const descLines = doc.splitTextToSize(`Description: ${hotel.description}`, 260);
              doc.text(descLines, 18, yPos);
              yPos += descLines.length * 4;
            }

            yPos += 2;
          });
        } else {
          yPos += 5;
          doc.setFont('helvetica', 'bold');
          doc.text('Hotel Stays:', 14, yPos);
          yPos += 7;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(59, 130, 246);
          doc.text('No Hotels', 14, yPos);
          doc.setTextColor(0, 0, 0);
          yPos += 7;
        }
      });

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

      const filterLabel2 = companyFilter === 'ALL' ? 'all' : companyFilter === 'TOURILLO' ? 'tourillo' : 'traveltrail';
      const dateStr = new Date().toISOString().split('T')[0];
      const dateLabel = startDate && endDate ? `_${startDate}_to_${endDate}` : '';

      doc.save(`vouchers_complete_${filterLabel2}${dateLabel}_${dateStr}.pdf`);
      toast.success(`${filteredData.length} vouchers exported to PDF with complete details!`);
    } catch (error) {
      toast.error('Failed to export to PDF');
      console.error('PDF export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportClick = (type: 'csv' | 'excel' | 'pdf') => {
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

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setApplyDateFilter(false);
  };

  const clearAllFilters = () => {
    setSearch('');
    setCompanyFilter('ALL');
    setStartDate('');
    setEndDate('');
    setApplyDateFilter(false);
    setSortField(null);
    setSortDirection(null);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteId || !isAdmin) {
      toast.error('Only administrators can delete vouchers');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteVoucher(deleteId);
      toast.success('Voucher deleted successfully!');
      setDeleteId(null);
      setShowDeleteDialog(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete voucher');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyVoucherId = (voucherId: string) => {
    navigator.clipboard.writeText(voucherId);
    toast.success('Voucher ID copied to clipboard!');
  };

  const openDeleteDialog = (id: string) => {
    if (!isMounted) return;
    if (!isAdmin) {
      toast.error('Only administrators can delete vouchers');
      return;
    }
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const hasActiveFilters = companyFilter !== 'ALL' || search.trim() || applyDateFilter;

  return (
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
              placeholder="Search by Voucher ID, Itinerary ID, client, agent, phone, or package..."
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
            {/* Company Filter Buttons */}
            <Button
              size="sm"
              variant={companyFilter === 'ALL' ? 'default' : 'outline'}
              onClick={() => {
                setCompanyFilter('ALL');
                setPage(1);
              }}
              className={`cursor-pointer rounded h-9 ${companyFilter === 'ALL' ? 'bg-sky-500 hover:bg-sky-600' : ''}`}
            >
              All Vouchers <span className="ml-1 text-xs opacity-80">({stats.total})</span>
            </Button>
            <Button
              size="sm"
              variant={companyFilter === 'TOURILLO' ? 'default' : 'outline'}
              onClick={() => {
                setCompanyFilter('TOURILLO');
                setPage(1);
              }}
              className={`cursor-pointer rounded h-9 ${companyFilter === 'TOURILLO' ? 'bg-purple-500 hover:bg-purple-600' : ''}`}
            >
              Tourillo <span className="ml-1 text-xs opacity-80">({stats.tourillo})</span>
            </Button>
            <Button
              size="sm"
              variant={companyFilter === 'TRAVEL_TRAIL_HOLIDAYS' ? 'default' : 'outline'}
              onClick={() => {
                setCompanyFilter('TRAVEL_TRAIL_HOLIDAYS');
                setPage(1);
              }}
              className={`cursor-pointer rounded h-9 ${companyFilter === 'TRAVEL_TRAIL_HOLIDAYS' ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
            >
              Travel Trail <span className="ml-1 text-xs opacity-80">({stats.travelTrail})</span>
            </Button>
          </div>

          {/* Clear Filters Button */}
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
              <Building2 className="h-4 w-4 text-purple-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Tourillo (TRL)</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.tourillo}</p>
          </div>

          <div className="px-4 py-3 bg-linear-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Travel Trail (TTH)</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.travelTrail}</p>
          </div>

          <div className="px-4 py-3 bg-linear-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded">
            <div className="flex items-center gap-2 mb-1">
              <PackageIcon className="h-4 w-4 text-green-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Total Vouchers</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.total}</p>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
            <span>
              Showing {filtered.length} of {stats.total} vouchers
            </span>
            {companyFilter !== 'ALL' && (
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded text-purple-700 dark:text-purple-300">
                {companyFilter === 'TOURILLO' ? 'Tourillo' : 'Travel Trail Holidays'}
              </span>
            )}
            {applyDateFilter && startDate && endDate && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <CalendarIcon className="h-3 w-3" />
                {formatDisplayDate(startDate)} to {formatDisplayDate(endDate)}
                <button
                  onClick={clearDateFilter}
                  className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700 scrollbar-visible">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[100px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('company')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Company
                  <SortIcon field="company" />
                </div>
              </TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[200px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('voucherId')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Voucher ID
                  <SortIcon field="voucherId" />
                </div>
              </TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[150px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('itineraryTravelId')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Itinerary ID
                  <SortIcon field="itineraryTravelId" />
                </div>
              </TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[140px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('clientName')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Client
                  <SortIcon field="clientName" />
                </div>
              </TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[140px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('tripAdvisorName')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Agent
                  <SortIcon field="tripAdvisorName" />
                </div>
              </TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[180px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('packageTitle')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Package
                  <SortIcon field="packageTitle" />
                </div>
              </TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[100px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('adultNo')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Guests
                  <SortIcon field="adultNo" />
                </div>
              </TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('totalNights')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Details
                  <SortIcon field="totalNights" />
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
              <TableHead className="font-bold text-gray-700 dark:text-gray-300 text-right min-w-[120px] sticky right-0 bg-gray-50 dark:bg-gray-800 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {search || companyFilter !== 'ALL' || applyDateFilter
                        ? 'No vouchers found matching your filters'
                        : 'No vouchers found'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {pageData.map((voucher) => {
              const company = getCompanyFromId(voucher.voucherId, voucher.itineraryTravelId);
              return (
                <TableRow key={voucher.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  {/* Company */}
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                        company === 'TOURILLO'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}
                    >
                      <Building2 className="h-3 w-3" />
                      {company === 'TOURILLO' ? 'TRL' : 'TTH'}
                    </span>
                  </TableCell>

                  {/* Voucher ID */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-green-600 dark:text-green-400 text-sm">
                        {voucher.voucherId}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyVoucherId(voucher.voucherId)}
                        className="h-7 w-7 cursor-pointer rounded"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>

                  {/* Itinerary ID */}
                  <TableCell>
                    <span className="font-mono text-sm text-purple-600 dark:text-purple-400">
                      {voucher.itineraryTravelId}
                    </span>
                  </TableCell>

                  {/* Client */}
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">{voucher.clientName}</p>
                      <p className="text-xs text-gray-500">{voucher.itinerary.clientPhone}</p>
                    </div>
                  </TableCell>

                  {/* Agent */}
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-indigo-600 dark:text-indigo-400">
                        {voucher.itinerary.tripAdvisorName || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {voucher.itinerary.tripAdvisorNumber || '-'}
                      </p>
                    </div>
                  </TableCell>

                  {/* Package */}
                  <TableCell className="max-w-xs">
                    <p className="font-medium truncate text-sm">{voucher.itinerary.packageTitle}</p>
                  </TableCell>

                  {/* Guests */}
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-semibold text-blue-600 dark:text-blue-400 text-sm">
                        {voucher.adultNo}A{voucher.childrenNo > 0 && ` / ${voucher.childrenNo}C`}
                      </p>
                    </div>
                  </TableCell>

                  {/* Details */}
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-semibold text-sm">
                          {voucher.totalNights > 1 ? `${voucher.totalNights} Nights` : `${voucher.totalNights} Night`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Hotel className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs">
                          {voucher.hotelStays.length === 0 ? (
                            <span className="text-blue-600 dark:text-blue-400 font-medium">No Hotels</span>
                          ) : (
                            <span className="font-semibold">{voucher.hotelStays.length}</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Created */}
                  <TableCell>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{formatDate(voucher.createdAt)}</p>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="sticky right-0 bg-white dark:bg-gray-900 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/admin/voucher/edit-voucher/${voucher.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 cursor-pointer rounded" title="Edit">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                      </Link>
                      <Link href={`/voucher/view/${voucher.id}`} target="_blank">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 cursor-pointer rounded" title="View">
                          <Eye className="h-4 w-4 text-green-600" />
                        </Button>
                      </Link>
                      {isMounted && isAdmin && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDeleteDialog(voucher.id)}
                          className="h-8 w-8 p-0 cursor-pointer rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {totalPages > 0 ? page : 0} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            disabled={page === 1}
            size="sm"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            variant="outline"
            className="cursor-pointer rounded"
          >
            Previous
          </Button>
          <Button
            disabled={page === totalPages || totalPages === 0}
            size="sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            variant="outline"
            className="cursor-pointer rounded"
          >
            Next
          </Button>
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
            <DialogDescription>Choose to export all filtered data or select a specific date range.</DialogDescription>
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
                className="w-full flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-linear-to-r from-green-500 to-emerald-600 rounded-full">
                    <Download className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-base group-hover:text-purple-600 transition">
                      Export All Filtered Data
                    </p>
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
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Select Custom Date Range</p>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  From Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={formatDateForInput(new Date())}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 bg-background cursor-pointer"
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
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 bg-background disabled:opacity-50 cursor-pointer"
                />
              </div>

              {startDate && endDate && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
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
              className="rounded cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={executeExport}
              disabled={!startDate || !endDate}
              className="bg-linear-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 rounded cursor-pointer"
            >
              Export Date Range
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Voucher?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this voucher? This action cannot be undone and all associated data will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteId(null)}
              disabled={isDeleting}
              className="rounded cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 rounded cursor-pointer"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VoucherList;
