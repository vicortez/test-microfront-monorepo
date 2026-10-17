import { Badge } from '@albert-fe/ui-kit'
import {
  LayoutDashboard,
  MessageSquare,
  Palette,
  Sparkles,
  Check,
} from 'lucide-react'

export interface SidebarProps {
  currentTheme: string
  onThemeChange: (theme: string) => void
}

export function Sidebar({ currentTheme, onThemeChange }: SidebarProps) {
  const themes = [
    { id: 'default', label: 'Default Blue', color: 'bg-blue-600' },
    {
      id: 'theme-emerald',
      label: 'Emerald (A/B Test)',
      color: 'bg-emerald-600',
    },
    { id: 'theme-purple', label: 'Purple Accent', color: 'bg-purple-600' },
  ]

  return (
    <aside
      data-testid="host-sidebar"
      className="w-64 border-r border-border bg-card/60 p-4 flex flex-col justify-between shrink-0"
    >
      <div className="space-y-6">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-2">
            Navigation
          </h4>
          <nav className="space-y-1">
            <a
              href="#dashboard"
              className="flex items-center space-x-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground transition-all"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Combined View</span>
              <Badge
                variant="secondary"
                className="ml-auto text-[10px] px-1.5 py-0"
              >
                Single Page
              </Badge>
            </a>
            <a
              href="#chat"
              className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat Stream</span>
            </a>
          </nav>
        </div>

        {/* A/B Testing & Specificity Controls */}
        <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-card-foreground mb-1">
            <Palette className="h-3.5 w-3.5 text-primary" />
            <span>A/B Specificity Test</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3">
            Toggles global design token variables across Host + both Remotes
            dynamically.
          </p>

          <div className="space-y-1.5">
            {themes.map((t) => (
              <button
                key={t.id}
                data-testid={
                  t.id === 'theme-emerald' ? 'ab-toggle-theme' : undefined
                }
                onClick={() => onThemeChange(t.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all border ${
                  currentTheme === t.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-transparent text-muted-foreground hover:bg-accent'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${t.color}`} />
                  <span>{t.label}</span>
                </div>
                {currentTheme === t.id && (
                  <Check className="h-3 w-3 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border text-center">
        <p className="text-[11px] text-muted-foreground flex items-center justify-center">
          <Sparkles className="h-3 w-3 mr-1 text-primary" />
          Single Page Architecture
        </p>
      </div>
    </aside>
  )
}
