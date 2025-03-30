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
        // Log session for debugging
        console.log("Found existing session:", session.user.id)
        
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (error) {
            console.error("Error fetching profile:", error)
          } else if (profile) {
            console.log("Profile loaded:", profile)
            setUser({
              id: session.user.id,
              name: profile.name || '',
              email: session.user.email || '',
              emoji: profile.emoji || '😊'
            })
          } else {
            console.log("No profile found for user:", session.user.id)
          }
        } catch (err) {
          console.error("Unexpected error loading profile:", err)
        }
      }
      
      setLoading(false)
    }

    getSession()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user.id)
        
        if (event === 'SIGNED_IN' && session) {
          try {
            // Check if profile exists
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (error && error.code !== 'PGRST116') { // Not found error
              console.error("Error checking for profile:", error)
            }
            
            if (profile) {
              setUser({
                id: session.user.id,
                name: profile.name || '',
                email: session.user.email || '',
                emoji: profile.emoji || '😊'
              })
            } else {
              // Try to create profile from session metadata
              const metadata = session.user.user_metadata
              if (metadata && metadata.name) {
                const { error: insertError } = await supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    name: metadata.name,
                    emoji: metadata.emoji || '😊'
                  })
                
                if (insertError) {
                  console.error("Error creating profile from metadata:", insertError)
                } else {
                  setUser({
                    id: session.user.id,
                    name: metadata.name,
                    email: session.user.email || '',
                    emoji: metadata.emoji || '😊'
                  })
                }
              }
            }
          } catch (err) {
            console.error("Error handling auth state change:", err)
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        return { error: error.message }
      }
      
      return { error: null }
    } catch (err: any) {
      console.error('Login error:', err)
      return { error: err.message || 'An unexpected error occurred' }
    }
  }

  // Register function with Supabase
  const register = async (name: string, email: string, password: string, emoji: string) => {
    try {
      // Create the user
      const { data, error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name,
            emoji
          }
        }
      })
      
      if (signUpError) {
        console.error("Sign up error:", signUpError)
        return { error: signUpError.message }
      }
      
      if (!data.user) {
        return { error: 'Failed to create user' }
      }
      
      // Immediately create a profile for the user
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          name,
          emoji
        })
      
      if (profileError) {
        console.error("Profile creation error:", profileError)
        return { error: `Account created but profile setup failed: ${profileError.message}` }
      }
      
      // Set the user immediately to avoid waiting for onAuthStateChange
      setUser({
        id: data.user.id,
        name,
        email,
        emoji
      })
      
      return { error: null }
    } catch (err: any) {
      console.error('Registration error:', err)
      return { error: err.message || 'An unexpected error occurred' }
    }
  }

  // Logout function with Supabase
  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/login')
  }

  // Update user function with Supabase
  const updateUser = async (updatedUser: Partial<AuthUser>) => {
    if (!user) return

    try {
      // Update profile in the database
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updatedUser.name !== undefined ? updatedUser.name : user.name,
          emoji: updatedUser.emoji !== undefined ? updatedUser.emoji : user.emoji
        })
        .eq('id', user.id)
      
      if (error) {
        console.error("Error updating profile:", error)
      } else {
        setUser({ ...user, ...updatedUser })
      }
    } catch (err) {
      console.error("Unexpected error updating profile:", err)
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

