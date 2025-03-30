"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { Header } from "@/components/header"
import { EmojiPicker } from "@/components/emoji-picker"
import { motion } from "framer-motion"

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateUser, logout } = useAuth()

  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [emoji, setEmoji] = useState(user?.emoji || "😊")
  const [isLoading, setIsLoading] = useState(false)

  if (!user) {
    router.push("/login")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateUser({ name, emoji })
      // Show success message or notification here
    } catch (error) {
      console.error("Profile update failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header />
      <motion.div 
        className="container max-w-2xl py-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="backdrop-blur-sm bg-white/10 border-purple-500/20 shadow-lg">
          <CardHeader className="bg-purple-900/20 rounded-t-lg">
            <CardTitle className="text-2xl font-cursive text-white">Your Profile</CardTitle>
            <CardDescription className="text-purple-100">Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 text-purple-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center mb-4">
                <EmojiPicker value={emoji} onChange={setEmoji} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-purple-100">Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="bg-purple-900/30 border-purple-500/30 text-white focus:border-pink-400 focus-visible:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-purple-100">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="bg-purple-900/30 border-purple-500/30 text-white focus:border-pink-400 focus-visible:ring-purple-500"
                  disabled
                />
                <p className="text-xs text-purple-300">Email cannot be changed after registration</p>
              </div>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-purple-700 hover:bg-purple-800 text-white"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between bg-purple-900/10">
            <Button 
              variant="outline" 
              onClick={() => router.push("/dashboard")}
              className="border-purple-500/30 text-purple-100 hover:bg-purple-800/50 hover:text-white"
            >
              Back to Dashboard
            </Button>
            <Button 
              variant="destructive" 
              onClick={logout}
              className="bg-red-800 hover:bg-red-900"
            >
              Logout
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </>
  )
}

