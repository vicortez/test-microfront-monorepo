import * as React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Tooltip,
} from '@albert-fe/ui-kit'
import { Activity, TrendingUp, Users, RefreshCw } from 'lucide-react'
import './widget.css'

export interface DashboardWidgetProps {
  onRefresh?: () => void
}

export default function DashboardWidget({ onRefresh }: DashboardWidgetProps) {
  const [metrics, setMetrics] = React.useState({
    activeCases: 42,
    completionRate: 98.4,
    activeAgents: 7,
  })

  const handleRefresh = () => {
    setMetrics((prev) => ({
      activeCases: prev.activeCases + 1,
      completionRate: Number((prev.completionRate + 0.1).toFixed(1)),
      activeAgents: prev.activeAgents,
    }))
    onRefresh?.()
  }

  return (
    <section
      id="mfe-dashboard"
      data-testid="mfe-dashboard-root"
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-card-foreground">
            Dashboard Metrics
          </h2>
          <p className="text-sm text-muted-foreground">
            Live operations overview from Remote 1 (Port 5001)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            data-testid="dashboard-mfe-badge"
            variant="secondary"
            className="bg-amber-400"
          >
            Remote 1 (MF)
          </Badge>
          <Tooltip content="Refresh live operational metrics">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              aria-label="Refresh metrics"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI Card 1 */}
        {/* <Card data-testid="dashboard-kpi-card" className="border-border bg-amber-600"> */}
        <Card
          data-testid="dashboard-kpi-card"
          className="border-border bg-amber-400"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Cases
            </CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeCases}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="text-emerald-500 font-semibold mr-1">+12%</span>{' '}
              vs last week
            </p>
          </CardContent>
        </Card>

        {/* KPI Card 2 */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="text-emerald-500 font-semibold mr-1">+0.8%</span>{' '}
              target achieved
            </p>
          </CardContent>
        </Card>

        {/* KPI Card 3 */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Agents
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeAgents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All systems healthy
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
