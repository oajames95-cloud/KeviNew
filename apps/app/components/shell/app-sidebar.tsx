"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  MessageSquareMore,
  ShieldCheck,
  Settings,
  Activity,
  ChevronsUpDown,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { mockManager, mockTenant, mockTeams } from "@/lib/mock-data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Reps",
    href: "/reps",
    icon: Users,
  },
  {
    label: "Coaching Queue",
    href: "/coaching",
    icon: MessageSquareMore,
  },
  {
    label: "Trust Center",
    href: "/trust",
    icon: ShieldCheck,
  },
]

const secondaryItems = [
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

interface AppSidebarProps {
  onNavigate?: () => void
}

export function AppSidebar({ onNavigate }: AppSidebarProps = {}) {
  const pathname = usePathname()

  const initials = mockManager.name
    .split(" ")
    .map((n) => n[0])
    .join("")

  return (
    <aside className="flex flex-col w-56 shrink-0 border-r border-sidebar-border bg-sidebar h-screen sticky top-0">
      {/* Logo / Brand */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-sidebar-border shrink-0">
        <div className="flex items-center justify-center w-7 h-7 rounded bg-primary">
          <Activity className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-semibold text-sidebar-accent-foreground tracking-tight">
          Kevi
        </span>
      </div>

      {/* Team switcher */}
      <div className="px-3 pt-4 pb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left hover:bg-sidebar-accent transition-colors group">
              <div className="flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold bg-primary/20 text-primary shrink-0">
                {mockTenant.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-accent-foreground truncate">
                  {mockTenant.name}
                </p>
                <p className="text-[10px] text-sidebar-foreground/60 truncate">
                  {mockTeams[0].name}
                </p>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-sidebar-foreground/40 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-52 ml-1 bg-popover border-border"
            side="right"
            align="start"
          >
            <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 pb-1">
              Teams
            </DropdownMenuLabel>
            {mockTeams.map((team, i) => (
              <DropdownMenuItem key={team.id} className="flex items-center gap-2 cursor-pointer">
                <div className="flex-1">
                  <p className="text-sm font-medium">{team.name}</p>
                  <p className="text-[11px] text-muted-foreground">{team.repCount} reps</p>
                </div>
                {i === 0 && <Check className="w-3.5 h-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-muted-foreground cursor-pointer">
              Manage teams
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nav section label */}
      <div className="px-5 pb-1.5 pt-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
          Main
        </p>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  active ? "text-primary" : "text-sidebar-foreground/50"
                )}
              />
              {label}
              {label === "Coaching Queue" && (
                <span className="ml-auto flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-semibold">
                  5
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Secondary nav */}
      <div className="px-3 pb-2 flex flex-col gap-0.5">
        <div className="px-2 pb-1 pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            Account
          </p>
        </div>
        {secondaryItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  active ? "text-primary" : "text-sidebar-foreground/50"
                )}
              />
              {label}
            </Link>
          )
        })}
      </div>

      {/* User */}
      <div className="px-3 pb-4 pt-2 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-sidebar-accent transition-colors group">
              <Avatar className="w-7 h-7 shrink-0">
                <AvatarFallback className="text-[11px] font-semibold bg-primary/20 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-medium text-sidebar-accent-foreground truncate">
                  {mockManager.name}
                </p>
                <p className="text-[10px] text-sidebar-foreground/50 truncate capitalize">
                  {mockManager.role}
                </p>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-sidebar-foreground/40 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 mb-1 bg-popover border-border" side="right" align="end">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Notifications</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
