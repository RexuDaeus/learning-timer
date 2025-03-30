"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Play, Pause, RotateCcw } from "lucide-react"
import type { Timer } from "@/types/timer"
import { useTimers } from "@/hooks/use-timers"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TimerCardProps {
  timer: Timer
}

export function TimerCard({ timer }: TimerCardProps) {
  const { deleteTimer, updateTimer } = useTimers()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [checkedSkills, setCheckedSkills] = useState<Record<string, boolean>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timer.timeLeft)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Format time for display
  const formatTimeDisplay = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return { hours, minutes, seconds: secs }
  }

  // Format time for text display
  const formatTime = (seconds: number) => {
    const { hours, minutes } = formatTimeDisplay(seconds)
    return `${hours}h ${minutes}m`
  }

  // Handle timer start/pause
  const toggleTimer = () => {
    if (isRunning) {
      // Pause timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      // Save current time to timer object
      updateTimer({
        ...timer,
        timeLeft,
      })
    } else {
      // Start timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Stop timer when it reaches zero
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
              setIsRunning(false)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    setIsRunning(!isRunning)
  }

  // Reset timer
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsRunning(false)
    setTimeLeft(20 * 60 * 60) // Reset to 20 hours
    updateTimer({
      ...timer,
      timeLeft: 20 * 60 * 60,
    })
  }

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Update timer in database when it changes
  useEffect(() => {
    if (!isRunning && timerRef.current === null) {
      updateTimer({
        ...timer,
        timeLeft,
      })
    }
  }, [timeLeft, isRunning])

  const handleDelete = () => {
    deleteTimer(timer.id)
    setShowDeleteDialog(false)
  }

  const handleSkillCheck = (skill: string, index: number, checked: boolean) => {
    setCheckedSkills((prev) => ({
      ...prev,
      [`${timer.id}-${index}`]: checked,
    }))
  }

  const { hours, minutes, seconds } = formatTimeDisplay(timeLeft)

  return (
    <>
      <Card className="fancy-card">
        <CardHeader>
          <CardTitle className="text-center">{timer.title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Timer Display */}
          <div className="timer-display mx-auto max-w-md">
            <div className="flex justify-center items-end space-x-2">
              <div className="text-center">
                <div className="time-label">HOURS</div>
                <div className="time-value">{hours.toString().padStart(2, "0")}</div>
              </div>
              <div className="text-4xl font-thin mb-1">:</div>
              <div className="text-center">
                <div className="time-label">MINUTES</div>
                <div className="time-value">{minutes.toString().padStart(2, "0")}</div>
              </div>
              <div className="text-4xl font-thin mb-1">:</div>
              <div className="text-center">
                <div className="time-label">SECONDS</div>
                <div className="time-value">{seconds.toString().padStart(2, "0")}</div>
              </div>
            </div>

            <div className="timer-controls mt-4">
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent text-white border-white/30 hover:bg-white/10"
                onClick={toggleTimer}
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span className="ml-2">{isRunning ? "PAUSE" : "PLAY"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent text-white border-white/30 hover:bg-white/10"
                onClick={resetTimer}
              >
                <RotateCcw className="h-4 w-4" />
                <span className="ml-2">RESET</span>
              </Button>
            </div>
          </div>

          <div className="text-box fade-in">
            <h3 className="section-header">Goal:</h3>
            <p className="text-sm mt-1">{timer.goal}</p>
          </div>

          <div className="text-box fade-in">
            <h3 className="section-header">Skill Breakdown:</h3>
            <div className="mt-2 space-y-2">
              {timer.skillBreakdown.map((skill, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <Checkbox
                    id={`skill-${timer.id}-${index}`}
                    className="checkbox-animate mt-0.5"
                    checked={checkedSkills[`${timer.id}-${index}`] || false}
                    onCheckedChange={(checked) => handleSkillCheck(skill, index, checked === true)}
                  />
                  <Label
                    htmlFor={`skill-${timer.id}-${index}`}
                    className={`text-sm ${checkedSkills[`${timer.id}-${index}`] ? "line-through text-muted-foreground" : ""}`}
                  >
                    {skill}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="text-box fade-in">
            <h3 className="section-header">'Self-Correct' resources:</h3>
            <p className="text-sm mt-1">{timer.resources}</p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2 bg-primary/5 rounded-b-lg">
          <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(true)}>
            Delete
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href={`/edit-timer/${timer.id}`}>Edit</Link>
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="scale-in">
          <DialogHeader>
            <DialogTitle>Delete Timer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this timer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

