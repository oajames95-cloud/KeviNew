"use client"

import Link from "next/link"
import { MessageSquarePlus, Users, Shield, Settings } from "lucide-react"

const actions = [
  {
    label: "Review Coaching Queue",
    description: "5 items need attention",
    href: "/coaching",
    icon: MessageSquarePlus,
    iconClass: "text-primary bg-primary/10",
  },
  {
    label: "View All Reps",
    description: "14 reps across 2 teams",
    href: "/reps",
    icon: Users,
    iconClass: "text-info bg-info/10",
  },
  {
    label: "Trust Center",
    description: "Review data practices",
    href: "/trust",
    icon: Shield,
    iconClass: "text-success bg-success/10",
  },
  {
    label: "Team Settings",
    description: "Manage integrations",
    href: "/settings",
    icon: Settings,
    iconClass: "text-muted-foreground bg-muted",
  },
]

export function QuickActions() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Quick Actions</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">Common tasks for managers</p>
      </div>
      <div className="grid grid-cols-2 divide-x divide-y divide-border/50">
        {actions.map(({ label, description, href, icon: Icon, iconClass }) => (
          <Link
            key={href}
            href={href}
            className="p-3 hover:bg-muted/30 transition-colors flex items-start gap-2.5 first:rounded-tl-lg even:rounded-tr-lg last:rounded-br-lg [&:nth-child(3)]:rounded-bl-lg"
          >
            <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${iconClass}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{label}</p>
              <p className="text-[11px] text-muted-foreground truncate">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
