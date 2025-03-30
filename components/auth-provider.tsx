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
      console.log(`Attempting to login user: ${email}`)
      
      // Use the correct options structure for signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Login error from Supabase:', error)
        return { error: error.message }
      }
      
      if (!data.user) {
        console.error('No user returned from login')
        return { error: 'No user found' }
      }
      
      // If remember is true, update session persistence
      if (remember) {
        await supabase.auth.updateUser({
          data: { remember_me: true }
        })
      }
      
      console.log('Login successful, session established:', data.user.id)
      
      // Get the user profile
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        
        if (profileError) {
          console.error('Error fetching profile after login:', profileError)
        } else if (profile) {
          console.log('Profile fetched after login:', profile)
          // Set the user immediately
          setUser({
            id: data.user.id,
            name: profile.name || '',
            email: data.user.email || '',
            emoji: profile.emoji || '😊'
          })
        } else {
          console.warn('No profile found for user after login:', data.user.id)
        }
      } catch (profileErr) {
        console.error('Unexpected error fetching profile after login:', profileErr)
      }
      
      return { error: null }
    } catch (err: any) {
      console.error('Unexpected login error:', err)
      return { error: err.message || 'An unexpected error occurred' }
    }
  }

  // Register function with Supabase
  const register = async (name: string, email: string, password: string, emoji: string) => {
    try {
      // First, create the user
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

      // Wait a moment for the auth policies to be applied
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        // Use the user's own session to create the profile - this works with RLS
        const { data: authData } = await supabase.auth.getSession();
        
        if (authData.session) {
          // Now create a profile for the user
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              name,
              emoji
            });
            
          if (profileError) {
            console.error("Profile creation error:", profileError);
            
            // If we still have RLS issues, create the profile using special function
            if (profileError.message.includes("violates row-level security policy")) {
              // Try a special function call to bypass RLS if your backend supports it
              const { error: functionError } = await supabase.rpc('create_profile', {
                user_id: data.user.id,
                user_name: name,
                user_emoji: emoji
              });
              
              if (functionError) {
                console.error("Function error:", functionError);
                return { error: `Account created but profile setup failed: ${functionError.message}` };
              }
            } else {
              return { error: `Account created but profile setup failed: ${profileError.message}` };
            }
          }
        } else {
          return { error: 'Account created but no session available for profile creation' };
        }
      } catch (err: any) {
        console.error('Profile creation error:', err);
        return { error: `Account created but profile setup failed: ${err.message}` };
      }
      
      // Set the user immediately
      setUser({
        id: data.user.id,
        name,
        email,
        emoji
      });
      
      return { error: null };
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

