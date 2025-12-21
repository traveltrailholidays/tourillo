'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Pencil,
  Trash2,
  UserCheck,
  Search,
  Download,
  Sheet,
  FileText,
  File,
  CalendarIcon,
  X,
  Users,
  UserX,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Shield,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { deactivateUser, deleteUserPermanently, reactivateUser } from '@/lib/actions/user-actions';
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
import { Checkbox } from '@/components/ui/checkbox';
import toast from 'react-hot-toast';
import Image from 'next/image';
import LoadingSpinner from '../loading-spinner';

export interface UserWithAccounts {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: string | null;
  phone: string | null;
  image: string | null;
  password: string | null; // Added to check credentials login
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  wishlistId?: string[];
  accounts: Array<{
    id: string;
    provider: string;
    type: string;
    providerAccountId: string;
    createdAt: string;
  }>;
}

interface UserListProps {
  users: UserWithAccounts[];
  userType: 'user' | 'agent' | 'admin';
}

type SortField = 'name' | 'email' | 'phone' | 'lastLoginAt' | 'createdAt';
type SortDirection = 'asc' | 'desc' | null;
type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ✅ FIXED: Correct logic for account providers
const getAccountProviders = (user: UserWithAccounts): string => {
  // If user has OAuth accounts, show those providers
  if (user.accounts && user.accounts.length > 0) {
    return user.accounts.map((acc) => acc.provider.charAt(0).toUpperCase() + acc.provider.slice(1)).join(', ');
  }

  // If no OAuth accounts but has password, it's Email/Password login
  if (user.password) {
    return 'Email/Password';
  }

  // No accounts and no password (shouldn't happen, but handle it)
  return 'Not Set';
};

// ✅ FIXED: Correct logic for account type
const getAccountType = (user: UserWithAccounts): string => {
  // If user has OAuth accounts
  if (user.accounts && user.accounts.length > 0) {
    const types = user.accounts.map((acc) => acc.type);
    if (types.includes('oauth')) return 'OAuth';
    if (types.includes('oidc')) return 'OIDC';
    return 'OAuth';
  }

  // If no OAuth accounts but has password
  if (user.password) {
    return 'Credentials';
  }

  return 'Unknown';
};

// ✅ Get total connected accounts (only OAuth)
const getTotalAccounts = (user: UserWithAccounts): number => {
  return user.accounts?.length || 0;
};

