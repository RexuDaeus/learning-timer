"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { motion } from "framer-motion"

export function Header() {
  const { user, logout } = useAuth()

  // Don't show header on login or register pages
  if (!user) {
    return null
  }

  return (
    <motion.header
      className="border-b border-primary/20 bg-background/80 backdrop-blur-sm sticky top-0 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400"
          >
            The First 20 Hours
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user && (
            <>
              <Link href="/profile" className="flex items-center gap-2 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-110">
                  <span className="text-lg">{user.emoji}</span>
                </div>
                <span className="hidden md:inline-block group-hover:text-primary transition-colors">{user.name}</span>
              </Link>
              <Button variant="ghost" onClick={logout} className="hover:bg-primary/10 hover:text-primary">
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}

