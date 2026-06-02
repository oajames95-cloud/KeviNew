"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { AlertCircle, MailCheck } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [redirectTo, setRedirectTo] = useState("/dashboard")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRedirectTo(params.get("redirect") || "/dashboard")
  }, [])

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
        // Only allow existing users to sign in via this form; set true if you
        // want the magic link to also create brand-new accounts.
        shouldCreateUser: true,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center gap-3 py-4">
        <div className="p-3 rounded-full bg-primary/10">
          <MailCheck className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">Check your email</p>
          <p className="text-sm text-muted-foreground mt-1">
            We sent a sign-in link to <span className="font-medium">{email}</span>. Click it to log
            in — you can close this tab.
          </p>
        </div>
        <button
          onClick={() => {
            setSent(false)
            setEmail("")
          }}
          className="text-sm text-primary hover:underline mt-2"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <>
      {error && (
        <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleMagicLink}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="mt-1.5"
            />
          </Field>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? <Spinner className="w-4 h-4" /> : "Email me a sign-in link"}
          </Button>
        </FieldGroup>
      </form>

      <p className="text-xs text-muted-foreground text-center mt-6">
        We&apos;ll email you a secure link — no password needed.
      </p>
    </>
  )
}
