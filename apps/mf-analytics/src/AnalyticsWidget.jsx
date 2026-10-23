import React, { useState } from 'react'
import { Badge, Button } from '@albert-fe/ui-kit'
import styles from './AnalyticsWidget.module.css'

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
    <div data-testid="mfe-analytics-root" className={styles.analyticsContainer}>
      <div className={styles.analyticsHeader}>
        <div className={styles.analyticsTitleGroup}>
          <h2>Telemetry & Analytics</h2>
          <p>Remote 3 (Port 5003) — Pure JS, No Tailwind</p>
        </div>
        <Badge variant="outline" className={styles.analyticsBadgeTag}>
          <span>Vanilla Remote</span>
        </Badge>
      </div>

      <div className={styles.analyticsGrid}>
        <div data-testid="analytics-stat-card" className={styles.analyticsCard}>
          <div className={styles.analyticsLabel}>Avg Latency</div>
          <p className={styles.analyticsValue}>42ms</p>
          <div className={styles.analyticsChange}>↓ 4ms optimal</div>
        </div>

        <div data-testid="analytics-stat-card" className={styles.analyticsCard}>
          <div className={styles.analyticsLabel}>Throughput</div>
          <p className={styles.analyticsValue}>1.8k/s</p>
          <div className={styles.analyticsChange}>↑ 18% peak</div>
        </div>

        <div data-testid="analytics-stat-card" className={styles.analyticsCard}>
          <div className={styles.analyticsLabel}>Reports Generated</div>
          <p
            className={styles.analyticsValue}
            data-testid="analytics-report-count"
          >
            {reportCount}
          </p>
          <div className={styles.analyticsChange}>Last: {lastExportTime}</div>
        </div>
      </div>

      <div className={styles.analyticsFooter}>
        <span
          style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}
        >
          Consuming shared @albert-fe/ui-kit &lt;Button&gt; without local
          Tailwind
        </span>
        <div className={styles.analyticsBtnGroup}>
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
