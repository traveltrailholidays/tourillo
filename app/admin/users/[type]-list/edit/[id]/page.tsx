import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getUserById } from '@/lib/actions/user-actions';

import UserEditForm from '@/components/admin/user-edit-form';

export const metadata: Metadata = {
  title: 'Edit Users',
  description:
    'Edit and manage user information within the Tourillo admin panel. Update account details, modify permissions, and maintain accurate user records with ease.',
};

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

  return <UserEditForm user={user} />;
}
