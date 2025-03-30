"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTimers } from "@/hooks/use-timers"
import type { Timer } from "@/types/timer"
import { motion } from "framer-motion"

interface TimerFormProps {
  timer?: Timer
  isEditing?: boolean
}

export function TimerForm({ timer, isEditing = false }: TimerFormProps) {
  const router = useRouter()
  const { addTimer, updateTimer } = useTimers()
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const [title, setTitle] = useState(timer?.title || "")
  const [goal, setGoal] = useState(timer?.goal || "")
  const [skillBreakdown, setSkillBreakdown] = useState<string[]>(timer?.skillBreakdown || [""])
  const [resources, setResources] = useState(timer?.resources || "")
  const [timeLeft, setTimeLeft] = useState(timer?.timeLeft || 20 * 60 * 60) // 20 hours in seconds

  const handleAddSkill = () => {
    setSkillBreakdown([...skillBreakdown, ""])
  }

  const handleSkillChange = (index: number, value: string) => {
    const updatedSkills = [...skillBreakdown]
    updatedSkills[index] = value
    setSkillBreakdown(updatedSkills)
  }

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddSkill()
      // Focus the new input field after a short delay
      setTimeout(() => {
        const inputs = document.querySelectorAll('input[type="text"]')
        const lastInput = inputs[inputs.length - 1] as HTMLInputElement
        if (lastInput) {
          lastInput.focus()
        }
      }, 0)
    }
  }

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = [...skillBreakdown]
    updatedSkills.splice(index, 1)
    setSkillBreakdown(updatedSkills)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Filter out empty skills
    const filteredSkills = skillBreakdown.filter((skill) => skill.trim() !== "")

    if (isEditing && timer) {
      updateTimer({
        ...timer,
        title,
        goal,
        skillBreakdown: filteredSkills,
        resources,
        timeLeft,
      })
    } else {
      addTimer({
        id: Date.now().toString(),
        title,
        goal,
        skillBreakdown: filteredSkills,
        resources,
        timeLeft: 20 * 60 * 60, // 20 hours in seconds
        createdAt: new Date().toISOString(),
      })
    }

    router.push("/timers")
  }

  const handleCancel = () => {
    setShowCancelDialog(true)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

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
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <>
      <motion.form onSubmit={handleSubmit} className="space-y-8" variants={container} initial="hidden" animate="show">
        <motion.div className="text-box" variants={item}>
          <h2 className="section-header font-elegant">Title</h2>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="input-elegant"
          />
        </motion.div>

        <motion.div className="text-box" variants={item}>
          <h2 className="section-header font-elegant">Deconstruct</h2>

          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="goal">Goal</Label>
              <Textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. I will submit 9 tailored job applications per week to companies that align with my skills and career goals. My skills and career goals are…"
                className="min-h-24 input-elegant"
              />
            </div>
            <div className="text-box bg-transparent shadow-none p-0">
              <p className="text-sm text-muted-foreground">Make it a SMART goal!</p>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div>
              <Label>Skill Breakdown</Label>
              <div className="space-y-3 mt-2">
                {skillBreakdown.map((skill, index) => (
                  <motion.div
                    key={index}
                    className="flex gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Checkbox id={`skill-${index}`} className="checkbox-animate mt-2 data-[state=checked]:bg-primary" />
                    <div className="flex-1">
                      <Input
                        value={skill}
                        onChange={(e) => handleSkillChange(index, e.target.value)}
                        onKeyDown={(e) => handleSkillKeyDown(e, index)}
                        placeholder={index === 0 ? "e.g. Research the company and role" : ""}
                        className="input-elegant"
                      />
                    </div>
                    {skillBreakdown.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSkill(index)}
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        Remove
                      </Button>
                    )}
                  </motion.div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddSkill}
                  className="border-primary/20 hover:bg-primary/10 hover:text-primary"
                >
                  Add Skill
                </Button>
              </div>
            </div>
            <div className="text-box bg-transparent shadow-none p-0">
              <p className="text-sm text-muted-foreground">
                Breaking down a skill allows you to identify the most important parts that will help you achieve your
                goal and practice those first to improve performance in the least amount of time.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div className="text-box" variants={item}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h2 className="section-header font-elegant">'Self-Correct' resources</h2>
              <Textarea
                id="resources"
                value={resources}
                onChange={(e) => setResources(e.target.value)}
                placeholder="e.g. (paste links here)"
                className="min-h-24 input-elegant"
              />
            </div>
            <div className="text-box bg-transparent shadow-none p-0">
              <p className="text-sm text-muted-foreground">
                Gather three to five resources, such as books, DVDs, or courses.
              </p>
            </div>
          </div>
        </motion.div>

        {isEditing && (
          <motion.div className="text-box" variants={item}>
            <Label htmlFor="timeLeft">Time Left</Label>
            <div className="flex items-center gap-4">
              <Input
                id="timeLeft"
                type="range"
                min="0"
                max={20 * 60 * 60}
                step="900" // 15 minutes
                value={timeLeft}
                onChange={(e) => setTimeLeft(Number(e.target.value))}
                className="accent-primary"
              />
              <span className="min-w-24 text-right bg-primary/10 px-3 py-1 rounded-full text-sm">
                {formatTime(timeLeft)}
              </span>
            </div>
          </motion.div>
        )}

        <motion.div className="flex justify-end gap-4" variants={item}>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="border-primary/20 hover:bg-primary/10 hover:text-primary"
          >
            Cancel
          </Button>
          <Button type="submit" className="btn-elegant">
            <span className="relative z-10">{isEditing ? "Update Timer" : "Create Timer"}</span>
            <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
          </Button>
        </motion.div>
      </motion.form>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              Your changes will be lost if you cancel. Do you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              className="border-primary/20 hover:bg-primary/10 hover:text-primary"
            >
              Continue Editing
            </Button>
            <Button
              variant="destructive"
              onClick={() => router.push("/timers")}
              className="bg-destructive hover:bg-destructive/90"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

