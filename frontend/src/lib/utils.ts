import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  if (amount >= 10000000) {
    return `₹ ${(amount / 10000000).toFixed(1)} Cr`;
  } else if (amount >= 100000) {
    return `₹ ${(amount / 100000).toFixed(1)} L`;
  } else if (amount >= 1000) {
    return `₹ ${(amount / 1000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function toTitleCase(str: string): string {
  if (!str) return str;
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export function formatMonthlyRent(amount: number) {
  const compactAmount = amount >= 1000
    ? `${Number((amount / 1000).toFixed(1)).toLocaleString('en-IN')} K`
    : amount.toLocaleString('en-IN');

  return `₹ ${compactAmount} / Month`;
}
