'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdClose } from 'react-icons/io';
import { AiOutlineUser } from 'react-icons/ai';
import { RiLogoutCircleRLine } from 'react-icons/ri';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineContactMail } from 'react-icons/md';
import ThemeSwitch from '../theme-switch';
import { useSession, signOut } from 'next-auth/react';

interface SideBarProps {
  onClose: () => void;
  isOpen: boolean;
}

interface NavLinkProps {
  href: string;
  text: string;
  icon: React.ComponentType<{ size: number }>;
  target?: string;
  pathname: string;
  onClose: () => void;
}

interface NavLinkItem {
  href: string;
  text: string;
  icon: React.ComponentType<{ size: number }>;
  target?: string;
}

// Animation variants (memoized outside component to prevent recreation)
const containerVariants = {
  open: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};

const itemVariants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 0, x: 20 },
};

// Memoized components
const NavLink = React.memo<NavLinkProps>(({ href, text, icon: Icon, target, pathname, onClose }) => {
  const isActive = pathname === href;

  return (
    <motion.div variants={itemVariants}>
      <Link
        href={href}
        {...(target && { target })}
        onClick={onClose}
        className={`
          group flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 mb-2
          ${
            isActive
              ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
              : 'bg-background hover:bg-violet-100 hover:dark:bg-violet-900/30 text-gray-700 dark:text-gray-300'
          }
          hover:scale-[0.98]
        `}
      >
        <div
          className={`
            p-2 rounded-lg transition-colors
            ${
              isActive
                ? 'bg-violet-200 dark:bg-violet-800/30 text-violet-600 dark:text-violet-400'
                : 'bg-foreground group-hover:bg-violet-100 dark:group-hover:bg-violet-900/20 group-hover:text-violet-600 dark:group-hover:text-violet-400'
            }
          `}
        >
          <Icon size={20} />
        </div>
        <span className="font-medium">{text}</span>
      </Link>
    </motion.div>
  );
});

NavLink.displayName = 'NavLink';

const ActionButton = React.memo<{
  icon: React.ComponentType<{ size: number }>;
  text: string;
  href?: string;
  onClick?: () => void;
  type?: 'link' | 'button';
}>(({ icon: Icon, text, href, onClick, type = 'link' }) => {
  const commonClasses =
    'w-full flex items-center gap-3 p-3 bg-background text-theme-text rounded-xl transition-all duration-200 hover:scale-[0.98] group cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900/20';

  const content = (
    <>
      <div className="p-2 bg-foreground rounded-lg group-hover:bg-violet-100 dark:group-hover:bg-violet-900/20 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
        <Icon size={20} />
      </div>
      <span className="font-medium">{text}</span>
    </>
  );

  if (type === 'button' || !href) {
    return (
      <button onClick={onClick} className={commonClasses}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={commonClasses}>
      {content}
    </Link>
  );
});

ActionButton.displayName = 'ActionButton';

const LoadingSpinner = React.memo(() => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
));

LoadingSpinner.displayName = 'LoadingSpinner';

// Modal component for logout confirmation
const LogoutModal = React.memo<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}>(({ isOpen, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 dark:bg-white/10 backdrop-blur-[1px]" onClick={onCancel} />
      <div className="relative bg-foreground rounded shadow-xl p-5 w-full max-w-xl">
        <h3 className="text-lg md:text-xl font-semibold text-theme-text mb-2">Confirm Logout</h3>
        <p className="text-sm text-theme-text/80 mb-8">Are you sure you want to logout of your account?</p>
        <div className="flex gap-5 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="bg-border hover:bg-border/90 px-3 py-2 rounded-xs cursor-pointer font-semibold text-gray-800 dark:text-theme-text transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-linear-to-r from-indigo-500 hover:from-indigo-500/90 via-purple-500 hover:via-purple-500/90 to-pink-500 hover:to-pink-500/90 px-3 py-2 rounded-xs cursor-pointer font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && <LoadingSpinner />}
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </div>
  );
});

LogoutModal.displayName = 'LogoutModal';

