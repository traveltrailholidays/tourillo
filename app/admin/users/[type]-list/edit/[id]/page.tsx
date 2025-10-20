import { getUserById } from '@/lib/actions/user-actions';
import UserEditForm from '@/components/admin/user-edit-form';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{
    id: string;
    type: string;
  }>;
}

export default async function EditUserPage({ params }: PageProps) {
  // Await params (Next.js 15+ requirement)
  const { id, type } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <Link
        href={`/admin/${type}`}
        className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to List
      </Link>

      <UserEditForm user={user} />
    </div>
  );
}
