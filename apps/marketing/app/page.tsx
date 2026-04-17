import Link from 'next/link'
import { ArrowRight, BarChart3, Users, Zap } from 'lucide-react'

export default function MarketingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">K</span>
            </div>
            <span className="font-semibold text-lg">Kevi</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </Link>
            <Link 
              href="/auth/login" 
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-xs font-medium text-muted-foreground mb-6">
          <Zap className="w-3 h-3" />
          Now in private beta
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-6 text-balance">
          Know who to coach and why
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
          Kevi analyzes rep workflows to surface coaching opportunities that improve outcomes. 
          Stop guessing. Start coaching what matters.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link 
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Request access
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href="#how-it-works"
            className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-lg font-medium hover:bg-muted transition-colors"
          >
            See how it works
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 border-t border-border/50">
        <h2 className="text-3xl font-bold text-center mb-16">Built for frontline SDR managers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Workflow intelligence</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              See how each rep spends their day compared to top performers. Identify drift before it impacts pipeline.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Coaching queue</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Get prioritized coaching recommendations based on behavior gaps. Every 1:1 becomes actionable.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-border bg-card">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Outcome correlation</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Connect workflow habits to meetings booked and pipeline created. Coach the behaviors that drive results.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24 border-t border-border/50">
        <h2 className="text-3xl font-bold text-center mb-4">How Kevi works</h2>
        <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
          A lightweight browser extension captures workflow patterns. No content, no keylogging, just time allocation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h3 className="font-semibold mb-2">Install extension</h3>
            <p className="text-sm text-muted-foreground">
              Reps install a privacy-first Chrome extension that tracks time in sales tools.
            </p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h3 className="font-semibold mb-2">Patterns emerge</h3>
            <p className="text-sm text-muted-foreground">
              Kevi identifies top performer workflows and compares each rep to the baseline.
            </p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h3 className="font-semibold mb-2">Coach smarter</h3>
            <p className="text-sm text-muted-foreground">
              Get actionable coaching recommendations for every rep, every week.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-border/50">
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to coach smarter?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join the private beta and start surfacing coaching opportunities for your team.
          </p>
          <Link 
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Request access
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">K</span>
            </div>
            <span className="font-medium text-sm">Kevi</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Kevi. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
