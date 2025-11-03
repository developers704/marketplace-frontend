import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Properly constructs image URLs by handling both relative and absolute URLs
 * @param baseApi - The base API URL
 * @param imagePath - The image path (can be relative or absolute)
 * @param fallback - Fallback image path if imagePath is invalid
 * @returns Properly formatted image URL
 */
export function getImageUrl(baseApi: string, imagePath?: string, fallback?: string): string {
  // If no image path provided, return fallback
  if (!imagePath) {
    return fallback || '/assets/images/placeholder.svg'
  }

  // If imagePath is already an absolute URL (starts with http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // If imagePath starts with '/', it's already a proper relative path, just prepend baseApi
  if (imagePath.startsWith('/')) {
    return `${baseApi}${imagePath}`
  }

  // Otherwise, it's a relative path without leading slash, add it
  return `${baseApi}/${imagePath}`
}