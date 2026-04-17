"use client"

import { Bell, Search, Moon, Sun, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"

interface AppHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
  onMenuClick?: () => void
}

export function AppHeader({ title, subtitle, children, onMenuClick }: AppHeaderProps) {
  const { theme, setTheme } = useTheme()

  return (
    <header className="flex items-center justify-between h-14 px-4 lg:px-6 border-b border-border bg-card shrink-0">
      {/* Left: mobile menu + page title + optional children */}
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={onMenuClick}
            aria-label="Toggle sidebar"
          >
            <Menu className="w-4 h-4" />
          </Button>
        )}
        <div>
          <h1 className="text-sm font-semibold text-foreground leading-none">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {children && (
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
            {children}
          </div>
        )}
      </div>

      {/* Right: search + actions */}
      <div className="flex items-center gap-2">
        <div className="relative hidden lg:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search reps, coaching items..."
            className="h-8 w-56 pl-8 text-xs bg-muted border-transparent focus-visible:border-border focus-visible:ring-0"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 p-0 flex items-center justify-center text-[9px] bg-primary text-primary-foreground border-2 border-card rounded-full">
            3
          </Badge>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  )
}
