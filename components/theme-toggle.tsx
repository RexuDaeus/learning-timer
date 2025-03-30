"use client"
import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled className="border-purple-500/30 bg-purple-900/20">
        <Sun className="h-[1.2rem] w-[1.2rem] text-purple-300/50" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="border-purple-500/30 bg-purple-900/20 hover:bg-purple-800/40 hover:border-pink-400/50 text-purple-100"
        >
          {theme === "light" && <Sun className="h-[1.2rem] w-[1.2rem]" />}
          {theme === "dark" && <Moon className="h-[1.2rem] w-[1.2rem]" />}
          {theme === "system" && <Laptop className="h-[1.2rem] w-[1.2rem]" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-purple-900/90 border-purple-500/50 backdrop-blur-sm text-purple-100"
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="hover:bg-purple-800/70 focus:bg-purple-800/70 cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4 text-yellow-300" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="hover:bg-purple-800/70 focus:bg-purple-800/70 cursor-pointer"
        >
          <Moon className="mr-2 h-4 w-4 text-blue-300" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="hover:bg-purple-800/70 focus:bg-purple-800/70 cursor-pointer"
        >
          <Laptop className="mr-2 h-4 w-4 text-green-300" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

