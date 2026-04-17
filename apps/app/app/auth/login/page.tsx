import { Suspense } from "react"
import { Lock } from "lucide-react"
import { LoginForm } from "./login-form"
import { Spinner } from "@/components/ui/spinner"

export const dynamic = "force-dynamic"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
          <div className="flex items-center justify-center mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
          </div>

          <h1 className="text-xl font-bold text-foreground text-center mb-2">
            Sign in to Kevi
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Enter your credentials to access rep details
          </p>

          <Suspense fallback={<div className="flex justify-center py-8"><Spinner className="w-5 h-5" /></div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}