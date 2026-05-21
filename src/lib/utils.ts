/**
 * UI Utility Functions
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn (Class Name) helper
 * Merges Tailwind classes safely using clsx and tailwind-merge.
 * Handles conditional classes and overrides correctly.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
