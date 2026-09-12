// Shared color utilities for consistent group color rendering
export const GROUP_COLORS: Record<string, { bg: string; text: string; dot: string; badge: string; border: string }> = {
  Blue: {
    bg: 'bg-blue-500',
    text: 'text-blue-600',
    dot: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    border: 'border-blue-500',
  },
  Green: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-600',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    border: 'border-emerald-500',
  },
  Purple: {
    bg: 'bg-violet-500',
    text: 'text-violet-600',
    dot: 'bg-violet-500',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
    border: 'border-violet-500',
  },
  Yellow: {
    bg: 'bg-amber-400',
    text: 'text-amber-600',
    dot: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    border: 'border-amber-400',
  },
  Red: {
    bg: 'bg-red-500',
    text: 'text-red-600',
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 border-red-200',
    border: 'border-red-500',
  },
  Orange: {
    bg: 'bg-orange-500',
    text: 'text-orange-600',
    dot: 'bg-orange-500',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    border: 'border-orange-500',
  },
  Black: {
    bg: 'bg-zinc-900',
    text: 'text-zinc-900',
    dot: 'bg-zinc-900',
    badge: 'bg-zinc-100 text-zinc-900 border-zinc-300',
    border: 'border-zinc-900',
  },
  White: {
    bg: 'bg-white',
    text: 'text-zinc-500',
    dot: 'bg-white border border-zinc-300',
    badge: 'bg-white text-zinc-700 border-zinc-300',
    border: 'border-zinc-300',
  },
};

export const getGroupColor = (color: string) => GROUP_COLORS[color] || GROUP_COLORS.Black;
