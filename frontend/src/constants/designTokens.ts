// src/constants/designTokens.ts
export const DESIGN_TOKENS = {
  colors: {
    mutedLavender: '#A78BFA',  // Primary accent / secondary buttons
    deepViolet: '#4C1D95',     // Primary brand / headers / CTA
    lavenderMist: '#F3E8FF',   // Backgrounds / surfaces / badges
    pureWhite: '#FFFFFF',      // Card surfaces / modal bg
    amberDust: '#FBBF24',      // Accents / stars / highlighted notes
    skyBlueSoft: '#38BDF8',    // Secondary accents / location markers
    oceanNavyMuted: '#0C4A6E', // Primary readable text (avoids harsh black)
  },
  statusColors: {
    completed: {
      cardBg: 'bg-gray-100',
      badgeBg: 'bg-gray-200',
      text: 'text-gray-700',
      subtext: 'text-gray-500',
      border: 'border-gray-200',
      tag: 'Completed',
    },
    active: {
      cardBg: 'bg-emerald-50',
      badgeBg: 'bg-emerald-100',
      text: 'text-emerald-900',
      subtext: 'text-emerald-700',
      border: 'border-emerald-300',
      tag: 'Active Delivery',
    },
  },
};
