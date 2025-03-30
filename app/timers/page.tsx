"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { TimerCard } from "@/components/timer-card"
import { TimersProvider, useTimers } from "@/hooks/use-timers"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

function TimersContent() {
  const { timers } = useTimers()

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

  return (
    <motion.div className="container py-10" variants={container} initial="hidden" animate="show">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div variants={item} className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="hover:bg-primary/10">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-elegant font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            Congratulations! You are now ready to learn.
          </h1>
        </motion.div>
        <p className="text-muted-foreground">
          Here are your learning timers. Each timer represents a skill you're working on.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {timers.map((timer, index) => (
            <motion.div key={timer.id} variants={item} transition={{ delay: index * 0.05 }}>
              <TimerCard timer={timer} />
            </motion.div>
          ))}
        </div>

        <motion.div variants={item} className="flex justify-center">
          <Button asChild className="relative overflow-hidden group btn-elegant">
            <Link href="/create-timer">
              <span className="relative z-10">Create New Timer</span>
              <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            </Link>
          </Button>
        </motion.div>

        <motion.div variants={item} className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <p className="text-sm">
            Avoid using resources for learning as a means of procrastination. The goal is to{" "}
            <span className="font-bold">learn just enough from these resources to practice and self-correct</span> as
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

  if (!user) {
    router.push("/login")
    return null
  }

  return (
    <TimersProvider>
      <Header />
      <TimersContent />
    </TimersProvider>
  )
}

