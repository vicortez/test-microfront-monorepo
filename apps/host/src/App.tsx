import * as React from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import {
  RemoteErrorBoundary,
  RemoteLoadingFallback,
} from './components/RemoteBoundary'

// Lazy load remote microfrontends via Module Federation
const DashboardWidget = React.lazy(() => import('mfDashboard/DashboardWidget'))
const ChatWidget = React.lazy(() => import('mfChat/ChatWidget'))

export default function App() {
  const [theme, setTheme] = React.useState('default')

  return (
    <div
      className={`min-h-screen flex flex-col ${theme === 'default' ? '' : theme}`}
    >
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar currentTheme={theme} onThemeChange={setTheme} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 border-b border-border">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Operations Command Center
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Host shell validating single-page co-existence of two
                  independent Vite remotes.
                </p>
              </div>
            </div>

            {/* Single Page Multi-MFE Canvas: Both remotes mounted concurrently */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Remote 1: mf-dashboard (Port 5001) */}
              <div className="lg:col-span-7">
                <RemoteErrorBoundary fallbackTitle="Dashboard Remote (Port 5001)">
                  <React.Suspense
                    fallback={
                      <RemoteLoadingFallback title="Dashboard Remote (Port 5001)" />
                    }
                  >
                    <DashboardWidget />
                  </React.Suspense>
                </RemoteErrorBoundary>
              </div>

              {/* Remote 2: mf-chat (Port 5002) */}
              <div className="lg:col-span-5">
                <RemoteErrorBoundary fallbackTitle="Chat Remote (Port 5002)">
                  <React.Suspense
                    fallback={
                      <RemoteLoadingFallback title="Chat Remote (Port 5002)" />
                    }
                  >
                    <ChatWidget />
                  </React.Suspense>
                </RemoteErrorBoundary>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
