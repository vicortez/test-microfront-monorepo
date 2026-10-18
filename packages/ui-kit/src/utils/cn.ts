import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'


// obs - we really do need these to be registered at __getReactRefreshIgnoredExports, otherwise the refresh will refresh
//  the whole page. (manually verified)
declare global {
  interface Window {
    __getReactRefreshIgnoredExports?: (ctx: {
      id: string
    }) => string[] | undefined
  }
}

if (typeof window !== 'undefined') {
  const prev = window.__getReactRefreshIgnoredExports
  window.__getReactRefreshIgnoredExports = (ctx) => {
    const ignored = prev ? prev(ctx) || [] : []
    return ctx.id.includes('ui-kit')
      ? [...ignored, 'cn', 'buttonVariants', 'badgeVariants']
      : ignored
  }
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
