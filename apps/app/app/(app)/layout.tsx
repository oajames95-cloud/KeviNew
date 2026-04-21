import { AppShellWithContext } from "@/components/shell/app-shell"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShellWithContext>
      {children}
    </AppShellWithContext>
  )
}
