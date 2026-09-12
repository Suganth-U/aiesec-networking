'use client';

import { usePathname } from 'next/navigation';

export default function AnimatedBackground() {
  const pathname = usePathname();
  
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none -z-10">
      <picture>
        <source media="(min-width: 768px)" srcSet="/desktop-bg.png" />
        <img src="/mobile-bg.png" alt="Background" className="w-full h-full object-cover" />
      </picture>
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
