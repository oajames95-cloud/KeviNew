"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function SignUpSuccessContent() {
  const [redirectTo, setRedirectTo] = useState("/dashboard")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRedirectTo(params.get("redirect") || "/dashboard")
  }, [])

  return (
    <div className="space-y-3">
      <Button asChild variant="outline" className="w-full">
        <Link href={`/auth/login?redirect=${encodeURIComponent(redirectTo)}`}>
          Back to sign in
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </Button>
    </div>
  )
}