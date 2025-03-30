"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

type AuthUser = {
  id: string
  name: string
  email: string
  emoji: string
}

type AuthContextType = {
  user: AuthUser | null
  login: (email: string, password: string, remember: boolean) => Promise<{ error: string | null }>
  register: (name: string, email: string, password: string, emoji: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
  updateUser: (user: Partial<AuthUser>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check for existing Supabase session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          setUser({
            id: session.user.id,
            name: profile.name || '',
            email: session.user.email || '',
            emoji: profile.emoji || '😊'
          })
        }
      }
      
      setLoading(false)
    }

    getSession()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profile) {
            setUser({
              id: session.user.id,
              name: profile.name || '',
              email: session.user.email || '',
              emoji: profile.emoji || '😊'
            })
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Login function with Supabase
  const login = async (email: string, password: string, remember: boolean) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        return { error: error.message }
      }
      
      return { error: null }
    } catch (err) {
      console.error('Login error:', err)
      return { error: 'An unexpected error occurred' }
    }
  }

  // Register function with Supabase
  const register = async (name: string, email: string, password: string, emoji: string) => {
    try {
      // Create the user
      const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name,
            emoji
          }
        }
      })
      
      if (signUpError || !newUser) {
        return { error: signUpError?.message || 'Failed to create user' }
      }
      
      // Create a profile for the user
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: newUser.id,
          name,
          emoji
        })
      
      if (profileError) {
        return { error: profileError.message }
      }
      
      return { error: null }
    } catch (err) {
      console.error('Registration error:', err)
      return { error: 'An unexpected error occurred' }
    }
  }

  // Logout function with Supabase
  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Update user function with Supabase
  const updateUser = async (updatedUser: Partial<AuthUser>) => {
    if (!user) return

    // Update profile in the database
    const { error } = await supabase
      .from('profiles')
      .update({
        name: updatedUser.name !== undefined ? updatedUser.name : user.name,
        emoji: updatedUser.emoji !== undefined ? updatedUser.emoji : user.emoji
      })
      .eq('id', user.id)
    
    if (!error) {
      setUser({ ...user, ...updatedUser })
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

