import React from 'react'
import AnalyticsWidget from './AnalyticsWidget'

export default function App() {
  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '40px auto',
        padding: '0 20px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <AnalyticsWidget />
    </div>
  )
}
