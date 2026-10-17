import * as React from 'react'
import { Card, CardContent, Button } from '@albert-fe/ui-kit'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallbackTitle: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class RemoteErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Remote loading error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-destructive/50 bg-destructive/5 p-6">
          <CardContent className="flex flex-col items-center justify-center p-4 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <h3 className="text-base font-semibold text-destructive">
              Failed to load {this.props.fallbackTitle}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Remote module could not be reached. Ensure the remote dev server
              is running.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => this.setState({ hasError: false })}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Retry
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

export function RemoteLoadingFallback({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-6 animate-pulse">
      <div className="h-6 w-48 bg-muted rounded mb-4" />
      <div className="h-32 bg-muted/60 rounded" />
      <p className="text-xs text-muted-foreground mt-3 text-center">
        Connecting to {title}...
      </p>
    </div>
  )
}
