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
  error: string | null
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
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  
  // Reset state when user changes
  useEffect(() => {
    setTimers([])
    setLoading(true)
    setError(null)
  }, [user?.id])

  // Load timers from Supabase
  useEffect(() => {
    let isMounted = true;
    let realtimeSubscription: any;
    
    if (!user) {
      setTimers([])
      setLoading(false)
      return () => {
        isMounted = false;
      }
    }

    const fetchTimers = async () => {
      if (!isMounted) return;
      
      setLoading(true)
      setError(null)
      
      try {
        console.log("Fetching timers for user:", user.id);
        const { data, error } = await supabase
          .from('timers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading timers:', error)
          if (isMounted) {
            setError(error.message)
            setTimers([])
          }
        } else {
          if (!isMounted) return;
          
          // Convert snake_case to camelCase
          const formattedTimers = data.map(timer => ({
            id: timer.id,
            title: timer.title,
            goal: timer.goal,
            skillBreakdown: timer.skill_breakdown || [],
            resources: timer.resources || '',
            timeLeft: timer.time_left,
            createdAt: timer.created_at
          }))
          
          console.log("Fetched timers:", formattedTimers);
          setTimers(formattedTimers)
          setError(null)
        }
      } catch (err: any) {
        console.error('Unexpected error loading timers:', err)
        if (isMounted) {
          setError(err.message || 'Failed to load timers')
          setTimers([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchTimers()

    // Set up real-time subscription for timers
    if (user) {
      realtimeSubscription = supabase
        .channel('timers_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'timers',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          console.log('Real-time update received:', payload);
          fetchTimers()
        })
        .subscribe((status) => {
          console.log('Real-time subscription status:', status);
        })
    }

    return () => {
      isMounted = false;
      if (realtimeSubscription) {
        realtimeSubscription.unsubscribe()
      }
    }
  }, [user])

  const addTimer = async (timer: Timer) => {
    if (!user) return

    setError(null)
    
    try {
      console.log("Adding new timer:", timer);
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
        setError(error.message)
      } else {
        // Optimistically update the UI
        setTimers(prev => [...prev, timer])
      }
    } catch (err: any) {
      console.error('Unexpected error adding timer:', err)
      setError(err.message || 'Failed to add timer')
    }
  }

  const updateTimer = async (updatedTimer: Timer) => {
    if (!user) return

    setError(null)
    
    try {
      console.log("Updating timer:", updatedTimer);
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
        setError(error.message)
      } else {
        // Optimistically update the UI
        setTimers(prev => prev.map(timer => 
          timer.id === updatedTimer.id ? updatedTimer : timer
        ))
      }
    } catch (err: any) {
      console.error('Unexpected error updating timer:', err)
      setError(err.message || 'Failed to update timer')
    }
  }

  const deleteTimer = async (id: string) => {
    if (!user) return

    setError(null)
    
    try {
      console.log("Deleting timer:", id);
      const { error } = await supabase.from('timers')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting timer:', error)
        setError(error.message)
      } else {
        // Optimistically update the UI
        setTimers(prev => prev.filter(timer => timer.id !== id))
      }
    } catch (err: any) {
      console.error('Unexpected error deleting timer:', err)
      setError(err.message || 'Failed to delete timer')
    }
  }

  const getTimer = (id: string) => {
    return timers.find(timer => timer.id === id)
  }

  return (
    <TimersContext.Provider value={{ timers, addTimer, updateTimer, deleteTimer, getTimer, loading, error }}>
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

