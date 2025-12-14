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
  User,
  Package as PackageIcon,
  Edit,
  Building2,
  Filter,
  Download,
  FileText,
  Sheet,
  File,
  CalendarIcon,
  X,
} from 'lucide-react';
import { deleteItinerary } from '@/lib/actions/itinerary-actions';
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

export interface Itinerary {
  id: string;
  travelId: string;
  company: 'TOURILLO' | 'TRAVEL_TRAIL_HOLIDAYS';
  clientName: string;
  clientPhone: string;
  clientEmail?: string | null;
  packageTitle: string;
  numberOfDays: number;
  numberOfNights: number;
  quotePrice: number;
  pricePerPerson: number;
  createdAt: string;
}

interface ItineraryListProps {
  itineraries: Itinerary[];
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Format date for input field (YYYY-MM-DD)
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format price
const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const LoadingSpinner = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const ItineraryList: React.FC<ItineraryListProps> = ({ itineraries }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [companyFilter, setCompanyFilter] = useState<'ALL' | 'TOURILLO' | 'TRAVEL_TRAIL_HOLIDAYS'>('ALL');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // ✅ Date Range Filter States
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

  const stats = useMemo(() => {
    const tourilloCount = itineraries.filter((i) => i.company === 'TOURILLO').length;
    const tthCount = itineraries.filter((i) => i.company === 'TRAVEL_TRAIL_HOLIDAYS').length;

    return {
      total: itineraries.length,
      tourillo: tourilloCount,
      travelTrail: tthCount,
    };
  }, [itineraries]);

  // ✅ Filter by company, search, and date range
  const filtered = useMemo(() => {
    let result = itineraries;

    // Apply company filter
    if (companyFilter !== 'ALL') {
      result = result.filter((i) => i.company === companyFilter);
    }

    // Apply search filter
    if (search.trim()) {
      result = result.filter((i) =>
        [i.travelId, i.clientName, i.clientPhone, i.packageTitle].some((v) =>
          v?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    // Apply date range filter (for display only, not export)
    if (applyDateFilter && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include full end date

      result = result.filter((i) => {
        const itemDate = new Date(i.createdAt);
        return itemDate >= start && itemDate <= end;
      });
    }

    return result;
  }, [search, itineraries, companyFilter, applyDateFilter, startDate, endDate]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ✅ Filter data by date range for export
  const getDateFilteredData = (data: Itinerary[]) => {
    if (!startDate || !endDate) {
      return data;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return data.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= start && itemDate <= end;
    });
  };

  // ✅ Export to CSV
  const exportToCSV = (data: Itinerary[]) => {
    const filteredData = getDateFilteredData(data);

    if (filteredData.length === 0) {
      toast.error('No data found in selected date range');
      return;
    }

    const headers = [
      'Company',
      'Travel ID',
      'Client Name',
      'Client Phone',
      'Client Email',
      'Package Title',
      'Days',
      'Nights',
      'Quote Price (₹)',
      'Price Per Person (₹)',
      'Created Date',
    ];

    const csvContent = [
      headers.join(','),
      ...filteredData.map((item) =>
        [
          item.company === 'TOURILLO' ? 'TRL' : 'TTH',
          item.travelId,
          `"${item.clientName}"`,
          item.clientPhone,
          item.clientEmail || '',
          `"${item.packageTitle}"`,
          item.numberOfDays,
          item.numberOfNights,
          item.quotePrice,
          item.pricePerPerson,
          formatDate(item.createdAt),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().split('T')[0];
    const filterLabel = companyFilter === 'ALL' ? 'all' : companyFilter === 'TOURILLO' ? 'tourillo' : 'traveltrail';
    const dateLabel = startDate && endDate ? `_${startDate}_to_${endDate}` : '';

    link.setAttribute('href', url);
    link.setAttribute('download', `itineraries_${filterLabel}${dateLabel}_${timestamp}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${filteredData.length} itineraries exported to CSV!`);
  };

  // ✅ Export to Excel
  const exportToExcel = async (data: Itinerary[]) => {
    const filteredData = getDateFilteredData(data);

    if (filteredData.length === 0) {
      toast.error('No data found in selected date range');
      return;
    }

    try {
      setIsExporting(true);
      const XLSX = await import('xlsx');

      const excelData = filteredData.map((item) => ({
        Company: item.company === 'TOURILLO' ? 'TRL' : 'TTH',
        'Travel ID': item.travelId,
        'Client Name': item.clientName,
        'Client Phone': item.clientPhone,
        'Client Email': item.clientEmail || '',
        'Package Title': item.packageTitle,
        Days: item.numberOfDays,
        Nights: item.numberOfNights,
        'Quote Price (₹)': item.quotePrice,
        'Price Per Person (₹)': item.pricePerPerson,
        'Created Date': formatDate(item.createdAt),
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Itineraries');

      const columnWidths = [
        { wch: 10 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 25 },
        { wch: 30 },
        { wch: 8 },
        { wch: 8 },
        { wch: 15 },
        { wch: 18 },
        { wch: 20 },
      ];
      worksheet['!cols'] = columnWidths;

      const timestamp = new Date().toISOString().split('T')[0];
      const filterLabel = companyFilter === 'ALL' ? 'all' : companyFilter === 'TOURILLO' ? 'tourillo' : 'traveltrail';
      const dateLabel = startDate && endDate ? `_${startDate}_to_${endDate}` : '';

      XLSX.writeFile(workbook, `itineraries_${filterLabel}${dateLabel}_${timestamp}.xlsx`);
      toast.success(`${filteredData.length} itineraries exported to Excel!`);
    } catch (error) {
      toast.error('Failed to export to Excel');
      console.error('Excel export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // ✅ Export to PDF
  const exportToPDF = async (data: Itinerary[]) => {
    const filteredData = getDateFilteredData(data);

    if (filteredData.length === 0) {
      toast.error('No data found in selected date range');
      return;
    }

    try {
      setIsExporting(true);

      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      const timestamp = new Date().toLocaleDateString('en-IN');
      const filterLabel =
        companyFilter === 'ALL'
          ? 'All Companies'
          : companyFilter === 'TOURILLO'
            ? 'Tourillo (TRL)'
            : 'Travel Trail Holidays (TTH)';

      // Title
      doc.setFontSize(16);
      doc.text('Itinerary Report', 14, 15);

      // Subtitle with date range
      doc.setFontSize(10);
      let subtitle = `Filter: ${filterLabel} | Generated: ${timestamp}`;
      if (startDate && endDate) {
        subtitle += `\nDate Range: ${startDate} to ${endDate}`;
      }
      doc.text(subtitle, 14, 22);

      const tableData = filteredData.map((item) => [
        item.company === 'TOURILLO' ? 'TRL' : 'TTH',
        item.travelId,
        item.clientName,
        item.clientPhone,
        item.packageTitle,
        `${item.numberOfNights}N/${item.numberOfDays}D`,
        formatPrice(item.quotePrice),
        formatDate(item.createdAt),
      ]);

      autoTable(doc, {
        head: [['Company', 'Travel ID', 'Client Name', 'Phone', 'Package', 'Duration', 'Price', 'Created']],
        body: tableData,
        startY: startDate && endDate ? 32 : 28,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
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

      doc.save(`itineraries_${filterLabel2}${dateLabel}_${dateStr}.pdf`);
      toast.success(`${filteredData.length} itineraries exported to PDF!`);
    } catch (error) {
      toast.error('Failed to export to PDF');
      console.error('PDF export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // ✅ Handle export with date range dialog
  const handleExportClick = (type: 'csv' | 'excel' | 'pdf') => {
    setExportType(type);
    setShowDateRangeDialog(true);
  };

  // ✅ Execute export after date selection
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

      // Reset date filters after export
      setStartDate('');
      setEndDate('');
    }, 100);
  };

  // ✅ Clear date filter
  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setApplyDateFilter(false);
  };

  const handleDelete = async () => {
    if (!deleteId || !isAdmin) {
      toast.error('Only administrators can delete itineraries');
      return;
    }

    setIsDeleting(true);
    try {
      await deleteItinerary(deleteId);
      toast.success('Itinerary deleted successfully!');
      setDeleteId(null);
      setShowDeleteDialog(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete itinerary');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyTravelId = (travelId: string) => {
    navigator.clipboard.writeText(travelId);
    toast.success('Travel ID copied to clipboard!');
  };

  const openDeleteDialog = (id: string) => {
    if (!isMounted) return;

    if (!isAdmin) {
      toast.error('Only administrators can delete itineraries');
      return;
    }
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  return (
    <div className="rounded-sm bg-foreground shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Search, Filter and Stats */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-sm border-2 border-gray-300 dark:border-gray-600 bg-background focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              placeholder="Search by Travel ID, client name, phone, or package..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>

          {/* Company Filter Buttons + Export */}
          <div className="flex gap-2 items-center flex-wrap">
            <Filter className="h-4 w-4 text-gray-400" />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={companyFilter === 'ALL' ? 'default' : 'outline'}
                onClick={() => {
                  setCompanyFilter('ALL');
                  setPage(1);
                }}
                className={`cursor-pointer ${companyFilter === 'ALL' ? 'bg-sky-500 hover:bg-sky-600' : ''}`}
              >
                All ({stats.total})
              </Button>
              <Button
                size="sm"
                variant={companyFilter === 'TOURILLO' ? 'default' : 'outline'}
                onClick={() => {
                  setCompanyFilter('TOURILLO');
                  setPage(1);
                }}
                className={`cursor-pointer ${companyFilter === 'TOURILLO' ? 'bg-purple-500 hover:bg-purple-600' : ''}`}
              >
                Tourillo ({stats.tourillo})
              </Button>
              <Button
                size="sm"
                variant={companyFilter === 'TRAVEL_TRAIL_HOLIDAYS' ? 'default' : 'outline'}
                onClick={() => {
                  setCompanyFilter('TRAVEL_TRAIL_HOLIDAYS');
                  setPage(1);
                }}
                className={`cursor-pointer ${
                  companyFilter === 'TRAVEL_TRAIL_HOLIDAYS' ? 'bg-blue-500 hover:bg-blue-600' : ''
                }`}
              >
                Travel Trail ({stats.travelTrail})
              </Button>
            </div>

            {/* ✅ Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="default"
                  disabled={filtered.length === 0 || isExporting}
                  className="bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 cursor-pointer"
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
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="px-4 py-3 bg-linear-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-sm">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-purple-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Tourillo (TRL)</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.tourillo}</p>
          </div>

          <div className="px-4 py-3 bg-linear-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-sm">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Travel Trail (TTH)</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.travelTrail}</p>
          </div>

          <div className="px-4 py-3 bg-linear-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-sm">
            <div className="flex items-center gap-2 mb-1">
              <PackageIcon className="h-4 w-4 text-green-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Total Itineraries</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.total}</p>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {(companyFilter !== 'ALL' || search.trim() || applyDateFilter) && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
            <span>
              Showing {filtered.length} of {stats.total} itineraries
            </span>
            {companyFilter !== 'ALL' && (
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded text-purple-700 dark:text-purple-300">
                {companyFilter === 'TOURILLO' ? 'Tourillo' : 'Travel Trail Holidays'}
              </span>
            )}
            {applyDateFilter && startDate && endDate && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <CalendarIcon className="h-3 w-3" />
                {startDate} to {endDate}
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

      {/* Table - Same as before */}
      <div className="overflow-x-auto rounded-sm border border-gray-200 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              <TableHead className="text-primary font-bold">Company</TableHead>
              <TableHead className="text-primary font-bold">Travel ID</TableHead>
              <TableHead className="text-primary font-bold">Client Details</TableHead>
              <TableHead className="text-primary font-bold">Package</TableHead>
              <TableHead className="text-primary font-bold">Duration</TableHead>
              <TableHead className="text-primary font-bold">Pricing</TableHead>
              <TableHead className="text-primary font-bold">Created</TableHead>
              <TableHead className="text-primary font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <PackageIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {search || companyFilter !== 'ALL' || applyDateFilter
                        ? 'No itineraries found matching your filters'
                        : 'No itineraries found'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {pageData.map((itinerary) => (
              <TableRow key={itinerary.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                      itinerary.company === 'TOURILLO'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    <Building2 className="h-3 w-3" />
                    {itinerary.company === 'TOURILLO' ? 'TRL' : 'TTH'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                      {itinerary.travelId}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyTravelId(itinerary.travelId)}
                      title="Copy Travel ID"
                      className="h-7 w-7 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      {itinerary.clientName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{itinerary.clientPhone}</p>
                    {itinerary.clientEmail && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                        {itinerary.clientEmail}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="font-medium truncate" title={itinerary.packageTitle}>
                    {itinerary.packageTitle}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-semibold">
                      {itinerary.numberOfNights}N / {itinerary.numberOfDays}D
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-bold text-green-600 dark:text-green-400">{formatPrice(itinerary.quotePrice)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatPrice(itinerary.pricePerPerson)}/person
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(itinerary.createdAt)}</p>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    <Link href={`/admin/itinerary/edit-itinerary/${itinerary.travelId}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Edit Itinerary"
                        className="hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                    </Link>
                    <Link href={`/itinerary/view/${itinerary.travelId}`} target="_blank">
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Open Itinerary"
                        className="hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer"
                      >
                        <Eye className="h-4 w-4 text-green-600" />
                      </Button>
                    </Link>
                    {isMounted && isAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDeleteDialog(itinerary.id)}
                        title="Delete (Admin Only)"
                        className="hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Showing {pageData.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0} to{' '}
          {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} results
        </span>
        <div className="flex gap-2">
          <Button disabled={page === 1} size="sm" onClick={() => setPage((p) => Math.max(p - 1, 1))} variant="outline">
            Previous
          </Button>
          <div className="flex items-center gap-2 px-3">
            <span className="text-sm font-medium">
              Page {page} of {totalPages || 1}
            </span>
          </div>
          <Button
            disabled={page === totalPages || totalPages === 0}
            size="sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>

      {/* ✅ Date Range Dialog for Export */}
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
            {/* ✅ Export All Option */}
            <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-sm hover:border-purple-500 transition">
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">Export all {filtered.length} itineraries</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">
                  {filtered.length}
                </div>
              </button>
            </div>

            {/* ✅ Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-gray-500 dark:text-gray-400">OR</span>
              </div>
            </div>

            {/* ✅ Date Range Selection */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Select Custom Date Range</p>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  From Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={formatDateForInput(new Date())}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-background"
                  placeholder="Select start date"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  To Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={formatDateForInput(new Date())}
                  disabled={!startDate}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Select end date"
                />
                {!startDate && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">⚠️ Please select start date first</p>
                )}
              </div>

              {/* ✅ Date Range Preview */}
              {startDate && endDate && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-sm border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      <strong>{startDate}</strong> to <strong>{endDate}</strong>
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
              className="bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Date Range
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Itinerary?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this itinerary? This action cannot be undone and all associated data will
              be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)} disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting && (
                <span className="mr-2">
                  <LoadingSpinner />
                </span>
              )}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ItineraryList;
