'use client';

import { motion } from 'framer-motion';

// ── Water Tribe Symbol ──
export function WaterSymbol({ className = '', size = 60 }: { className?: string; size?: number }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 100 100" className={className}
      animate={{ rotateY: [0, 360] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <circle cx="50" cy="50" r="45" fill="none" stroke="#3B82F6" strokeWidth="3" opacity="0.8" />
      <path d="M50 15 C35 35, 25 50, 50 75 C75 50, 65 35, 50 15Z" fill="#3B82F6" opacity="0.7" />
      <path d="M50 75 C35 55, 25 45, 50 25 C75 45, 65 55, 50 75Z" fill="#93C5FD" opacity="0.5" />
      <circle cx="50" cy="42" r="5" fill="#BFDBFE" />
    </motion.svg>
  );
}

// ── Earth Kingdom Symbol ──
export function EarthSymbol({ className = '', size = 60 }: { className?: string; size?: number }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 100 100" className={className}
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    >
      <circle cx="50" cy="50" r="45" fill="none" stroke="#22C55E" strokeWidth="3" opacity="0.8" />
      <rect x="30" y="30" width="40" height="40" rx="4" fill="#22C55E" opacity="0.6" transform="rotate(45 50 50)" />
      <rect x="37" y="37" width="26" height="26" rx="3" fill="none" stroke="#86EFAC" strokeWidth="2" transform="rotate(45 50 50)" />
      <circle cx="50" cy="50" r="6" fill="#86EFAC" />
    </motion.svg>
  );
}

// ── Fire Nation Symbol ──
export function FireSymbol({ className = '', size = 60 }: { className?: string; size?: number }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 100 100" className={className}
      animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <circle cx="50" cy="50" r="45" fill="none" stroke="#EF4444" strokeWidth="3" opacity="0.8" />
      <motion.path
        d="M50 20 C40 35, 30 45, 35 60 C37 50, 42 45, 50 40 C58 45, 63 50, 65 60 C70 45, 60 35, 50 20Z"
        fill="#EF4444" opacity="0.8"
        animate={{ d: [
          "M50 20 C40 35, 30 45, 35 60 C37 50, 42 45, 50 40 C58 45, 63 50, 65 60 C70 45, 60 35, 50 20Z",
          "M50 18 C38 33, 28 48, 33 63 C36 52, 44 43, 50 38 C56 43, 64 52, 67 63 C72 48, 62 33, 50 18Z",
          "M50 20 C40 35, 30 45, 35 60 C37 50, 42 45, 50 40 C58 45, 63 50, 65 60 C70 45, 60 35, 50 20Z",
        ]}}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <path d="M50 35 C46 42, 43 48, 45 55 C46 50, 48 47, 50 45 C52 47, 54 50, 55 55 C57 48, 54 42, 50 35Z" fill="#FCA5A5" opacity="0.8" />
    </motion.svg>
  );
}

// ── Air Nomads Symbol ──
export function AirSymbol({ className = '', size = 60 }: { className?: string; size?: number }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 100 100" className={className}
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
    >
      <circle cx="50" cy="50" r="45" fill="none" stroke="#F97316" strokeWidth="3" opacity="0.8" />
      <motion.g animate={{ rotate: [0, -360] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
        <path d="M50 25 Q65 40 50 50 Q35 40 50 25Z" fill="#F97316" opacity="0.6" />
        <path d="M75 50 Q60 65 50 50 Q60 35 75 50Z" fill="#F97316" opacity="0.6" />
        <path d="M50 75 Q35 60 50 50 Q65 60 50 75Z" fill="#F97316" opacity="0.6" />
        <path d="M25 50 Q40 35 50 50 Q40 65 25 50Z" fill="#F97316" opacity="0.6" />
      </motion.g>
      <circle cx="50" cy="50" r="8" fill="#FDBA74" />
      <circle cx="50" cy="50" r="4" fill="#FED7AA" />
    </motion.svg>
  );
}

// ── Floating 3D Character ──
export function AvatarCharacter({ element, className = '' }: { element: 'water' | 'earth' | 'fire' | 'air'; className?: string }) {
  const characters = {
    water: '/katara.png',
    earth: '/Toph.png',
    fire: '/zuko.png',
    air: '/Aang.png',
  };

  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      animate={{
        y: [-8, 8, -8],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <img 
        src={characters[element]} 
        alt={`${element} bender`} 
        className="h-48 object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)]"
      />
    </motion.div>
  );
}

// ── Floating Element Particles ──
export function ElementParticles({ element, count = 6 }: { element: 'water' | 'earth' | 'fire' | 'air'; count?: number }) {
  const particleConfig = {
    water: { emoji: '💧', color: '#3B82F6' },
    earth: { emoji: '🪨', color: '#22C55E' },
    fire: { emoji: '🔥', color: '#EF4444' },
    air: { emoji: '🌀', color: '#F97316' },
  };

  const config = particleConfig[element];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-xl"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            rotate: [0, 360],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        >
          {config.emoji}
        </motion.div>
      ))}
    </div>
  );
}
