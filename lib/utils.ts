import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from 'sonner'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const showToast = {
  success: (message: string) =>
    toast.success(message, {
      style: {
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        color: '#166534',
      },
    }),

  error: (message: string) =>
    toast.error(message, {
      style: {
        background: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#991b1b',
      },
    }),

  info: (message: string) =>
    toast.info(message, {
      style: {
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        color: '#1e40af',
      },
    }),

  warning: (message: string) =>
    toast.warning(message, {
      style: {
        background: '#fffbeb',
        border: '1px solid #fde68a',
        color: '#92400e',
      },
    }),
}