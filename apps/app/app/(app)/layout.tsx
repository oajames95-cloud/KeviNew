import { redirect } from "next/navigation"
import { AppShellWithContext } from "@/components/shell/app-shell"
import { createClient } from "@/lib/supabase/server"
import { getCurrentRep } from "@/lib/identity/current-rep"

export const dynamic = "force-dynamic"

// Auth gate for every /(app) route. Three outcomes:
//   1. not logged in              -> redirect to /auth/login
//   2. logged in, no matching rep -> show a clear "not linked" page (NO redirect
//                                     loop — fail safe so nobody hard-locks out)
//   3. logged in + matched rep    -> render the app
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const current = await getCurrentRep()

  if (!current) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md text-center">
          <h1 className="text-lg font-semibold text-foreground">Account not linked yet</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;re signed in as <span className="font-medium">{user.email}</span>, but this
            email isn&apos;t linked to a rep in any workspace yet. Ask your manager to add you, or
            connect your CRM so your team is imported.
          </p>
          <form
            action={async () => {
              "use server"
              const sb = await createClient()
              await sb.auth.signOut()
              redirect("/auth/login")
            }}
          >
            <button
              type="submit"
              className="mt-6 text-sm text-primary hover:underline"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <AppShellWithContext>{children}</AppShellWithContext>
}
