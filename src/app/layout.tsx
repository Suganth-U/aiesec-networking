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
      <body className="min-h-screen flex flex-col font-sans bg-slate-950 text-white">
        <AnimatedBackground />
        
        {/* Header */}
        <header className="sticky top-0 z-50 w-full bg-slate-950/60 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-5xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center overflow-hidden shadow-lg shadow-cyan-500/20">
                <Logo />
              </div>
              <span className="text-base font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Network & Bond
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/40 uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Live
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
