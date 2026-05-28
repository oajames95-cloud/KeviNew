"use client"

import { useState } from "react"
import { AppHeader } from "@/components/shell/app-header"
import { useMobileSidebar } from "@/components/shell/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Users, Database, Shield, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const SECTIONS = [
  { id: "profile", label: "Profile", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Database },
  { id: "security", label: "Security", icon: Shield },
]

// Static defaults — replaced once auth/session is wired up
const MANAGER_NAME = "Jordan Rivera"
const MANAGER_EMAIL = "jordan@example.com"
const MANAGER_ROLE = "manager"
const TENANT_NAME = "Acme Corp"

export default function SettingsPage() {
  const { toggle } = useMobileSidebar()
  const [activeSection, setActiveSection] = useState("profile")

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AppHeader title="Settings" subtitle={TENANT_NAME} onMenuClick={toggle} />
      <div className="flex flex-1 overflow-hidden">
        {/* Settings nav */}
        <nav className="w-48 shrink-0 border-r border-border bg-card p-3 space-y-0.5 hidden sm:block">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors text-left",
                activeSection === id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Mobile section tabs */}
        <div className="sm:hidden flex items-center gap-1 px-4 py-3 border-b border-border bg-card overflow-x-auto shrink-0">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn(
                "px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap",
                activeSection === id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Settings content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 max-w-2xl">
          {activeSection === "profile" && <ProfileSettings />}
          {activeSection === "notifications" && <NotificationSettings />}
          {activeSection === "integrations" && <IntegrationSettings />}
          {activeSection === "security" && <SecuritySettings />}
        </div>
      </div>
    </div>
  )
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-6 py-4 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  )
}

function ProfileSettings() {
  const [name, setName] = useState(MANAGER_NAME)
  const [email, setEmail] = useState(MANAGER_EMAIL)

  return (
    <div>
      <SectionHeader
        title="Profile"
        description="Manage your account details and preferences."
      />
      <div className="rounded-lg border border-border bg-card px-5 divide-y divide-border/50">
        <SettingRow label="Display name" description="Shown across the app and in coaching notes.">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 w-full sm:w-48 text-xs"
          />
        </SettingRow>
        <SettingRow label="Email address" description="Used for login and notifications.">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-8 w-full sm:w-48 text-xs"
            type="email"
          />
        </SettingRow>
        <SettingRow label="Role" description="Determines your access level in the platform.">
          <span className="text-xs font-medium capitalize text-foreground px-2 py-1 rounded bg-muted">
            {MANAGER_ROLE}
          </span>
        </SettingRow>
        <SettingRow label="Organization" description="The tenant this account belongs to.">
          <span className="text-xs text-muted-foreground">{TENANT_NAME}</span>
        </SettingRow>
      </div>
      <div className="mt-4 flex justify-end">
        <Button size="sm" className="text-xs">Save changes</Button>
      </div>
    </div>
  )
}

function NotificationSettings() {
  const [emailDigest, setEmailDigest] = useState(true)
  const [newFlags, setNewFlags] = useState(true)
  const [weeklyReport, setWeeklyReport] = useState(false)

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative w-9 h-5 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted-foreground/30"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
          checked && "translate-x-4"
        )}
      />
    </button>
  )

  return (
    <div>
      <SectionHeader
        title="Notifications"
        description="Control how and when you receive alerts."
      />
      <div className="rounded-lg border border-border bg-card px-5 divide-y divide-border/50">
        <SettingRow label="Daily email digest" description="Receive a summary of new coaching flags each morning.">
          <Toggle checked={emailDigest} onChange={() => setEmailDigest((p) => !p)} />
        </SettingRow>
        <SettingRow label="New flag alerts" description="Get notified immediately when a rep is flagged as critical.">
          <Toggle checked={newFlags} onChange={() => setNewFlags((p) => !p)} />
        </SettingRow>
        <SettingRow label="Weekly performance report" description="Receive a week-over-week summary for your team.">
          <Toggle checked={weeklyReport} onChange={() => setWeeklyReport((p) => !p)} />
        </SettingRow>
      </div>
    </div>
  )
}

function IntegrationSettings() {
  const integrations = [
    { name: "Salesforce CRM", status: "connected", type: "CRM" },
    { name: "Google Calendar", status: "connected", type: "Calendar" },
    { name: "Outreach", status: "connected", type: "Sequencer" },
    { name: "Gong", status: "error", type: "Dialer" },
    { name: "HubSpot", status: "disconnected", type: "CRM" },
    { name: "Salesloft", status: "disconnected", type: "Sequencer" },
  ]

  return (
    <div>
      <SectionHeader
        title="Integrations"
        description="Manage connected data sources and permissions."
      />
      <div className="rounded-lg border border-border bg-card divide-y divide-border/50">
        {integrations.map((integ) => (
          <div
            key={integ.name}
            className="flex items-center justify-between px-5 py-3.5"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{integ.name}</p>
              <p className="text-[11px] text-muted-foreground">{integ.type}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "text-[11px] font-medium hidden sm:block",
                  integ.status === "connected" && "text-success",
                  integ.status === "error" && "text-destructive",
                  integ.status === "disconnected" && "text-muted-foreground"
                )}
              >
                {integ.status === "connected"
                  ? "Connected"
                  : integ.status === "error"
                  ? "Error"
                  : "Not connected"}
              </span>
              <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                {integ.status === "disconnected" ? "Connect" : "Manage"}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div>
      <SectionHeader
        title="Security"
        description="Authentication and session settings."
      />
      <div className="rounded-lg border border-border bg-card px-5 divide-y divide-border/50">
        <SettingRow
          label="Single sign-on (SSO)"
          description="Use your organization&apos;s identity provider to authenticate."
        >
          <span className="text-xs text-muted-foreground px-2 py-1 rounded bg-muted">Enterprise plan</span>
        </SettingRow>
        <SettingRow
          label="Two-factor authentication"
          description="Add an extra layer of security to your account."
        >
          <Button variant="outline" size="sm" className="h-7 text-xs">
            Enable 2FA
          </Button>
        </SettingRow>
        <SettingRow
          label="Active sessions"
          description="Manage devices where you are currently signed in."
        >
          <Button variant="outline" size="sm" className="h-7 text-xs">
            View sessions
          </Button>
        </SettingRow>
        <SettingRow
          label="Change password"
          description="Update your password regularly for best security."
        >
          <Button variant="outline" size="sm" className="h-7 text-xs">
            Change
          </Button>
        </SettingRow>
      </div>
    </div>
  )
}
