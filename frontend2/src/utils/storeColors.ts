// src/utils/storeColors.ts
import { useMemo } from 'react';

// Soft, delightful pastel colors that harmonize with #0C4A6E text and the design tokens
const STORE_COLOR_PALETTE = [
  { bg: '#F3E8FF', border: '#D8B4FE', text: '#4C1D95' }, // Lavender Mist
  { bg: '#FEF3C7', border: '#FDE68A', text: '#92400E' }, // Soft Amber
  { bg: '#E0F2FE', border: '#BAE6FD', text: '#0369A1' }, // Sky Soft
  { bg: '#DCFCE7', border: '#BBF7D0', text: '#166534' }, // Light Sage / Mint
  { bg: '#FFE4E6', border: '#FECDD3', text: '#9F1239' }, // Soft Rose
  { bg: '#FFEDD5', border: '#FED7AA', text: '#9A3412' }, // Warm Apricot
  { bg: '#EDE9FE', border: '#DDD6FE', text: '#5B21B6' }, // Iris
  { bg: '#F1F5F9', border: '#E2E8F0', text: '#334155' }, // Slate Pearl
];

// Persistent session store to ensure color assignment remains consistent throughout user session
const sessionStoreColorMap: Record<string, { bg: string; border: string; text: string }> = {};

/**
 * Returns a consistent, memoized style config for any given storeName.
 * Same storeName will ALWAYS receive the same background color throughout the browser session.
 */
export function getStoreStyle(storeName: string): { bg: string; border: string; text: string } {
  if (!storeName) {
    return STORE_COLOR_PALETTE[0];
  }

  const trimmed = storeName.trim();
  if (sessionStoreColorMap[trimmed]) {
    return sessionStoreColorMap[trimmed];
  }

  // Deterministic hash based on store name string
  let hash = 0;
  for (let i = 0; i < trimmed.length; i++) {
    hash = (hash << 5) - hash + trimmed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % STORE_COLOR_PALETTE.length;
  const assigned = STORE_COLOR_PALETTE[index];
  sessionStoreColorMap[trimmed] = assigned;
  return assigned;
}

/**
 * React hook to memoize store color for a component
 */
export function useStoreColor(storeName: string) {
  return useMemo(() => getStoreStyle(storeName), [storeName]);
}
