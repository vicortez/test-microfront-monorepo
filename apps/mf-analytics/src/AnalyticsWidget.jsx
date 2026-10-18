import React, { useState } from 'react'
import { Badge, Button } from '@albert-fe/ui-kit'
import './AnalyticsWidget.css'

export default function AnalyticsWidget() {
  const [reportCount, setReportCount] = useState(14)
  const [lastExportTime, setLastExportTime] = useState('Today, 14:32')

  const handleExport = () => {
    setReportCount((c) => c + 1)
    setLastExportTime('Just now')
  }

  const handleReset = () => {
    setReportCount(14)
    setLastExportTime('Today, 14:32')
  }

  return (
    <div data-testid="mfe-analytics-root" className="analytics-container">
      <div className="analytics-header">
        <div className="analytics-title-group">
          <h2>Telemetry & Analytics</h2>
          <p>Remote 3 (Port 5003) — Pure JS, No Tailwind</p>
        </div>
        <Badge variant="outline" className="analytics-badge-tag">
          <span>Vanilla Remote</span>
        </Badge>
      </div>

      <div className="analytics-grid">
        <div data-testid="analytics-stat-card" className="analytics-card">
          <div className="analytics-label">Avg Latency</div>
          <p className="analytics-value">42ms</p>
          <div className="analytics-change">↓ 4ms optimal</div>
        </div>

        <div data-testid="analytics-stat-card" className="analytics-card">
          <div className="analytics-label">Throughput</div>
          <p className="analytics-value">1.8k/s</p>
          <div className="analytics-change">↑ 18% peak</div>
        </div>

        <div data-testid="analytics-stat-card" className="analytics-card">
          <div className="analytics-label">Reports Generated</div>
          <p className="analytics-value" data-testid="analytics-report-count">
            {reportCount}
          </p>
          <div className="analytics-change">Last: {lastExportTime}</div>
        </div>
      </div>

      <div className="analytics-footer">
        <span
          style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}
        >
          Consuming shared @albert-fe/ui-kit &lt;Button&gt; without local
          Tailwind
        </span>
        <div className="analytics-actions analytics-btn-group">
          <Button
            data-testid="analytics-reset-btn"
            variant="outline"
            size="sm"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            data-testid="analytics-export-btn"
            variant="default"
            size="sm"
            onClick={handleExport}
          >
            Generate Report
          </Button>
        </div>
      </div>
    </div>
  )
}
