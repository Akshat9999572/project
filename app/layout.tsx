Exit code: 0
Wall time: 3.6 seconds
Output:
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ContentPulse',
  description: 'Content Management Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >

      <body className='min-h-screen flex flex-col bg-white dark:bg-slate-950'>
        <header className='border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'>
          <div className='flex items-center justify-between px-6 py-4'>
            <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
              ContentPulse
            </h1>
          </div>
        </header>

        <div className='flex flex-1 overflow-hidden'>
          {/* Sidebar */}
          <aside className='w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-y-auto'>
            <nav className='p-4 space-y-2'>
              <Link
                href='/'
                className='block px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors'
              >
                Overview
              </Link>
              <Link
                href='/content-explorer'
                className='block px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors'
              >
                Content Explorer
              </Link>
              <Link
                href='/insights'
                className='block px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors'
              >
                Insights
              </Link>
              <Link
                href='/editorial-report'
                className='block px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors'
              >
                Editorial Report
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className='flex-1 overflow-y-auto'>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

