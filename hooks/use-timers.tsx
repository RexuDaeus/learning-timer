"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import type { Timer } from "@/types/timer"

type TimersContextType = {
  timers: Timer[]
  addTimer: (timer: Timer) => Promise<void>
  updateTimer: (timer: Timer) => Promise<void>
  deleteTimer: (id: string) => Promise<void>
  getTimer: (id: string) => Timer | undefined
  loading: boolean
}

const TimersContext = createContext<TimersContextType | undefined>(undefined)

const exampleTimer: Timer = {
  id: "example",
  title: "Learn Ukulele",
  goal: "Learn to play songs on the ukulele",
  skillBreakdown: ["Learn the chords"],
  resources: "The band 'Axis of Awesome'",
  timeLeft: 20 * 60 * 60, // 20 hours in seconds
  createdAt: new Date().toISOString(),
}

export function TimersProvider({ children }: { children: React.ReactNode }) {
  const [timers, setTimers] = useState<Timer[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Load timers from Supabase
  useEffect(() => {
    if (!user) {
      setTimers([])
      setLoading(false)
      return
    }

    const fetchTimers = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('timers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading timers:', error)
          setTimers([])
        } else {
          // Convert snake_case to camelCase
          const formattedTimers = data.map(timer => ({
            id: timer.id,
            title: timer.title,
            goal: timer.goal,
            skillBreakdown: timer.skill_breakdown,
            resources: timer.resources,
            timeLeft: timer.time_left,
            createdAt: timer.created_at
          }))
          setTimers(formattedTimers)
        }
      } catch (err) {
        console.error('Unexpected error loading timers:', err)
        setTimers([])
      } finally {
        setLoading(false)
      }
    }

    fetchTimers()

    // Set up real-time subscription for timers
    const subscription = supabase
      .channel('timers_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'timers',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchTimers()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const addTimer = async (timer: Timer) => {
    if (!user) return

    try {
      const { error } = await supabase.from('timers').insert({
        id: timer.id,
        user_id: user.id,
        title: timer.title,
        goal: timer.goal,
        skill_breakdown: timer.skillBreakdown,
        resources: timer.resources,
        time_left: timer.timeLeft,
        created_at: timer.createdAt
      })

      if (error) {
        console.error('Error adding timer:', error)
      } else {
        // Optimistically update the UI
        setTimers(prev => [...prev, timer])
      }
    } catch (err) {
      console.error('Unexpected error adding timer:', err)
    }
  }

  const updateTimer = async (updatedTimer: Timer) => {
    if (!user) return

    try {
      const { error } = await supabase.from('timers')
        .update({
          title: updatedTimer.title,
          goal: updatedTimer.goal,
          skill_breakdown: updatedTimer.skillBreakdown,
          resources: updatedTimer.resources,
          time_left: updatedTimer.timeLeft
        })
        .eq('id', updatedTimer.id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating timer:', error)
      } else {
        // Optimistically update the UI
        setTimers(prev => prev.map(timer => 
          timer.id === updatedTimer.id ? updatedTimer : timer
        ))
      }
    } catch (err) {
      console.error('Unexpected error updating timer:', err)
    }
  }

  const deleteTimer = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from('timers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting timer:', error)
      } else {
        // Optimistically update the UI
        setTimers(prev => prev.filter(timer => timer.id !== id))
      }
    } catch (err) {
      console.error('Unexpected error deleting timer:', err)
    }
  }

  const getTimer = (id: string) => {
    return timers.find(timer => timer.id === id)
  }

  return (
    <TimersContext.Provider value={{ timers, addTimer, updateTimer, deleteTimer, getTimer, loading }}>
      {children}
    </TimersContext.Provider>
  )
}

export const useTimers = () => {
  const context = useContext(TimersContext)
  if (context === undefined) {
    throw new Error("useTimers must be used within a TimersProvider")
  }
  return context
}

