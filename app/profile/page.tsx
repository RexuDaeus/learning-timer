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
      updateUser({ name, email, emoji })
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
      <div className="container max-w-2xl py-10">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center mb-4">
                <EmojiPicker value={emoji} onChange={setEmoji} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}

