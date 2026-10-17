import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import App from './App'

// Mock the remote modules for host unit tests
vi.mock('mfDashboard/DashboardWidget', () => ({
  default: () => (
    <div data-testid="mfe-dashboard-root">Mock Dashboard Remote</div>
  ),
}))

vi.mock('mfChat/ChatWidget', () => ({
  default: () => <div data-testid="mfe-chat-root">Mock Chat Remote</div>,
}))

describe('Host Shell App', () => {
  it('renders navbar, sidebar, and both remote placeholders on the single page', async () => {
    render(<App />)

    expect(screen.getByTestId('host-navbar')).toBeInTheDocument()
    expect(screen.getByTestId('host-sidebar')).toBeInTheDocument()
    expect(screen.getByText('Operations Command Center')).toBeInTheDocument()

    // Verify both remotes are resolved in the host view
    expect(await screen.findByTestId('mfe-dashboard-root')).toBeInTheDocument()
    expect(await screen.findByTestId('mfe-chat-root')).toBeInTheDocument()
  })
})
