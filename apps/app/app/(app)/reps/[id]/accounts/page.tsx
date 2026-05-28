import { notFound } from "next/navigation"
import { mockReps, mockAccounts, mockAccountTouches } from "@/lib/mock-data"
import { RepAccountsClient } from "./rep-accounts-client"

interface RepAccountsPageProps {
  params: Promise<{ id: string }>
}

export default async function RepAccountsPage({ params }: RepAccountsPageProps) {
  const { id } = await params
  const rep = mockReps.find(r => r.id === id)

  if (!rep) {
    notFound()
  }

  // Get all accounts owned by this rep
  const repAccounts = mockAccounts.filter(a => a.ownerId === id)

  // Get all touches for these accounts in last 30 days
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  const repTouches = mockAccountTouches.filter(t => 
    repAccounts.some(a => a.id === t.accountId) &&
    new Date(t.timestamp) >= thirtyDaysAgo
  )

  // Group touches by account
  const touchesByAccount = repAccounts.reduce((acc, account) => {
    acc[account.id] = repTouches.filter(t => t.accountId === account.id)
    return acc
  }, {} as Record<string, typeof mockAccountTouches>)

  return <RepAccountsClient rep={rep} accounts={repAccounts} touchesByAccount={touchesByAccount} />
}
