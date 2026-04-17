"use client"

import { Sheet, SheetContent } from "@/components/ui/sheet"
import { AppSidebar } from "./app-sidebar"

interface MobileSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 w-56 bg-sidebar border-sidebar-border">
        <AppSidebar onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  )
}
