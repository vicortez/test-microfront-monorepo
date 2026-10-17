import { describe, it, expect } from 'vitest'
import { cn } from '@src/utils/cn'

describe('cn utility', () => {
  it('concatenates simple class names', () => {
    expect(cn('btn', 'btn-primary')).toBe('btn btn-primary')
  })

  it('resolves conflicting Tailwind padding classes in favor of the override', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('resolves conflicting Tailwind background colors in favor of the override', () => {
    expect(cn('bg-red-500 text-white', 'bg-blue-500')).toBe(
      'text-white bg-blue-500',
    )
  })

  it('handles conditional class expressions cleanly', () => {
    const isHidden = false
    const isFlex = true
    expect(cn('base', isHidden && 'hidden', isFlex && 'flex')).toBe('base flex')
  })
})
