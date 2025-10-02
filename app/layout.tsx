import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import ToasterWrapper  from "@/components/ToasterWrapper"
import { FloatingChat } from "@/components/floating-chat"
import "./globals.css"

export const metadata: Metadata = {
  title: "Quick Market - Plan Ahead. Save Big. Eat Better.",
  description:
    "Get the cheapest groceries in Lagos when you plan ahead. Quick Market helps you save by buying in bulk and delivering to your area on schedule.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <ToasterWrapper /> {/* ✅ Client-only wrapper */}
        <FloatingChat />
        <Analytics />
      </body>
    </html>
  )
}
