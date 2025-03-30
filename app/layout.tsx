import type React from "react"
import type { Metadata } from "next"
import { Source_Sans_3, Playfair_Display } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"

const sourceSansPro = Source_Sans_3({ 
  subsets: ["latin"],
  variable: '--font-source-sans-pro',
  weight: ['300', '400', '500', '600']
})

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair-display',
})

export const metadata: Metadata = {
  title: "The First 20 Hours",
  description: "Track your learning progress with the 20-hour rule",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sourceSansPro.variable} ${playfairDisplay.variable} font-body`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="theme-preference"
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'