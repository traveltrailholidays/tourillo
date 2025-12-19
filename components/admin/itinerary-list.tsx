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
  Package as PackageIcon,
  Edit,
  Building2,
  Download,
  FileText,
  Sheet,
  File,
  CalendarIcon,
  X,
  UserCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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

// ✅ Complete Interface with all DB fields
export interface Itinerary {
  id: string;
  travelId: string;
  company: 'TOURILLO' | 'TRAVEL_TRAIL_HOLIDAYS';
  clientName: string;
  clientPhone: string;
  clientEmail?: string | null;
  tripAdvisorName?: string | null;
  tripAdvisorNumber?: string | null;
  packageTitle: string;
  numberOfDays: number;
  numberOfNights: number;
  numberOfHotels: number;
  cabs: string;
  flights: string;
  quotePrice: number;
  pricePerPerson: number;
  days: any; // JSON
  hotels: any; // JSON
  inclusions: any; // JSON
  exclusions: any; // JSON
  createdAt: string;
  updatedAt: string;
}

interface ItineraryListProps {
  itineraries: Itinerary[];
}

type SortField =
  | 'company'
  | 'travelId'
  | 'clientName'
  | 'tripAdvisorName'
  | 'packageTitle'
  | 'numberOfDays'
  | 'numberOfNights'
  | 'quotePrice'
  | 'pricePerPerson'
  | 'createdAt';

type SortDirection = 'asc' | 'desc' | null;

// Helper to format full date objects to dd/mm/yyyy
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper to format input string (YYYY-MM-DD) to Display (dd/mm/yyyy)
const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