const SideBar: React.FC<SideBarProps> = ({ onClose, isOpen }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Use NextAuth session
  const { data: session, status } = useSession();

  // Determine authentication state based on session
  const isAuthenticated = useMemo(() => {
    return status === 'authenticated' && !!session?.user && !session?.error;
  }, [status, session]);

  // Navigation links configuration
  const navLinksConfig = useMemo(() => {
    const baseNavLinks: NavLinkItem[] = [
      // { href: '/', text: 'Home', icon: RiHome4Line },
      { href: '/about-us', text: 'About Us', icon: BsInfoCircle },
      { href: '/contact-us', text: 'Contact Us', icon: MdOutlineContactMail },
      { href: '/wishlist', text: 'Wishlist', icon: MdOutlineContactMail },
    ];

    const authenticatedOnlyLinks: NavLinkItem[] = [
      // { href: '/profile', text: 'Profile', icon: AiOutlineUser }
    ];

    // For authenticated users, show both base links and authenticated-only links
    if (isAuthenticated) {
      return {
        smallScreen: [...baseNavLinks, ...authenticatedOnlyLinks],
        largeScreen: [...baseNavLinks, ...authenticatedOnlyLinks],
      };
    }

    // For non-authenticated users, show only base links
    return {
      smallScreen: baseNavLinks,
      largeScreen: baseNavLinks,
    };
  }, [isAuthenticated]);

  // Event handlers
  const handleLogoutClick = useCallback(() => {
    setShowLogoutModal(true);
  }, []);

  const handleLogoutConfirm = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      // Sign out using NextAuth with redirect disabled
      await signOut({
        redirect: false,
        callbackUrl: '/',
      });

      // Close modal and sidebar
      setShowLogoutModal(false);
      onClose();

      // Redirect to home page after successful logout
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [router, onClose]);

  const handleLogoutCancel = useCallback(() => {
    setShowLogoutModal(false);
  }, []);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.sidebar-content')) {
        onClose();
      }
    },
    [onClose]
  );

  const handleLoginClick = useCallback(() => {
    onClose(); // Close sidebar when navigating to login
  }, [onClose]);

  // Effects
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 dark:bg-white/20 backdrop-blur-xs z-50"
            onClick={handleBackdropClick}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="fixed top-0 right-0 h-full w-[300px] bg-foreground z-50 shadow-2xl sidebar-content flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`shrink-0 h-16 bg-foreground flex items-center px-4 relative z-10 justify-end`}>
                <motion.button
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={onClose}
                  className="p-2 bg-background rounded-full transition-all duration-200 hover:rotate-90 hover:bg-background/70 cursor-pointer text-black dark:text-white"
                >
                  <IoMdClose size={24} />
                </motion.button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto">
                <nav className="p-6 pt-1">
                  <motion.div
                    className="flex flex-col gap-2"
                    initial="closed"
                    animate="open"
                    variants={containerVariants}
                  >
                    {/* Show loading state while session is loading */}
                    {status === 'loading' ? (
                      <div className="flex items-center justify-center py-8">
                        <LoadingSpinner />
                        <span className="ml-2 text-theme-text">Loading...</span>
                      </div>
                    ) : (
                      <>
                        {/* Responsive navigation links */}
                        <div className="hidden lg:block">
                          {navLinksConfig.largeScreen.map((link) => (
                            <NavLink
                              key={`${link.href}-${link.text}`}
                              {...link}
                              pathname={pathname}
                              onClose={onClose}
                            />
                          ))}
                        </div>
                        <div className="lg:hidden">
                          {navLinksConfig.smallScreen.map((link) => (
                            <NavLink
                              key={`${link.href}-${link.text}`}
                              {...link}
                              pathname={pathname}
                              onClose={onClose}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </motion.div>
                </nav>
              </div>

              {/* Bottom Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="shrink-0 w-full p-6 border-t border-background bg-foreground flex flex-col gap-2"
              >
                <ThemeSwitch />

                {/* Show different buttons based on auth status */}
                {status === 'loading' ? (
                  <div className="w-full flex items-center justify-center p-3 bg-background rounded-xl">
                    <LoadingSpinner />
                  </div>
                ) : isAuthenticated ? (
                  <ActionButton icon={RiLogoutCircleRLine} text="Logout" type="button" onClick={handleLogoutClick} />
                ) : (
                  <ActionButton icon={AiOutlineUser} text="Login" href="/login" onClick={handleLoginClick} />
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        isLoading={isLoggingOut}
      />
    </>
  );
};

export default SideBar;
