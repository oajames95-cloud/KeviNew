"use client"

import { useState } from "react"
import { AppSidebar } from "./app-sidebar"
import { MobileSidebar } from "./mobile-sidebar"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />

      {/* Main content with header */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {children}
      </div>
    </div>
  )
}

// Export a context for children to access mobile sidebar toggle
import { createContext, useContext } from "react"

const MobileSidebarContext = createContext<{ toggle: () => void }>({ toggle: () => {} })

export function useMobileSidebar() {
  return useContext(MobileSidebarContext)
}

export function AppShellWithContext({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <MobileSidebarContext.Provider value={{ toggle: () => setMobileOpen(true) }}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <AppSidebar />
        </div>

        {/* Mobile sidebar */}
        <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />

        {/* Main content with header */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {children}
        </div>
      </div>
    </MobileSidebarContext.Provider>
  )
}
