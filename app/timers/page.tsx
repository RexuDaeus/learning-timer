"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { TimerCard } from "@/components/timer-card"
import { TimersProvider, useTimers } from "@/hooks/use-timers"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

function TimersContent() {
  const { timers, loading } = useTimers()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (loading) {
    return (
      <div className="container py-10 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-t-2 border-purple-500 border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-200">Loading your timers...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div className="container py-10" variants={container} initial="hidden" animate="show">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div variants={item} className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="hover:bg-primary/10">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-cursive font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-300">
            Congratulations! You are now ready to learn.
          </h1>
        </motion.div>
        <p className="text-purple-200">
          Here are your learning timers. Each timer represents a skill you're working on.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {timers.length > 0 ? (
            timers.map((timer, index) => (
              <motion.div key={timer.id} variants={item} transition={{ delay: index * 0.05 }}>
                <TimerCard timer={timer} />
              </motion.div>
            ))
          ) : (
            <motion.div variants={item} className="col-span-2 text-center p-6 bg-purple-900/30 rounded-lg border border-purple-500/20">
              <p className="text-purple-200">You don't have any timers yet. Create your first one to get started!</p>
            </motion.div>
          )}
        </div>

        <motion.div variants={item} className="flex justify-center">
          <Button asChild className="relative overflow-hidden group bg-purple-700 hover:bg-purple-800 text-white">
            <Link href="/create-timer">
              <span className="relative z-10">Create New Timer</span>
              <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            </Link>
          </Button>
        </motion.div>

        <motion.div variants={item} className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/20">
          <p className="text-sm text-purple-200">
            Avoid using resources for learning as a means of procrastination. The goal is to{" "}
            <span className="font-bold text-white">learn just enough from these resources to practice and self-correct</span> as
            you go along, rather than trying to learn everything before starting to practice.
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function TimersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && !user) {
      console.log("No user found in TimersPage, redirecting to login")
      router.push("/login")
    }
  }, [isClient, user, router])

  // Don't render anything on the server side or if no user is found
  if (!isClient || !user) {
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
    <TimersProvider>
      <Header />
      <TimersContent />
    </TimersProvider>
  )
}

