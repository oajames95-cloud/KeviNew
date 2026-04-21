"use client"

import { Building2, User, ExternalLink, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CRMAccountActivityProps {
  repName: string
  crmProvider?: string
}

export function CRMAccountActivity({ repName, crmProvider = "Salesforce" }: CRMAccountActivityProps) {
  // This is a placeholder for future CRM integration
  // Shows the structure for account and contact activity views
  
  const topAccounts = [
    { id: 1, name: "Acme Corp", contacts: 3, lastActivity: "2 days ago", status: "engaged" },
    { id: 2, name: "TechVentures Inc", contacts: 2, lastActivity: "5 days ago", status: "warm" },
    { id: 3, name: "Global Solutions LLC", contacts: 1, lastActivity: "1 week ago", status: "cold" },
  ]

  const recentContacts = [
    { id: 1, name: "John Smith", title: "VP Sales", company: "Acme Corp", lastTouched: "today" },
    { id: 2, name: "Sarah Chen", title: "Director of Ops", company: "TechVentures", lastTouched: "2 days ago" },
    { id: 3, name: "Mike Johnson", title: "Sales Manager", company: "Global Solutions", lastTouched: "1 week ago" },
  ]

  return (
    <div className="space-y-6">
      {/* Top Accounts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Top Accounts (Active This Month)</h3>
          <Button variant="ghost" size="sm">
            View in {crmProvider}
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
        <div className="space-y-2">
          {topAccounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-3 bg-card border rounded-lg hover:border-primary/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 bg-muted rounded-lg">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{account.name}</p>
                  <p className="text-xs text-muted-foreground">{account.contacts} contacts</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-xs font-medium text-foreground">{account.lastActivity}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded mt-1 inline-block ${
                  account.status === 'engaged' ? 'bg-green-100 text-green-700' :
                  account.status === 'warm' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {account.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Contacts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Recent Contacts Touched</h3>
          <Button variant="ghost" size="sm">
            View all
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
        <div className="space-y-2">
          {recentContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-3 bg-card border rounded-lg hover:border-primary/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{contact.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {contact.title} at {contact.company}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-xs text-muted-foreground">{contact.lastTouched}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900 mb-2">CRM Integration Coming Soon</p>
        <p className="text-xs text-blue-800">
          Once connected, this section will show real account engagement, contact activity, and pipeline progress 
          directly from your {crmProvider} instance.
        </p>
      </div>
    </div>
  )
}
