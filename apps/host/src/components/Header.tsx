import { Badge } from '@albert-fe/ui-kit'
import { Layers, ShieldCheck } from 'lucide-react'

export function Header() {
  return (
    <header
      data-testid="host-navbar"
      className="h-16 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-40"
    >
      <div className="flex items-center space-x-3">
        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-none tracking-tight">
            Albert Modernization Shell
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            React 18 • Vite Module Federation • Tailwind v4
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Badge
          variant="outline"
          className="flex items-center space-x-1 border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20"
        >
          <ShieldCheck className="h-3.5 w-3.5 mr-1" />
          <span>Host Port 5000</span>
        </Badge>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Host + 2 Remotes Single-Page
        </span>
      </div>
    </header>
  )
}
