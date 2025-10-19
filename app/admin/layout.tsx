import { AppSidebar } from '@/components/app-sidebar';
import Navbar from '@/components/navbar';
import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';

const AdminLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <Navbar />
        {children}
      </main>
    </SidebarProvider>
  );
};

export default AdminLayout;
