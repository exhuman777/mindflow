import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

// Client for browser (uses anon key with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

// Types for database tables
export interface Profile {
  id: string
  name: string | null
  language: string
  voice_preference: string
  tier: 'free' | 'premium'
  created_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  stress_level: number
  sleep_quality: number
  goals: string[]
  meditation_experience: 'beginner' | 'intermediate' | 'advanced'
  preferred_duration: number
  preferred_time: 'morning' | 'evening' | 'anytime'
  triggers: string[]
  updated_at: string
}

export interface Meditation {
  id: string
  user_id: string
  title: string
  script: string
  audio_url: string | null
  duration_seconds: number
  theme: string
  language: string
  created_at: string
}

export interface Feedback {
  id: string
  meditation_id: string
  user_id: string
  rating: number
  mood_before: number
  mood_after: number
  notes: string | null
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  status: 'active' | 'canceled' | 'past_due'
  plan: 'monthly' | 'yearly'
  current_period_end: string
  created_at: string
}

// Helper functions

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  return data
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching preferences:', error)
    return null
  }
  return data
}

export async function saveMeditation(meditation: Omit<Meditation, 'id' | 'created_at'>): Promise<Meditation | null> {
  const client = supabaseAdmin || supabase

  const { data, error } = await client
    .from('meditations')
    .insert(meditation)
    .select()
    .single()

  if (error) {
    console.error('Error saving meditation:', error)
    return null
  }
  return data
}

export async function getUserMeditations(userId: string, limit = 10): Promise<Meditation[]> {
  const { data, error } = await supabase
    .from('meditations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching meditations:', error)
    return []
  }
  return data
}

export async function saveFeedback(feedback: Omit<Feedback, 'id' | 'created_at'>): Promise<Feedback | null> {
  const { data, error } = await supabase
    .from('feedback')
    .insert(feedback)
    .select()
    .single()

  if (error) {
    console.error('Error saving feedback:', error)
    return null
  }
  return data
}

// Upload audio to Supabase Storage
export async function uploadAudio(userId: string, audioBuffer: Buffer, filename: string): Promise<string | null> {
  const client = supabaseAdmin || supabase

  const path = `${userId}/${filename}`

  const { error } = await client.storage
    .from('meditations')
    .upload(path, audioBuffer, {
      contentType: 'audio/mpeg',
      upsert: true,
    })

  if (error) {
    console.error('Error uploading audio:', error)
    return null
  }

  const { data } = client.storage
    .from('meditations')
    .getPublicUrl(path)

  return data.publicUrl
}
