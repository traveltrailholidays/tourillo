import React from 'react';
import AdminLayoutWrapper from '@/components/admin-layout-wrapper';

const AdminLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
};

export default AdminLayout;
