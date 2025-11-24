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
    <UserEditForm user={user} />
  );
}
