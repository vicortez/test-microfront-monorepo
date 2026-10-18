import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { Tooltip } from './Tooltip'

describe('Tooltip component (Base UI primitive)', () => {
  it('renders trigger element properly', () => {
    render(
      <Tooltip content="Tooltip message">
        <button type="button">Hover me</button>
      </Tooltip>,
    )
    const button = screen.getByRole('button', { name: /hover me/i })
    expect(button).toBeInTheDocument()
  })
})
