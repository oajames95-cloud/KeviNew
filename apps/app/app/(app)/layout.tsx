import { AppShellWithContext } from "@/components/shell/app-shell"
import { ThemeProvider } from "@/components/shell/theme-provider"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AppShellWithContext>
        {children}
      </AppShellWithContext>
    </ThemeProvider>
  )
}
