import { ContactList } from '@/components/admin/contact-list';
import { getAllContacts, getUnreadContactCount } from '@/lib/actions/contact-actions';
import { Mail } from 'lucide-react';

const page = async () => {
  const contacts = await getAllContacts();
  const unreadCount = await getUnreadContactCount();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contact Messages</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage customer inquiries and messages
          </p>
        </div>
        <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/20 px-4 py-2 rounded-lg">
          <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <span className="font-semibold text-purple-600 dark:text-purple-400">
            {unreadCount} Unread
          </span>
        </div>
      </div>
      <ContactList contacts={contacts} />
    </div>
  );
};

export default page;
