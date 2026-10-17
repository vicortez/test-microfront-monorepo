import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as React from 'react'
import ChatWidget from './ChatWidget'

describe('ChatWidget', () => {
  it('renders chat title and initial messages', () => {
    render(<ChatWidget />)

    expect(screen.getByText('Live Chat')).toBeInTheDocument()
    expect(screen.getByText('Remote 2 (MF)')).toBeInTheDocument()
    expect(
      screen.getByText('Case #1042 has been verified and processed.'),
    ).toBeInTheDocument()
  })

  it('allows user to type and send a new message', () => {
    render(<ChatWidget />)

    const input = screen.getByPlaceholderText('Type an operational update...')
    const sendBtn = screen.getByRole('button', { name: /send/i })

    fireEvent.change(input, {
      target: { value: 'Deployment completed successfully.' },
    })
    fireEvent.click(sendBtn)

    expect(
      screen.getByText('Deployment completed successfully.'),
    ).toBeInTheDocument()
    expect(input).toHaveValue('')
  })
})
