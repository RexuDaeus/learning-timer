import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Tables = {
  users: {
    id: string
    email: string
    created_at: string
  }
  profiles: {
    id: string
    name: string
    emoji: string
  }
  timers: {
    id: string
    user_id: string
    title: string
    goal: string
    skill_breakdown: string[]
    resources: string
    time_left: number
    created_at: string
  }
} 