// Format date for input field
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
  const [agentFilter, setAgentFilter] = useState<string>('ALL');
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

  const stats = useMemo(() => {
    const tourilloCount = itineraries.filter((i) => i.company === 'TOURILLO').length;
    const tthCount = itineraries.filter((i) => i.company === 'TRAVEL_TRAIL_HOLIDAYS').length;

    return {
      total: itineraries.length,
      tourillo: tourilloCount,
      travelTrail: tthCount,
    };
  }, [itineraries]);

  // Extract unique agents with counts
  const agentOptions = useMemo(() => {
    const counts: Record<string, number> = {};

    itineraries.forEach((i) => {
      const name = i.tripAdvisorName;
      if (name) {
        counts[name] = (counts[name] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [itineraries]);

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
    let result = itineraries;

    // Company Filter
    if (companyFilter !== 'ALL') {
      result = result.filter((i) => i.company === companyFilter);
    }

    // Agent Filter
    if (agentFilter !== 'ALL') {
      result = result.filter((i) => i.tripAdvisorName === agentFilter);
    }

    // Search Filter
    if (search.trim()) {
      result = result.filter((i) =>
        [i.travelId, i.clientName, i.clientPhone, i.packageTitle, i.tripAdvisorName].some((v) =>
          v?.toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    // Date Range Filter
    if (applyDateFilter && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      result = result.filter((i) => {
        const itemDate = new Date(i.createdAt);
        return itemDate >= start && itemDate <= end;
      });
    }

    // Sorting
    if (sortField && sortDirection) {
      result = [...result].sort((a, b) => {
        let aVal: string | number;
        let bVal: string | number;

        if (sortField === 'tripAdvisorName') {
          aVal = (a.tripAdvisorName || '').toLowerCase();
          bVal = (b.tripAdvisorName || '').toLowerCase();
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
  }, [search, itineraries, companyFilter, agentFilter, applyDateFilter, startDate, endDate, sortField, sortDirection]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getDateFilteredData = (data: Itinerary[]) => {
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

  // ✅ Export to CSV - Complete Data with CORRECT DB Fields
  const exportToCSV = (data: Itinerary[]) => {
    const filteredData = getDateFilteredData(data);
    if (filteredData.length === 0) {
      toast.error('No data found in selected date range');
      return;
    }

    const maxDays = Math.max(...filteredData.map((item) => (Array.isArray(item.days) ? item.days.length : 0)), 1);
    const maxHotels = Math.max(...filteredData.map((item) => (Array.isArray(item.hotels) ? item.hotels.length : 0)), 1);

    const headers = [
      'S.No',
      'Itinerary ID',
      'Company',
      'Client Name',
      'Client Phone',
      'Client Email',
      'Trip Advisor Name',
      'Trip Advisor Phone',
      'Package Title',
      'Number of Days',
      'Number of Nights',
      'Number of Hotels',
      'Cabs',
      'Flights',
      'Quote Price (₹)',
      'Price Per Person (₹)',
      ...Array.from({ length: maxDays }, (_, i) => `Day ${i + 1} Summary`),
      ...Array.from({ length: maxDays }, (_, i) => `Day ${i + 1} Description`),
      ...Array.from({ length: maxDays }, (_, i) => `Day ${i + 1} Image`),
      ...Array.from({ length: maxHotels }, (_, i) => `Hotel ${i + 1} Name`),
      ...Array.from({ length: maxHotels }, (_, i) => `Hotel ${i + 1} Place Name`),
      ...Array.from({ length: maxHotels }, (_, i) => `Hotel ${i + 1} Room Type`),
      ...Array.from({ length: maxHotels }, (_, i) => `Hotel ${i + 1} Description`),
      ...Array.from({ length: maxHotels }, (_, i) => `Hotel ${i + 1} Place Description`),
      'Inclusions',
      'Exclusions',
      'Created Date',
      'Updated Date',
    ];

    const csvContent = [
      headers.join(','),
      ...filteredData.map((item, index) => {
        const daysArray = Array.isArray(item.days) ? item.days : [];
        const hotelsArray = Array.isArray(item.hotels) ? item.hotels : [];
        const inclusionsArray = Array.isArray(item.inclusions) ? item.inclusions : [];
        const exclusionsArray = Array.isArray(item.exclusions) ? item.exclusions : [];

        const daysSummaries = Array.from({ length: maxDays }, (_, i) => {
          const day = daysArray[i];
          return day?.summary ? `"${day.summary.replace(/"/g, '""')}"` : '';
        });
        const daysDescriptions = Array.from({ length: maxDays }, (_, i) => {
          const day = daysArray[i];
          return day?.description ? `"${day.description.replace(/"/g, '""')}"` : '';
        });
        const daysImages = Array.from({ length: maxDays }, (_, i) => {
          const day = daysArray[i];
          return day?.imageSrc ? `"${day.imageSrc.replace(/"/g, '""')}"` : '';
        });

        const hotelsNames = Array.from({ length: maxHotels }, (_, i) => {
          const hotel = hotelsArray[i];
          return hotel?.hotelName ? `"${hotel.hotelName.replace(/"/g, '""')}"` : '';
        });
        const hotelsPlaceNames = Array.from({ length: maxHotels }, (_, i) => {
          const hotel = hotelsArray[i];
          return hotel?.placeName ? `"${hotel.placeName.replace(/"/g, '""')}"` : '';
        });
        const hotelsRoomTypes = Array.from({ length: maxHotels }, (_, i) => {
          const hotel = hotelsArray[i];
          return hotel?.roomType ? `"${hotel.roomType.replace(/"/g, '""')}"` : '';
        });
        const hotelsDescriptions = Array.from({ length: maxHotels }, (_, i) => {
          const hotel = hotelsArray[i];
          return hotel?.hotelDescription ? `"${hotel.hotelDescription.replace(/"/g, '""')}"` : '';
        });
        const hotelsPlaceDescriptions = Array.from({ length: maxHotels }, (_, i) => {
          const hotel = hotelsArray[i];
          return hotel?.placeDescription ? `"${hotel.placeDescription.replace(/"/g, '""')}"` : '';
        });

        return [
          index + 1,
          item.travelId,
          item.company === 'TOURILLO' ? 'TRL' : 'TTH',
          `"${item.clientName.replace(/"/g, '""')}"`,
          item.clientPhone,
          item.clientEmail || '',
          `"${(item.tripAdvisorName || '').replace(/"/g, '""')}"`,
          item.tripAdvisorNumber || '',
          `"${item.packageTitle.replace(/"/g, '""')}"`,
          item.numberOfDays,
          item.numberOfNights,
          item.numberOfHotels,
          `"${item.cabs.replace(/"/g, '""')}"`,
          `"${item.flights.replace(/"/g, '""')}"`,
          item.quotePrice,
          item.pricePerPerson,
          ...daysSummaries,
          ...daysDescriptions,
          ...daysImages,
          ...hotelsNames,
          ...hotelsPlaceNames,
          ...hotelsRoomTypes,
          ...hotelsDescriptions,
          ...hotelsPlaceDescriptions,
          `"${inclusionsArray.join('; ').replace(/"/g, '""')}"`,
          `"${exclusionsArray.join('; ').replace(/"/g, '""')}"`,
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
    link.setAttribute('download', `itineraries_complete_${filterLabel}${dateLabel}_${timestamp}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${filteredData.length} itineraries exported to CSV with complete data!`);
  };

  // ✅ Export to Excel - Complete Data with CORRECT DB Fields
  const exportToExcel = async (data: Itinerary[]) => {
    const filteredData = getDateFilteredData(data);
    if (filteredData.length === 0) {
      toast.error('No data found in selected date range');
      return;
    }

    try {
      setIsExporting(true);
      const XLSX = await import('xlsx');

      const maxDays = Math.max(...filteredData.map((item) => (Array.isArray(item.days) ? item.days.length : 0)), 1);
      const maxHotels = Math.max(
        ...filteredData.map((item) => (Array.isArray(item.hotels) ? item.hotels.length : 0)),
        1
      );

      const excelData = filteredData.map((item, index) => {
        const daysArray = Array.isArray(item.days) ? item.days : [];
        const hotelsArray = Array.isArray(item.hotels) ? item.hotels : [];
        const inclusionsArray = Array.isArray(item.inclusions) ? item.inclusions : [];
        const exclusionsArray = Array.isArray(item.exclusions) ? item.exclusions : [];

        const row: any = {
          'S.No': index + 1,
          'Itinerary ID': item.travelId,
          Company: item.company === 'TOURILLO' ? 'TRL' : 'TTH',
          'Client Name': item.clientName,
          'Client Phone': item.clientPhone,
          'Client Email': item.clientEmail || '',
          'Trip Advisor Name': item.tripAdvisorName || 'N/A',
          'Trip Advisor Phone': item.tripAdvisorNumber || 'N/A',
          'Package Title': item.packageTitle,
          'Number of Days': item.numberOfDays,
          'Number of Nights': item.numberOfNights,
          'Number of Hotels': item.numberOfHotels,
          Cabs: item.cabs,
          Flights: item.flights,
          'Quote Price (₹)': item.quotePrice,
          'Price Per Person (₹)': item.pricePerPerson,
        };

        for (let i = 0; i < maxDays; i++) {
          const day = daysArray[i];
          row[`Day ${i + 1} Summary`] = day?.summary || '';
          row[`Day ${i + 1} Description`] = day?.description || '';
          row[`Day ${i + 1} Image`] = day?.imageSrc || '';
        }

        for (let i = 0; i < maxHotels; i++) {
          const hotel = hotelsArray[i];
          row[`Hotel ${i + 1} Name`] = hotel?.hotelName || '';
          row[`Hotel ${i + 1} Place Name`] = hotel?.placeName || '';
          row[`Hotel ${i + 1} Room Type`] = hotel?.roomType || '';
          row[`Hotel ${i + 1} Description`] = hotel?.hotelDescription || '';
          row[`Hotel ${i + 1} Place Description`] = hotel?.placeDescription || '';
        }

        row['Inclusions'] = inclusionsArray.join('; ');
        row['Exclusions'] = exclusionsArray.join('; ');
        row['Created Date'] = formatDate(item.createdAt);
        row['Updated Date'] = item.updatedAt ? formatDate(item.updatedAt) : formatDate(item.createdAt);

        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Itineraries Complete');

      const columnWidths = [
        { wch: 6 },
        { wch: 20 },
        { wch: 10 },
        { wch: 20 },
        { wch: 15 },
        { wch: 25 },
        { wch: 20 },
        { wch: 15 },
        { wch: 30 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 18 },
        ...Array.from({ length: maxDays * 3 }, () => ({ wch: 50 })),
        ...Array.from({ length: maxHotels * 5 }, () => ({ wch: 30 })),
        { wch: 60 },
        { wch: 60 },
        { wch: 15 },
        { wch: 15 },
      ];
      worksheet['!cols'] = columnWidths;

      const timestamp = new Date().toISOString().split('T')[0];
      const filterLabel = companyFilter === 'ALL' ? 'all' : companyFilter === 'TOURILLO' ? 'tourillo' : 'traveltrail';
      const dateLabel = startDate && endDate ? `_${startDate}_to_${endDate}` : '';

      XLSX.writeFile(workbook, `itineraries_complete_${filterLabel}${dateLabel}_${timestamp}.xlsx`);
      toast.success(`${filteredData.length} itineraries exported to Excel with complete data!`);
    } catch (error) {
      toast.error('Failed to export to Excel');
      console.error('Excel export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // ✅ Export to PDF - Summary + Details with CORRECT DB Fields
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
      doc.text('Complete Itinerary Report', 14, 15);

      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      let subtitle = `Filter: ${filterLabel} | Total: ${filteredData.length} | Generated: ${timestamp}`;
      if (startDate && endDate) {
        subtitle += `\nDate Range: ${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}`;
      }
      doc.text(subtitle, 14, 24);

      const summaryData = filteredData.map((item, index) => [
        index + 1,
        item.company === 'TOURILLO' ? 'TRL' : 'TTH',
        item.travelId,
        item.clientName,
        item.tripAdvisorName || '-',
        item.packageTitle.substring(0, 25) + '...',
        `${item.numberOfNights}N/${item.numberOfDays}D`,
        formatPrice(item.quotePrice),
        formatDate(item.createdAt),
      ]);

      autoTable(doc, {
        head: [['#', 'Co.', 'ID', 'Client', 'Agent', 'Package', 'Duration', 'Price', 'Created']],
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

        doc.setFontSize(14);
        doc.setTextColor(99, 102, 241);
        doc.text(`${index + 1}. ${item.travelId} - ${item.packageTitle}`, 14, 15);

        let yPos = 25;
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);

        const details = [
          ['Company:', item.company === 'TOURILLO' ? 'Tourillo (TRL)' : 'Travel Trail Holidays (TTH)'],
          ['Client Name:', item.clientName],
          ['Client Phone:', item.clientPhone],
          ['Client Email:', item.clientEmail || 'N/A'],
          ['Trip Advisor:', `${item.tripAdvisorName || 'N/A'} (${item.tripAdvisorNumber || 'N/A'})`],
          ['Duration:', `${item.numberOfDays} Days / ${item.numberOfNights} Nights`],
          ['Hotels:', `${item.numberOfHotels} Hotels`],
          ['Cabs:', item.cabs],
          ['Flights:', item.flights],
          ['Quote Price:', formatPrice(item.quotePrice)],
          ['Price Per Person:', formatPrice(item.pricePerPerson)],
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

        if (Array.isArray(item.days) && item.days.length > 0) {
          yPos += 5;
          doc.setFont('helvetica', 'bold');
          doc.text('Itinerary:', 14, yPos);
          yPos += 7;
          doc.setFont('helvetica', 'normal');

          item.days.forEach((day: any, dayIdx: number) => {
            if (yPos > 180) {
              doc.addPage();
              yPos = 20;
            }
            doc.setFont('helvetica', 'bold');
            doc.text(`Day ${dayIdx + 1}: ${day.summary || 'N/A'}`, 14, yPos);
            yPos += 5;
            doc.setFont('helvetica', 'normal');
            const descLines = doc.splitTextToSize(day.description || 'No description', 260);
            doc.text(descLines, 14, yPos);
            yPos += descLines.length * 4 + 3;
          });
        }

        if (Array.isArray(item.hotels) && item.hotels.length > 0) {
          if (yPos > 160) {
            doc.addPage();
            yPos = 20;
          }
          yPos += 5;
          doc.setFont('helvetica', 'bold');
          doc.text('Hotels:', 14, yPos);
          yPos += 7;
          doc.setFont('helvetica', 'normal');

          item.hotels.forEach((hotel: any, hotelIdx: number) => {
            if (yPos > 180) {
              doc.addPage();
              yPos = 20;
            }
            const hotelText = `${hotelIdx + 1}. ${hotel.hotelName || 'N/A'} - ${hotel.placeName || 'N/A'} (${hotel.roomType || 'N/A'})`;
            const hotelLines = doc.splitTextToSize(hotelText, 260);
            doc.text(hotelLines, 14, yPos);
            yPos += hotelLines.length * 4;

            if (hotel.hotelDescription) {
              const descLines = doc.splitTextToSize(`Hotel: ${hotel.hotelDescription}`, 260);
              doc.text(descLines, 18, yPos);
              yPos += descLines.length * 4;
            }

            if (hotel.placeDescription) {
              const placeLines = doc.splitTextToSize(`Place: ${hotel.placeDescription}`, 260);
              doc.text(placeLines, 18, yPos);
              yPos += placeLines.length * 4;
            }

            yPos += 2;
          });
        }

        if (Array.isArray(item.inclusions) && item.inclusions.length > 0) {
          if (yPos > 160) {
            doc.addPage();
            yPos = 20;
          }
          yPos += 5;
          doc.setFont('helvetica', 'bold');
          doc.text('Inclusions:', 14, yPos);
          yPos += 7;
          doc.setFont('helvetica', 'normal');
          item.inclusions.forEach((inc: string) => {
            if (yPos > 185) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(`• ${inc}`, 14, yPos);
            yPos += 5;
          });
        }

        if (Array.isArray(item.exclusions) && item.exclusions.length > 0) {
          if (yPos > 160) {
            doc.addPage();
            yPos = 20;
          }
          yPos += 5;
          doc.setFont('helvetica', 'bold');
          doc.text('Exclusions:', 14, yPos);
          yPos += 7;
          doc.setFont('helvetica', 'normal');
          item.exclusions.forEach((exc: string) => {
            if (yPos > 185) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(`• ${exc}`, 14, yPos);
            yPos += 5;
          });
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

      doc.save(`itineraries_complete_${filterLabel2}${dateLabel}_${dateStr}.pdf`);
      toast.success(`${filteredData.length} itineraries exported to PDF with complete details!`);
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
    setAgentFilter('ALL');
    setStartDate('');
    setEndDate('');
    setApplyDateFilter(false);
    setSortField(null);
    setSortDirection(null);
    setPage(1);
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
    toast.success('Itinerary ID copied to clipboard!');
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

  const hasActiveFilters = companyFilter !== 'ALL' || agentFilter !== 'ALL' || search.trim() || applyDateFilter;

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
              placeholder="Search by ID, client, agent, or package..."
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
              All Packages <span className="ml-1 text-xs opacity-80">({stats.total})</span>
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

            {/* Agent Filter Dropdown */}
            <select
              className="h-9 px-3 rounded border border-gray-300 dark:border-gray-600 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              value={agentFilter}
              onChange={(e) => {
                setAgentFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Agents ({stats.total})</option>
              {agentOptions.map((agent) => (
                <option key={agent.name} value={agent.name}>
                  {agent.name} ({agent.count})
                </option>
              ))}
            </select>
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
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Total Itineraries</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.total}</p>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
            <span>
              Showing {filtered.length} of {stats.total} itineraries
            </span>
            {companyFilter !== 'ALL' && (
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded text-purple-700 dark:text-purple-300">
                {companyFilter === 'TOURILLO' ? 'Tourillo' : 'Travel Trail Holidays'}
              </span>
            )}
            {agentFilter !== 'ALL' && (
              <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <UserCheck className="h-3 w-3" />
                Agent: {agentFilter}
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
              <TableHead className="font-bold text-gray-700 dark:text-gray-300 w-16 min-w-[60px]">S.No</TableHead>
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
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[150px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('travelId')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Itinerary ID
                  <SortIcon field="travelId" />
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
                onClick={() => handleSort('numberOfNights')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Duration
                  <SortIcon field="numberOfNights" />
                </div>
              </TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('quotePrice')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Pricing
                  <SortIcon field="quotePrice" />
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
                    <PackageIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {search || companyFilter !== 'ALL' || agentFilter !== 'ALL' || applyDateFilter
                        ? 'No itineraries found matching your filters'
                        : 'No itineraries found'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {pageData.map((itinerary, idx) => (
              <TableRow key={itinerary.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <TableCell className="font-medium text-gray-600 dark:text-gray-400">
                  {(page - 1) * PAGE_SIZE + idx + 1}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${itinerary.company === 'TOURILLO' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}
                  >
                    <Building2 className="h-3 w-3" />
                    {itinerary.company === 'TOURILLO' ? 'TRL' : 'TTH'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-sm">
                      {itinerary.travelId}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyTravelId(itinerary.travelId)}
                      className="h-7 w-7 cursor-pointer rounded"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">{itinerary.clientName}</p>
                    <p className="text-xs text-gray-500">{itinerary.clientPhone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-indigo-600 dark:text-indigo-400">
                      {itinerary.tripAdvisorName || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{itinerary.tripAdvisorNumber || '-'}</p>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="font-medium truncate text-sm">{itinerary.packageTitle}</p>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-sm">
                    {itinerary.numberOfNights}N / {itinerary.numberOfDays}D
                  </span>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-bold text-green-600 dark:text-green-500 text-sm">
                      {formatPrice(itinerary.quotePrice)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatPrice(itinerary.pricePerPerson)}/p
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{formatDate(itinerary.createdAt)}</p>
                </TableCell>
                <TableCell className="sticky right-0 bg-white dark:bg-gray-900 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                  <div className="flex gap-2 justify-end">
                    <Link href={`/admin/itinerary/edit-itinerary/${itinerary.travelId}`}>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 cursor-pointer rounded" title="Edit">
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                    </Link>
                    <Link href={`/itinerary/view/${itinerary.travelId}`} target="_blank">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 cursor-pointer rounded" title="View">
                        <Eye className="h-4 w-4 text-green-600" />
                      </Button>
                    </Link>
                    {isMounted && isAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openDeleteDialog(itinerary.id)}
                        className="h-8 w-8 p-0 cursor-pointer rounded"
                        title="Delete"
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
            <AlertDialogTitle>Delete Itinerary?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this itinerary? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)} className="rounded cursor-pointer">
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

export default ItineraryList;
