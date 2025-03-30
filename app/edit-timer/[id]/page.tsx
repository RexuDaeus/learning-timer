"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Header } from "@/components/header"
import { TimerForm } from "@/components/timer-form"
import { TimersProvider, useTimers } from "@/hooks/use-timers"
import type { Timer } from "@/types/timer"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

function EditTimerContent() {
  const params = useParams()
  const router = useRouter()
  const { getTimer } = useTimers()
  const [timer, setTimer] = useState<Timer | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (params.id) {
      try {
        const foundTimer = getTimer(params.id as string)
        if (foundTimer) {
          setTimer(foundTimer)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error("Error fetching timer:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
  }, [params.id, getTimer, router])

  if (loading) {
    return (
      <div className="container py-10 flex justify-center items-center min-h-[50vh]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="text-muted-foreground">Loading timer...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !timer) {
    return (
      <div className="container py-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h2 className="text-xl font-bold text-primary">Timer not found</h2>
          <p className="text-muted-foreground">The timer you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => router.push("/timers")}>Return to Timers</Button>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      className="container py-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
          Edit Timer
        </h1>
        <p className="text-muted-foreground">Update your timer details below.</p>

        <TimerForm timer={timer} isEditing />
      </div>
    </motion.div>
  )
}

export default function EditTimerPage() {
  const router = useRouter()
  const { user } = useAuth()

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <TimersProvider>
      <Header />
      <EditTimerContent />
    </TimersProvider>
  )
}

