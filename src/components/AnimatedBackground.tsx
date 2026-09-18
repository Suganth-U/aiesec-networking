'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function AnimatedBackground() {
  const pathname = usePathname();
  
  if (pathname === '/' || pathname?.startsWith('/admin') || pathname?.startsWith('/network')) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none -z-10">
      <div className="hidden md:block absolute inset-0 w-full h-full">
        <Image src="/desktop-bg.png" alt="Desktop Background" fill className="object-cover" priority quality={60} />
      </div>
      <div className="block md:hidden absolute inset-0 w-full h-full">
        <Image src="/mobile-bg.png" alt="Mobile Background" fill className="object-cover" priority quality={60} />
      </div>
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
