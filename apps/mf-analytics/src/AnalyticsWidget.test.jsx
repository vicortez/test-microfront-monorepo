import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import AnalyticsWidget from './AnalyticsWidget'

describe('AnalyticsWidget (Pure JS Remote without Tailwind)', () => {
  it('renders analytics metrics and UI Kit Button correctly', () => {
    render(<AnalyticsWidget />)
    expect(screen.getByText('Telemetry & Analytics')).toBeInTheDocument()
    expect(screen.getByText('Vanilla Remote')).toBeInTheDocument()

    const exportBtn = screen.getByTestId('analytics-export-btn')
    expect(exportBtn).toBeInTheDocument()
    expect(exportBtn.className).toContain('bg-primary')
  })

  it('updates report count when UI Kit Button is clicked', () => {
    render(<AnalyticsWidget />)
    const countDisplay = screen.getByTestId('analytics-report-count')
    expect(countDisplay.textContent).toBe('14')

    const exportBtn = screen.getByTestId('analytics-export-btn')
    fireEvent.click(exportBtn)

    expect(countDisplay.textContent).toBe('15')
  })
})
