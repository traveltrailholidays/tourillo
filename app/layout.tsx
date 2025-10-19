import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import NextTopLoader from 'nextjs-toploader';
import { Montserrat } from 'next/font/google';
import { ThemeProvider } from '@/components/common/theme-provider';
import { AutoQuoteModal } from '@/components/v1/quotes/auto-quote-modal';
import { auth } from '@/auth';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { AuthProvider } from '@/components/auth-provider';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: {
    default: 'Home - Tourillo',
    template: '%s - Tourillo',
  },
  description: '',
  icons: {
    icon: [{ url: '/images/logo/icon.webp', type: 'image/webp' }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.className} antialiased text-theme-text`}>
        <NextTopLoader color="#98FF98" height={2} showSpinner={false} />
        <Toaster position="top-right" reverseOrder={false} />
        <SessionProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
            {/* <Suspense>
              <DefaultLoader />
            </Suspense> */}
            <AuthProvider>{children}</AuthProvider>
            <AutoQuoteModal delay={10000} />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
