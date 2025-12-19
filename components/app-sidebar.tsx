'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import DATA from '@/lib/data';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { ChevronRight, LogOut } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { signOut } from 'next-auth/react';
import { useAuthStore } from '@/store/auth.store';
import { getUnreadContactCount } from '@/lib/actions/contact-actions';
import { getUnreadQuoteCount } from '@/lib/actions/quote-actions';
import LogoFull from './logo-full';

// Define types for menu items
interface SubMenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface MenuItem {
  title: string;
  url?: string;
  icon: React.ComponentType<{ size?: number }>;
  children?: SubMenuItem[];
  adminOnly?: boolean;
}

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

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [unreadContactCount, setUnreadContactCount] = useState<number>(0);
  const [unreadQuoteCount, setUnreadQuoteCount] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false); // Add mounted state
  const { user, clearUser } = useAuthStore();

  // Check if component is mounted to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if user is admin
  const isAdmin = user?.isAdmin || false;

  // Fetch unread counts
  useEffect(() => {
    async function fetchUnreadCounts() {
      try {
        const [contactCount, quoteCount] = await Promise.all([getUnreadContactCount(), getUnreadQuoteCount()]);
        setUnreadContactCount(contactCount);
        setUnreadQuoteCount(quoteCount);
      } catch (error) {
        console.error('Failed to fetch unread counts:', error);
      }
    }

    fetchUnreadCounts();

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchUnreadCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter sidebar items based on admin status
  const filteredSidebarItems = useMemo(() => {
    // Don't filter during SSR to prevent hydration mismatch
    if (!isMounted) {
      return DATA.sidebar;
    }

    return DATA.sidebar.filter((item: MenuItem) => {
      if (item.adminOnly) {
        return isAdmin;
      }
      return true;
    });
  }, [isAdmin, isMounted]);

  const toggleMenu = (title: string): void => {
    const newOpenMenus = new Set(openMenus);
    if (newOpenMenus.has(title)) {
      newOpenMenus.delete(title);
    } else {
      newOpenMenus.add(title);
    }
    setOpenMenus(newOpenMenus);
  };

  const isMenuOpen = (title: string): boolean => openMenus.has(title);

  const hasActiveChild = (children: SubMenuItem[] | undefined): boolean => {
    return children?.some((child) => pathname === child.url) ?? false;
  };

  const handleLogoutClick = useCallback(() => {
    setShowLogoutConfirm(true);
  }, []);

  const handleLogoutConfirm = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      clearUser();
      await signOut({ redirect: false });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  }, [clearUser, router]);

  const handleLogoutCancel = useCallback(() => {
    setShowLogoutConfirm(false);
  }, []);

  return (
    <Sidebar>
      <header className="bg-foreground px-2 border-b h-14 flex items-center">
        <LogoFull />
      </header>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredSidebarItems.map((item: MenuItem) => {
                if (!item.children) {
                  const isActive = pathname === item.url;
                  const isContactPage = item.url === '/admin/contact';
                  const isQuotePage = item.url === '/admin/quotes/quotes-list';

                  return (
                    <SidebarMenuItem key={item.title} className="mt-2">
                      <SidebarMenuButton asChild isActive={isActive} className={isActive ? 'bg-border' : ''}>
                        <Link href={item.url!} className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <item.icon size={20} />
                            <span>{item.title}</span>
                          </div>
                          {isContactPage && unreadContactCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-5 text-center">
                              {unreadContactCount}
                            </span>
                          )}
                          {isQuotePage && unreadQuoteCount > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-5 text-center">
                              {unreadQuoteCount}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                const isOpen = isMenuOpen(item.title);
                const hasActiveSubItem = hasActiveChild(item.children);

                return (
                  <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleMenu(item.title)}>
                    <SidebarMenuItem className="mt-2">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={hasActiveSubItem}
                          className={`w-full ${hasActiveSubItem ? 'bg-border' : ''}`}
                        >
                          <item.icon size={20} />
                          <span>{item.title}</span>
                          <ChevronRight
                            className={`ml-auto h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((subItem: SubMenuItem) => {
                            const isSubActive = pathname === subItem.url;

                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isSubActive}
                                  className={isSubActive ? 'bg-border' : ''}
                                >
                                  <Link href={subItem.url}>
                                    <subItem.icon size={16} />
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <footer className="border-t p-2 bg-foreground">
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-2 w-full px-2 py-2 text-sm hover:bg-border cursor-pointer rounded-xs transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </footer>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 dark:bg-white/10 backdrop-blur-[1px]"
            onClick={handleLogoutCancel}
          />
          <div className="relative bg-foreground rounded-xs shadow-xl p-5 w-full max-w-xl">
            <h3 className="text-lg md:text-xl font-semibold text-theme-text mb-2">Confirm Logout</h3>
            <p className="text-sm text-theme-text/80 mb-8">Are you sure you want to logout of your account?</p>
            <div className="flex gap-5 justify-end">
              <button
                onClick={handleLogoutCancel}
                disabled={isLoggingOut}
                className="bg-border hover:bg-border/90 px-3 py-2 rounded-xs cursor-pointer font-semibold text-gray-800 dark:text-theme-text transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                disabled={isLoggingOut}
                className="bg-linear-to-r from-indigo-500 hover:from-indigo-500/90 via-purple-500 hover:via-purple-500/90 to-pink-500 hover:to-pink-500/90 px-3 py-2 rounded-xs cursor-pointer font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoggingOut && <LoadingSpinner />}
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}
