import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as React from 'react'
import DashboardWidget from './DashboardWidget'

describe('DashboardWidget', () => {
  it('renders title, KPI cards, and badges', () => {
    render(<DashboardWidget />)

    expect(screen.getByText('Dashboard Metrics')).toBeInTheDocument()
    expect(screen.getByText('Active Cases')).toBeInTheDocument()
    expect(screen.getByText('Completion Rate')).toBeInTheDocument()
    expect(screen.getByText('Remote 1 (MF)')).toBeInTheDocument()
  })

  it('updates metrics when clicking refresh button', () => {
    render(<DashboardWidget />)

    const initialCases = screen.getByText('42')
    expect(initialCases).toBeInTheDocument()

    const refreshBtn = screen.getByRole('button', { name: /refresh metrics/i })
    fireEvent.click(refreshBtn)

    expect(screen.getByText('43')).toBeInTheDocument()
  })
})
