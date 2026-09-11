import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateDonationId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `SEVA-DON-${year}-${randomNum}`;
}

export function generateVolunteerId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `SEVA-VOL-${randomNum}`;
}

export function generateBeneficiaryId(): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `SEVA-BEN-${randomNum}`;
}

export function generateEventId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `SEVA-DIST-${year}-${randomNum}`;
}
