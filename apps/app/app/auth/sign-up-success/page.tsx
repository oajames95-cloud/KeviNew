import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Mail, ArrowRight } from "lucide-react"
import { SignUpSuccessContent } from "./sign-up-success-content"

// Force dynamic rendering to avoid useSearchParams prerender issues
export const dynamic = "force-dynamic"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-border bg-card p-8 shadow-lg text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-success" />
            </div>
          </div>

          <h1 className="text-xl font-bold text-foreground mb-2">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            We sent you a confirmation link. Click the link in your email to activate your account and access rep details.
          </p>

          <Suspense fallback={
            <div className="space-y-3">
              <Button variant="outline" className="w-full" disabled>
                Back to sign in
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          }>
            <SignUpSuccessContent />
          </Suspense>

          <p className="text-[10px] text-muted-foreground mt-6">
            Didn&apos;t receive the email? Check your spam folder or try signing up again.
          </p>
        </div>
      </div>
    </div>
  )
}
