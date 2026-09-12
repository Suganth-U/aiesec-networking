import type { Metadata } from 'next';
import './globals.css';
import Logo from '@/components/Logo';

import AnimatedBackground from '@/components/AnimatedBackground';

export const metadata: Metadata = {
  title: 'AIESEC Network & Bond',
  description: 'Real-time event networking for AIESEC.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans bg-transparent text-zinc-900">
        <AnimatedBackground />
        
        {/* Minimal Top Bar */}
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200">
          <div className="max-w-5xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center overflow-hidden border border-zinc-200">
                <Logo />
              </div>
              <span className="text-base font-semibold tracking-tight text-zinc-900">
                AIESEC Network
              </span>
            </div>
            <div className="text-xs font-medium text-zinc-400 tracking-wide uppercase">
              Live Event
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
