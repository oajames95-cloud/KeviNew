import type { Metadata, Viewport } from "next"
import { Montserrat, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
})

export const metadata: Metadata = {
  title: "Kevi — Coaching Intelligence for SDR Leaders",
  description:
    "A coaching intelligence platform for SDR managers. Identify winning habits, surface pattern drift, and turn behavior into coaching actions.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#FAFAF9",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${jetbrainsMono.variable} bg-background`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
