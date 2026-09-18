import type { Metadata } from 'next';
import './globals.css';
import AnimatedBackground from '@/components/AnimatedBackground';
import AudioPlayer from '@/components/AudioPlayer';
import SceneCanvasWrapper from '@/components/3d/SceneCanvasWrapper';

import IntroLoader from '@/components/IntroLoader';

import { Cinzel, Noto_Sans, VT323 } from 'next/font/google';

const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel' });
const notoSans = Noto_Sans({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-noto' });
const vt323 = VT323({ subsets: ['latin'], weight: ['400'], variable: '--font-game' });

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
      <body className={`min-h-screen flex flex-col ${notoSans.className} ${cinzel.variable} ${vt323.variable} bg-slate-950 text-white`}>
        {/* Cinematic Intro Loader */}
        <IntroLoader />

        {/* Layer 1: Background image */}
        <AnimatedBackground />

        {/* Layer 2: 3D scene (fixed, behind UI) */}
        <SceneCanvasWrapper />

        {/* Layer 3: Audio */}
        <AudioPlayer />

        {/* Layer 4: Main Content (on top) */}
        <main className="flex-1 flex flex-col relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
