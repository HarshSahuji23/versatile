import { createClient } from '@supabase/supabase-js'

// Use valid placeholder URLs so the client doesn't throw during Next.js build/prerender.
// At runtime, these will be replaced by the actual env vars from .env.local.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : 'https://placeholder.supabase.co'

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase_project_url') &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
)

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Service = {
  id: string
  title: string
  description: string
  icon: string
  order_index: number
  created_at: string
}

export type GalleryImage = {
  id: string
  image_url: string
  caption: string
  created_at: string
}

export type Testimonial = {
  id: string
  client_name: string
  event_type: string
  review: string
  rating: number
  created_at: string
}

export type Booking = {
  id: string
  name: string
  email: string
  phone: string
  event_type: string
  event_date: string
  message: string
  status: string
  created_at: string
}
