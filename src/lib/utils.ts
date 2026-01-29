import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string, chars = 4) {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatSol(lamports: number | string) {
  const sol = Number(lamports) / 1e9;
  return `${sol.toLocaleString()} SOL`;
}

export function formatTokens(amount: number | string) {
  return Number(amount).toLocaleString();
}