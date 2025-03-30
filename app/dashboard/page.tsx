"use client"

import { useState } from "react"
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

  if (!user) {
    router.push("/login")
    return null
  }

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

  return (
    <TimersProvider>
      <Header />
      <motion.div className="container py-10" variants={container} initial="hidden" animate="show">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div variants={item}>
            <Card className="fancy-card border-primary/20">
              <CardHeader className="bg-primary/5 rounded-t-lg">
                <CardTitle className="text-2xl">Welcome to The First 20 Hours!</CardTitle>
                <CardDescription>
                  The method for effective practice <span className="font-bold">applies universally</span>, regardless
                  of the subject or skill being learned. The biggest obstacle to learning isn't intelligence but{" "}
                  <span className="font-bold">the fear of feeling stupid at first</span>. Putting in just 20 hours of
                  effort can help overcome this emotional barrier and make real progress. The key is to{" "}
                  <span className="font-bold">choose something exciting and commit to the process</span>—whether it's a
                  new language, cooking, or drawing. With dedication, learning becomes both achievable and enjoyable.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="fancy-card border-primary/20 overflow-hidden">
              <CardHeader className="bg-primary/5">
                <CardTitle>Distractions Removed?</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="distractions"
                        checked={distractionsRemoved}
                        onCheckedChange={(checked) => setDistractionsRemoved(checked === true)}
                        className="checkbox-animate data-[state=checked]:bg-primary"
                      />
                      <label
                        htmlFor="distractions"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Yes, I have removed distractions
                      </label>
                    </div>

                    {!distractionsRemoved && (
                      <p className="text-sm text-red-500">Please remove distractions before continuing.</p>
                    )}

                    <Button
                      onClick={handleContinue}
                      disabled={!distractionsRemoved}
                      className="relative overflow-hidden group"
                    >
                      <span className="relative z-10">Continue to Timers</span>
                      {distractionsRemoved && (
                        <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                      )}
                    </Button>
                  </div>

                  <div>
                    <p className="text-sm">
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

