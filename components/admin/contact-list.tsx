'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Mail, MailOpen } from 'lucide-react';
import { deleteContact, markContactAsRead, markContactAsUnread } from '@/lib/actions/contact-actions';
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
import toast from 'react-hot-toast';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface ContactListProps {
  contacts: Contact[];
}

// Helper function to format date to dd/mm/yyyy
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const ContactList: React.FC<ContactListProps> = ({ contacts }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewContact, setViewContact] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const PAGE_SIZE = 10;

  const filtered = useMemo(
    () =>
      contacts.filter((c) =>
        [c.name, c.email, c.phone, c.subject].some((v) => v.toLowerCase().includes(search.toLowerCase()))
      ),
    [search, contacts]
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      await deleteContact(deleteId);
      toast.success('Contact deleted successfully!');
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete contact');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleRead = async (contact: Contact) => {
    try {
      if (contact.isRead) {
        await markContactAsUnread(contact.id);
        toast.success('Marked as unread');
      } else {
        await markContactAsRead(contact.id);
        toast.success('Marked as read');
      }
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const handleViewContact = async (contact: Contact) => {
    setViewContact(contact);
    if (!contact.isRead) {
      await markContactAsRead(contact.id);
      router.refresh();
    }
  };

  return (
    <div className="rounded bg-foreground p-3 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <input
          className="w-full px-3 py-2 rounded bg-background text-sm md:text-base"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>

      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-primary">Status</TableHead>
              <TableHead className="text-primary">Name</TableHead>
              <TableHead className="text-primary">Email</TableHead>
              <TableHead className="text-primary">Phone</TableHead>
              <TableHead className="text-primary">Subject</TableHead>
              <TableHead className="text-primary">Date</TableHead>
              <TableHead className="text-primary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No contacts found.
                </TableCell>
              </TableRow>
            )}
            {pageData.map((contact) => (
              <TableRow key={contact.id} className={!contact.isRead ? 'bg-purple-50 dark:bg-purple-900/10' : ''}>
                <TableCell>
                  {contact.isRead ? (
                    <MailOpen className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Mail className="h-5 w-5 text-purple-600" />
                  )}
                </TableCell>
                <TableCell className={!contact.isRead ? 'font-semibold' : ''}>{contact.name}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>{contact.phone}</TableCell>
                <TableCell className="max-w-xs truncate">{contact.subject}</TableCell>
                <TableCell>{formatDate(contact.createdAt)}</TableCell>
                <TableCell className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleViewContact(contact)} title="View">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleToggleRead(contact)}
                    title={contact.isRead ? 'Mark as unread' : 'Mark as read'}
                  >
                    {contact.isRead ? (
                      <Mail className="h-4 w-4 text-gray-600" />
                    ) : (
                      <MailOpen className="h-4 w-4 text-purple-600" />
                    )}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(contact.id)} title="Delete">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete this contact?</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this contact message? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="secondary" onClick={() => setDeleteId(null)}>
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} type="button">
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View - Visible on tablets and below */}
      <div className="lg:hidden space-y-3">
        {pageData.length === 0 && <div className="text-center py-8 text-sm">No contacts found.</div>}
        {pageData.map((contact) => (
          <div
            key={contact.id}
            className={`rounded-lg border p-4 space-y-3 ${
              !contact.isRead
                ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800'
                : 'bg-background'
            }`}
          >
            {/* Header with status and actions */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {contact.isRead ? (
                  <MailOpen className="h-4 w-4 text-gray-400 shrink-0" />
                ) : (
                  <Mail className="h-4 w-4 text-purple-600 shrink-0" />
                )}
                <span className={`text-base truncate ${!contact.isRead ? 'font-semibold' : ''}`}>{contact.name}</span>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => handleViewContact(contact)}
                  title="View"
                >
                  <Eye className="h-4 w-4 text-blue-600" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => handleToggleRead(contact)}
                  title={contact.isRead ? 'Mark as unread' : 'Mark as read'}
                >
                  {contact.isRead ? (
                    <Mail className="h-4 w-4 text-gray-600" />
                  ) : (
                    <MailOpen className="h-4 w-4 text-purple-600" />
                  )}
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setDeleteId(contact.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Delete this contact?</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this contact message? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <DialogClose asChild>
                        <Button variant="secondary" onClick={() => setDeleteId(null)} className="w-full sm:w-auto">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        type="button"
                        className="w-full sm:w-auto"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-2 text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                <span className="break-all">{contact.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                <span>{contact.phone}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-gray-500 dark:text-gray-400">Subject:</span>
                <span className="text-right sm:max-w-[60%] wrap-break-word">{contact.subject}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-gray-500 dark:text-gray-400">Date:</span>
                <span>{formatDate(contact.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
        <span className="text-xs sm:text-sm">
          Page {page} of {totalPages || 1}
        </span>
        <div className="flex gap-2">
          <Button disabled={page === 1} size="sm" onClick={() => setPage((p) => Math.max(p - 1, 1))}>
            Prev
          </Button>
          <Button
            disabled={page === totalPages || totalPages === 0}
            size="sm"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      </div>

      {/* View Contact Dialog */}
      {viewContact && (
        <Dialog open={!!viewContact} onOpenChange={() => setViewContact(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Contact Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Name</label>
                  <p className="text-base wrap-break-word">{viewContact.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Email</label>
                  <p className="text-base break-all">{viewContact.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Phone</label>
                  <p className="text-base">{viewContact.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Date</label>
                  <p className="text-base">{formatDate(viewContact.createdAt)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Subject</label>
                <p className="text-base wrap-break-word">{viewContact.subject}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Message</label>
                <p className="text-sm sm:text-base whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-4 rounded wrap-break-word">
                  {viewContact.message}
                </p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary" className="w-full sm:w-auto">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ContactList;
