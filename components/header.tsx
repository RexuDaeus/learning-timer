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
      className="border-b border-purple-500/20 bg-purple-900/30 backdrop-blur-sm sticky top-0 z-50"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-2xl font-cursive bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-purple-200"
          >
            The First 20 Hours
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user && (
            <>
              <Link href="/profile" className="flex items-center gap-2 group text-purple-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600/30 transition-transform group-hover:scale-110">
                  <span className="text-lg">{user.emoji}</span>
                </div>
                <span className="hidden md:inline-block group-hover:text-pink-300 transition-colors">{user.name}</span>
              </Link>
              <Button 
                variant="ghost" 
                onClick={logout} 
                className="text-purple-100 hover:bg-purple-700/50 hover:text-pink-300"
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}

