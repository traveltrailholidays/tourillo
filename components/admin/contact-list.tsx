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
    <div className="rounded bg-foreground p-6">
      <div className="mb-4 flex items-center gap-2">
        <input
          className="w-full md:max-w-xs px-3 py-2 rounded bg-background"
          placeholder="Search by name, email, phone, or subject..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>
      <div className="overflow-x-auto">
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
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm">
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Contact Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Name</label>
                  <p className="text-base">{viewContact.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Email</label>
                  <p className="text-base">{viewContact.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <p className="text-base">{viewContact.subject}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Message</label>
                <p className="text-base whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-4 rounded">
                  {viewContact.message}
                </p>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ContactList;
