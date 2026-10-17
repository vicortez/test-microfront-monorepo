import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { Button } from './Button'

describe('Button component', () => {
  it('renders with default variant classes', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button.className).toContain('bg-primary')
    expect(button.className).toContain('text-primary-foreground')
  })

  it('applies secondary variant classes correctly', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole('button', { name: /secondary/i })
    expect(button.className).toContain('bg-secondary')
  })

  it('merges custom override classes via cn without class collision', () => {
    render(<Button className="mt-4 bg-emerald-600 px-8">Custom</Button>)
    const button = screen.getByRole('button', { name: /custom/i })
    expect(button.className).toContain('bg-emerald-600')
    expect(button.className).toContain('px-8')
    expect(button.className).not.toContain('bg-primary')
  })
})
