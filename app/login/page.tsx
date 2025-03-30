"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("Attempting login for:", email)
      const result = await login(email, password, rememberMe)
      if (result.error) {
        console.error("Login returned error:", result.error)
        setError(result.error)
      } else {
        // Get the from parameter for redirection
        const from = searchParams.get('from') || '/dashboard'
        console.log("Login successful, redirecting to:", from)
        
        // Add a slight delay to allow the session to be properly set
        setTimeout(() => {
          router.push(from)
        }, 500)
      }
    } catch (error: any) {
      console.error("Login exception:", error)
      setError(error?.message || "Login failed. Please check your credentials and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render form on server
  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center p-4 bg-[url('/purple-bg.svg')] bg-cover bg-center">
        <div className="text-center">
          <div className="w-8 h-8 border-t-2 border-purple-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-200">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex items-center justify-center p-4 bg-[url('/purple-bg.svg')] bg-cover bg-center overflow-hidden">
      <motion.div
        className="absolute top-4 right-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <ThemeToggle />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-sm bg-white/10 border-purple-500/20 shadow-lg shadow-purple-500/10">
          <CardHeader className="space-y-1">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <CardTitle className="text-2xl text-center font-cursive bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-300">
                The First 20 Hours
              </CardTitle>
            </motion.div>
            <CardDescription className="text-center text-purple-100">Login to your account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="email" className="text-purple-100">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-purple-900/30 border-purple-500/30 text-white focus:border-pink-400 focus-visible:ring-purple-500"
                />
              </motion.div>
              <motion.div
                className="space-y-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Label htmlFor="password" className="text-purple-100">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-purple-900/30 border-purple-500/30 text-white focus:border-pink-400 focus-visible:ring-purple-500"
                />
              </motion.div>
              <motion.div
                className="flex items-center space-x-2"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  className="checkbox-animate data-[state=checked]:bg-purple-600"
                />
                <Label htmlFor="remember" className="text-sm text-purple-100">
                  Keep me signed in
                </Label>
              </motion.div>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
                <Button 
                  type="submit" 
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white" 
                  disabled={isLoading}
                >
                  <span className="relative z-10">{isLoading ? "Logging in..." : "Login"}</span>
                  {!isLoading && (
                    <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <motion.p
              className="text-sm text-purple-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Don't have an account?{" "}
              <Link href="/register" className="text-pink-300 hover:text-pink-200 hover:underline">
                Register
              </Link>
            </motion.p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