export const UserList: React.FC<UserListProps> = ({ users, userType }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [permanentDelete, setPermanentDelete] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Filter & Sort states
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Date Range Filter States
  const [showDateRangeDialog, setShowDateRangeDialog] = useState(false);
  const [exportType, setExportType] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [applyDateFilter, setApplyDateFilter] = useState(false);

  const PAGE_SIZE = 10;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const activeCount = users.filter((u) => u.isActive).length;
    const inactiveCount = users.filter((u) => !u.isActive).length;
    const verifiedCount = users.filter((u) => u.emailVerified).length;
    const oauthCount = users.filter((u) => u.accounts && u.accounts.length > 0).length;
    const credentialsCount = users.filter((u) => (!u.accounts || u.accounts.length === 0) && u.password).length;

    return {
      total: users.length,
      active: activeCount,
      inactive: inactiveCount,
      verified: verifiedCount,
      oauth: oauthCount,
      credentials: credentialsCount,
    };
  }, [users]);

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
    let result = users;

    // Status Filter
    if (statusFilter === 'ACTIVE') {
      result = result.filter((u) => u.isActive);
    } else if (statusFilter === 'INACTIVE') {
      result = result.filter((u) => !u.isActive);
    }

    // Search Filter
    if (search.trim()) {
      result = result.filter((u) =>
        [u.name, u.email, u.phone].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Date Range Filter
    if (applyDateFilter && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      result = result.filter((u) => {
        const itemDate = new Date(u.createdAt);
        return itemDate >= start && itemDate <= end;
      });
    }

    // Sorting
    if (sortField && sortDirection) {
      result = [...result].sort((a, b) => {
        let aVal: string | number;
        let bVal: string | number;

        if (sortField === 'lastLoginAt' || sortField === 'createdAt') {
          aVal = a[sortField] ? new Date(a[sortField]!).getTime() : 0;
          bVal = b[sortField] ? new Date(b[sortField]!).getTime() : 0;
        } else {
          aVal = (a[sortField] || '').toLowerCase();
          bVal = (b[sortField] || '').toLowerCase();
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [search, users, statusFilter, applyDateFilter, startDate, endDate, sortField, sortDirection]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getDateFilteredData = (data: UserWithAccounts[]) => {
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

  // ✅ FIXED: Export to CSV with correct data
  const exportToCSV = (data: UserWithAccounts[]) => {
    const filteredData = getDateFilteredData(data);
    if (filteredData.length === 0) {
      toast.error('No data found in selected date range');
      return;
    }

    const headers = [
      'S.No',
      'User ID',
      'Name',
      'Email',
      'Email Verified',
      'Phone',
      'Status',
      'Auth Method',
      'Login Type',
      'OAuth Accounts',
      'Last Login',
      'Joined Date',
      'Updated Date',
    ];

    const csvContent = [
      headers.join(','),
      ...filteredData.map((item, index) => {
        const authMethod = getAccountProviders(item);
        const loginType = getAccountType(item);
        const oauthAccounts = getTotalAccounts(item);

        return [
          index + 1,
          item.id,
          `"${(item.name || 'N/A').replace(/"/g, '""')}"`,
          `"${(item.email || 'N/A').replace(/"/g, '""')}"`,
          item.emailVerified ? formatDate(item.emailVerified) : 'Not Verified',
          item.phone || 'N/A',
          item.isActive ? 'Active' : 'Inactive',
          `"${authMethod}"`,
          loginType,
          oauthAccounts,
          formatDate(item.lastLoginAt),
          formatDate(item.createdAt),
          formatDate(item.updatedAt),
        ].join(',');
      }),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];
    const filterLabel = statusFilter === 'ALL' ? 'all' : statusFilter.toLowerCase();
    const dateLabel = startDate && endDate ? `_${startDate}_to_${endDate}` : '';

    link.setAttribute('href', url);
    link.setAttribute('download', `${userType}s_detailed_${filterLabel}${dateLabel}_${timestamp}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${filteredData.length} ${userType}s exported with correct account details!`);
  };

  // ✅ FIXED: Export to Excel with correct data (2 sheets)
  const exportToExcel = async (data: UserWithAccounts[]) => {
    const filteredData = getDateFilteredData(data);
    if (filteredData.length === 0) {
      toast.error('No data found in selected date range');
      return;
    }

    try {
      setIsExporting(true);
      const XLSX = await import('xlsx');

      const excelData = filteredData.map((item, index) => {
        const authMethod = getAccountProviders(item);
        const loginType = getAccountType(item);
        const oauthAccounts = getTotalAccounts(item);

        return {
          'S.No': index + 1,
          'User ID': item.id,
          Name: item.name || 'N/A',
          Email: item.email || 'N/A',
          'Email Verified': item.emailVerified ? formatDate(item.emailVerified) : 'Not Verified',
          Phone: item.phone || 'N/A',
          Status: item.isActive ? 'Active' : 'Inactive',
          'Auth Method': authMethod,
          'Login Type': loginType,
          'OAuth Accounts': oauthAccounts,
          'Has Password': item.password ? 'Yes' : 'No',
          'Last Login': formatDate(item.lastLoginAt),
          'Joined Date': formatDate(item.createdAt),
          'Updated Date': formatDate(item.updatedAt),
        };
      });

      // Separate sheet for OAuth account details (only users with OAuth)
      const accountsData: any[] = [];
      filteredData.forEach((item) => {
        if (item.accounts && item.accounts.length > 0) {
          item.accounts.forEach((acc) => {
            accountsData.push({
              'User ID': item.id,
              'User Name': item.name || 'N/A',
              'User Email': item.email || 'N/A',
              'Account ID': acc.id,
              Provider: acc.provider.charAt(0).toUpperCase() + acc.provider.slice(1),
              Type: acc.type,
              'Provider Account ID': acc.providerAccountId,
              'Connected On': formatDate(acc.createdAt),
            });
          });
        }
      });

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Users sheet
      const usersWorksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, usersWorksheet, 'Users');

      // Column widths for users sheet
      usersWorksheet['!cols'] = [
        { wch: 6 }, // S.No
        { wch: 36 }, // User ID
        { wch: 25 }, // Name
        { wch: 30 }, // Email
        { wch: 15 }, // Email Verified
        { wch: 15 }, // Phone
        { wch: 10 }, // Status
        { wch: 20 }, // Auth Method
        { wch: 15 }, // Login Type
        { wch: 12 }, // OAuth Accounts
        { wch: 12 }, // Has Password
        { wch: 15 }, // Last Login
        { wch: 15 }, // Joined Date
        { wch: 15 }, // Updated Date
      ];

      // OAuth Accounts sheet (only if there are OAuth users)
      if (accountsData.length > 0) {
        const accountsWorksheet = XLSX.utils.json_to_sheet(accountsData);
        XLSX.utils.book_append_sheet(workbook, accountsWorksheet, 'OAuth Accounts');

        // Column widths for accounts sheet
        accountsWorksheet['!cols'] = [
          { wch: 36 }, // User ID
          { wch: 25 }, // User Name
          { wch: 30 }, // User Email
          { wch: 36 }, // Account ID
          { wch: 15 }, // Provider
          { wch: 10 }, // Type
          { wch: 30 }, // Provider Account ID
          { wch: 15 }, // Connected On
        ];
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const filterLabel = statusFilter === 'ALL' ? 'all' : statusFilter.toLowerCase();
      const dateLabel = startDate && endDate ? `_${startDate}_to_${endDate}` : '';

      XLSX.writeFile(workbook, `${userType}s_detailed_${filterLabel}${dateLabel}_${timestamp}.xlsx`);
      toast.success(
        `${filteredData.length} ${userType}s exported! ${accountsData.length > 0 ? '(2 sheets: Users + OAuth Accounts)' : ''}`
      );
    } catch (error) {
      toast.error('Failed to export to Excel');
      console.error('Excel export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // ✅ FIXED: Export to PDF with correct data
  const exportToPDF = async (data: UserWithAccounts[]) => {
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

      // Title page
      doc.setFontSize(18);
      doc.setTextColor(147, 51, 234);
      doc.text(`${userType.charAt(0).toUpperCase() + userType.slice(1)}s Detailed Report`, 14, 15);

      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      let subtitle = `Total: ${filteredData.length} | Generated: ${timestamp}`;
      if (startDate && endDate) {
        subtitle += `\nDate Range: ${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}`;
      }
      doc.text(subtitle, 14, 24);

      // Summary table
      const tableData = filteredData.map((item, index) => {
        const authMethod = getAccountProviders(item);
        const loginType = getAccountType(item);
        return [
          index + 1,
          item.name || 'N/A',
          item.email || 'N/A',
          item.phone || 'N/A',
          item.isActive ? 'Active' : 'Inactive',
          authMethod,
          loginType,
          formatDate(item.lastLoginAt),
          formatDate(item.createdAt),
        ];
      });

      autoTable(doc, {
        head: [['#', 'Name', 'Email', 'Phone', 'Status', 'Auth Method', 'Type', 'Last Login', 'Joined']],
        body: tableData,
        startY: startDate && endDate ? 34 : 30,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [147, 51, 234], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: {
          0: { halign: 'center', cellWidth: 8 },
          4: { halign: 'center', cellWidth: 15 },
          6: { halign: 'center', cellWidth: 20 },
        },
      });

      // Detailed pages for each user
      filteredData.forEach((item, index) => {
        doc.addPage();

        doc.setFontSize(14);
        doc.setTextColor(147, 51, 234);
        doc.text(`${index + 1}. ${item.name || 'Unnamed User'}`, 14, 15);

        let yPos = 25;
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);

        // User details
        const details = [
          ['User ID:', item.id],
          ['Name:', item.name || 'N/A'],
          ['Email:', item.email || 'N/A'],
          ['Email Verified:', item.emailVerified ? formatDate(item.emailVerified) : 'Not Verified'],
          ['Phone:', item.phone || 'N/A'],
          ['Status:', item.isActive ? 'Active' : 'Inactive'],
          ['Auth Method:', getAccountProviders(item)],
          ['Login Type:', getAccountType(item)],
          ['Has Password:', item.password ? 'Yes' : 'No'],
          ['Last Login:', formatDate(item.lastLoginAt)],
          ['Joined:', formatDate(item.createdAt)],
          ['Updated:', formatDate(item.updatedAt)],
        ];

        details.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold');
          doc.text(label, 14, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(String(value), 70, yPos);
          yPos += 6;
        });

        // OAuth Accounts (only if they exist)
        if (item.accounts && item.accounts.length > 0) {
          yPos += 5;
          doc.setFont('helvetica', 'bold');
          doc.text('Connected OAuth Accounts:', 14, yPos);
          yPos += 7;

          const accountTableData = item.accounts.map((acc, accIndex) => [
            accIndex + 1,
            acc.provider.charAt(0).toUpperCase() + acc.provider.slice(1),
            acc.type,
            acc.providerAccountId.substring(0, 30) + '...',
            formatDate(acc.createdAt),
          ]);

          autoTable(doc, {
            head: [['#', 'Provider', 'Type', 'Provider Account ID', 'Connected']],
            body: accountTableData,
            startY: yPos,
            theme: 'striped',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [99, 102, 241], textColor: 255 },
            margin: { left: 14 },
          });
        } else if (item.password) {
          yPos += 5;
          doc.setFont('helvetica', 'bold');
          doc.text('Authentication:', 14, yPos);
          yPos += 7;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(34, 197, 94);
          doc.text('✓ Email/Password (Credentials Login)', 14, yPos);
          doc.setTextColor(0, 0, 0);
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

      const filterLabel = statusFilter === 'ALL' ? 'all' : statusFilter.toLowerCase();
      const dateStr = new Date().toISOString().split('T')[0];
      const dateLabel = startDate && endDate ? `_${startDate}_to_${endDate}` : '';

      doc.save(`${userType}s_detailed_${filterLabel}${dateLabel}_${dateStr}.pdf`);
      toast.success(`${filteredData.length} ${userType}s exported with correct authentication details!`);
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
    setStatusFilter('ALL');
    setStartDate('');
    setEndDate('');
    setApplyDateFilter(false);
    setSortField(null);
    setSortDirection(null);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      if (permanentDelete) {
        await deleteUserPermanently(deleteId);
        toast.success(`${userType.charAt(0).toUpperCase() + userType.slice(1)} deleted permanently!`);
      } else {
        await deactivateUser(deleteId);
        toast.success(`${userType.charAt(0).toUpperCase() + userType.slice(1)} deactivated successfully!`);
      }
      setDeleteId(null);
      setPermanentDelete(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await reactivateUser(id);
      toast.success(`${userType.charAt(0).toUpperCase() + userType.slice(1)} reactivated successfully!`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reactivate user');
    }
  };

  const hasActiveFilters = statusFilter !== 'ALL' || search.trim() || applyDateFilter;

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
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>

          {/* Export Button */}
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
        </div>

        {/* Second Row: Filters */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 items-center justify-start">
            {/* Status Filter Buttons */}
            <Button
              size="sm"
              variant={statusFilter === 'ALL' ? 'default' : 'outline'}
              onClick={() => {
                setStatusFilter('ALL');
                setPage(1);
              }}
              className={`cursor-pointer rounded h-9 ${statusFilter === 'ALL' ? 'bg-sky-500 hover:bg-sky-600' : ''}`}
            >
              All {userType}s <span className="ml-1 text-xs opacity-80">({stats.total})</span>
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
              onClick={() => {
                setStatusFilter('ACTIVE');
                setPage(1);
              }}
              className={`cursor-pointer rounded h-9 ${statusFilter === 'ACTIVE' ? 'bg-green-500 hover:bg-green-600' : ''}`}
            >
              Active <span className="ml-1 text-xs opacity-80">({stats.active})</span>
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'INACTIVE' ? 'default' : 'outline'}
              onClick={() => {
                setStatusFilter('INACTIVE');
                setPage(1);
              }}
              className={`cursor-pointer rounded h-9 ${statusFilter === 'INACTIVE' ? 'bg-red-500 hover:bg-red-600' : ''}`}
            >
              Inactive <span className="ml-1 text-xs opacity-80">({stats.inactive})</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="px-3 py-2 bg-linear-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-purple-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Total</p>
            </div>
            <p className="text-xl font-bold text-purple-600">{stats.total}</p>
          </div>

          <div className="px-3 py-2 bg-linear-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded">
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="h-4 w-4 text-green-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Active</p>
            </div>
            <p className="text-xl font-bold text-green-600">{stats.active}</p>
          </div>

          <div className="px-3 py-2 bg-linear-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded">
            <div className="flex items-center gap-2 mb-1">
              <UserX className="h-4 w-4 text-red-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Inactive</p>
            </div>
            <p className="text-xl font-bold text-red-600">{stats.inactive}</p>
          </div>

          <div className="px-3 py-2 bg-linear-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">OAuth</p>
            </div>
            <p className="text-xl font-bold text-blue-600">{stats.oauth}</p>
          </div>

          <div className="px-3 py-2 bg-linear-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="h-4 w-4 text-orange-600" />
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Email/Pass</p>
            </div>
            <p className="text-xl font-bold text-orange-600">{stats.credentials}</p>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
            <span>
              Showing {filtered.length} of {stats.total} {userType}s
            </span>
            {statusFilter !== 'ALL' && (
              <span
                className={`px-2 py-1 rounded ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}
              >
                {statusFilter}
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
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[200px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center whitespace-nowrap">
                  User
                  <SortIcon field="name" />
                </div>
              </TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[200px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Email
                  <SortIcon field="email" />
                </div>
              </TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('phone')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Phone
                  <SortIcon field="phone" />
                </div>
              </TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-300 min-w-[130px]">Auth Method</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-300 min-w-[100px]">Status</TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('lastLoginAt')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Last Login
                  <SortIcon field="lastLoginAt" />
                </div>
              </TableHead>
              <TableHead
                className="font-bold text-gray-700 dark:text-gray-300 min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center whitespace-nowrap">
                  Joined
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
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {search || statusFilter !== 'ALL' || applyDateFilter
                        ? `No ${userType}s found matching your filters`
                        : `No ${userType}s found`}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {pageData.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <TableCell>
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || 'User'}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{user.name || 'Unnamed User'}</p>
                      {user.emailVerified && <p className="text-xs text-green-600 dark:text-green-400">✓ Verified</p>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{user.email || 'N/A'}</TableCell>
                <TableCell className="text-sm font-mono">{user.phone || 'N/A'}</TableCell>
                <TableCell>
                  {user.accounts && user.accounts.length > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                      <Shield className="h-3 w-3" />
                      {getAccountProviders(user)}
                    </span>
                  ) : user.password ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
                      <Mail className="h-3 w-3" />
                      Email/Password
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                      Not Set
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {user.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Inactive
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(user.lastLoginAt)}
                </TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-gray-400">{formatDate(user.createdAt)}</TableCell>
                <TableCell className="sticky right-0 bg-white dark:bg-gray-900 z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.05)]">
                  <div className="flex gap-2 justify-end">
                    <Link href={`/admin/users/${userType}s-list/edit/${user.id}`}>
                      <Button size="sm" variant="ghost" title="Edit" className="h-8 w-8 p-0 cursor-pointer rounded">
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                    </Link>

                    {!user.isActive ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReactivate(user.id)}
                        title="Reactivate"
                        className="h-8 w-8 p-0 cursor-pointer rounded"
                      >
                        <UserCheck className="h-4 w-4 text-green-600" />
                      </Button>
                    ) : (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteId(user.id)}
                            title="Delete"
                            className="h-8 w-8 p-0 cursor-pointer rounded"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded">
                          <DialogHeader>
                            <DialogTitle>Delete this {userType}?</DialogTitle>
                            <DialogDescription>Choose how you want to remove this {userType}.</DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="permanent"
                                checked={permanentDelete}
                                onCheckedChange={(checked) => setPermanentDelete(checked as boolean)}
                              />
                              <label
                                htmlFor="permanent"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Delete permanently (cannot be undone)
                              </label>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 ml-6">
                              {permanentDelete
                                ? 'This will permanently delete the user and all their data.'
                                : 'This will deactivate the user account. They will be logged out and unable to sign in.'}
                            </p>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setDeleteId(null);
                                  setPermanentDelete(false);
                                }}
                                className="cursor-pointer rounded"
                              >
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              onClick={handleDelete}
                              disabled={isDeleting}
                              type="button"
                              className="cursor-pointer rounded"
                            >
                              {isDeleting ? 'Processing...' : permanentDelete ? 'Delete Permanently' : 'Deactivate'}
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
        <DialogContent className="sm:max-w-md rounded">
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
    </div>
  );
};

export default UserList;
