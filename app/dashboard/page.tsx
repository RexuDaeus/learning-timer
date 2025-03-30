"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/components/auth-provider"
import { Header } from "@/components/header"
import { TimersProvider } from "@/hooks/use-timers"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [distractionsRemoved, setDistractionsRemoved] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && !user) {
      console.log("No user found in DashboardPage, redirecting to login")
      router.push("/login")
    }
  }, [isClient, user, router])

  const handleContinue = () => {
    if (distractionsRemoved) {
      router.push("/timers")
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

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
      <motion.div className="container py-10" variants={container} initial="hidden" animate="show">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div variants={item}>
            <Card className="fancy-card backdrop-blur-sm bg-white/10 border-purple-500/20 shadow-lg">
              <CardHeader className="bg-purple-900/20 rounded-t-lg">
                <CardTitle className="text-3xl font-cursive text-white">Welcome to The First 20 Hours!</CardTitle>
                <CardDescription className="text-purple-100 font-serif">
                  The method for effective practice <span className="font-bold text-white">applies universally</span>, regardless
                  of the subject or skill being learned. The biggest obstacle to learning isn't intelligence but{" "}
                  <span className="font-bold text-white">the fear of feeling stupid at first</span>. Putting in just 20 hours of
                  effort can help overcome this emotional barrier and make real progress. The key is to{" "}
                  <span className="font-bold text-white">choose something exciting and commit to the process</span>—whether it's a
                  new language, cooking, or drawing. With dedication, learning becomes both achievable and enjoyable.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="fancy-card backdrop-blur-sm bg-white/10 border-purple-500/20 shadow-lg overflow-hidden">
              <CardHeader className="bg-purple-900/20">
                <CardTitle className="font-cursive text-2xl text-white">Distractions Removed?</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 text-purple-100">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="distractions"
                        checked={distractionsRemoved}
                        onCheckedChange={(checked) => setDistractionsRemoved(checked === true)}
                        className="checkbox-animate data-[state=checked]:bg-purple-600"
                      />
                      <label
                        htmlFor="distractions"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Yes, I have removed distractions
                      </label>
                    </div>

                    {!distractionsRemoved && (
                      <p className="text-sm text-pink-300">Please remove distractions before continuing.</p>
                    )}

                    <Button
                      onClick={handleContinue}
                      disabled={!distractionsRemoved}
                      className="relative overflow-hidden group bg-purple-700 hover:bg-purple-800"
                    >
                      <span className="relative z-10">Continue to Timers</span>
                      {distractionsRemoved && (
                        <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                      )}
                    </Button>
                  </div>

                  <div>
                    <p className="text-sm font-serif">
                      To enhance the learning process, it is essential to remove barriers to practice, such as
                      distractions, television, and the internet. Removing distractions requires using willpower, and
                      the more one can eliminate these distractions, the more likely they are to practice and make
                      progress.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </TimersProvider>
  )
}

