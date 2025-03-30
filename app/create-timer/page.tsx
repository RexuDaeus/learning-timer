"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { TimerForm } from "@/components/timer-form"
import { TimersProvider } from "@/hooks/use-timers"
import { motion } from "framer-motion"

export default function CreateTimerPage() {
  const router = useRouter()
  const { user } = useAuth()

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <TimersProvider>
      <Header />
      <motion.div
        className="container py-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            Create a New Timer
          </h1>
          <p className="text-muted-foreground">
            Fill out the form below to create a new learning timer. Be specific about your goal and break down the
            skills you need to practice.
          </p>

          <TimerForm />
        </div>
      </motion.div>
    </TimersProvider>
  )
}

