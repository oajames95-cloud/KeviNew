"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  Users,
  MessageSquareMore,
  Settings,
  Activity,
  ChevronsUpDown,
  Check,
  LayoutDashboard,
  BookOpen,
  Building2,
} from "lucide-react"
import { cn } from "@/lib/utils"
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
    label: "Today",
    href: "/today",
    icon: CalendarDays,
  },
  {
    label: "Overview",
    href: "/overview",
    icon: LayoutDashboard,
  },
  {
    label: "Reps",
    href: "/reps",
    icon: Users,
  },
  {
    label: "Accounts",
    href: "/accounts",
    icon: Building2,
  },
  {
    label: "Coaching",
    href: "/coaching",
    icon: MessageSquareMore,
  },
  {
    label: "Playbook",
    href: "/playbook",
    icon: BookOpen,
  },
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

  // Static labels. TODO: make this an async server component that reads the
  // signed-in user's organization/team instead of hardcoded strings.
  const managerName = "Manager"
  const managerRole = "manager"
  const tenantName = "Sampl"
  const teamName = "Sales"
  const userInitials = "S"

  return (
    <aside className="flex flex-col w-52 shrink-0 border-r border-sidebar-border bg-sidebar h-screen sticky top-0">
      {/* Logo / Brand */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-sidebar-border shrink-0">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary">
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
            <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left hover:bg-sidebar-accent transition-colors group">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-bold bg-primary/10 text-primary shrink-0">
                {tenantName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-accent-foreground truncate">
                  {tenantName}
                </p>
                <p className="text-[10px] text-sidebar-foreground truncate">
                  {teamName}
                </p>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-sidebar-foreground shrink-0 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-52 ml-1 bg-popover border-border shadow-lg"
            side="right"
            align="start"
          >
            <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 pb-1">
              Teams
            </DropdownMenuLabel>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <div className="flex-1">
                <p className="text-sm font-medium">{teamName}</p>
              </div>
              <Check className="w-3.5 h-3.5 text-primary" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-muted-foreground cursor-pointer">
              Manage teams
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 pt-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/today" && pathname.startsWith(href))
          const isToday = href === "/today"
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  active ? "text-primary" : "text-sidebar-foreground"
                )}
              />
              {label}
              {isToday && (
                <span className="ml-auto flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                  3
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 pt-2 border-t border-sidebar-border mt-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors group">
              <Avatar className="w-7 h-7 shrink-0">
                <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-medium text-sidebar-accent-foreground truncate">
                  {managerName}
                </p>
                <p className="text-[10px] text-sidebar-foreground truncate capitalize">
                  {managerRole}
                </p>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-sidebar-foreground shrink-0 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 mb-1 bg-popover border-border shadow-lg" side="right" align="end">
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
