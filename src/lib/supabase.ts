import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isDemo = !supabaseUrl || !supabaseAnonKey

export const supabase: SupabaseClient = isDemo
  ? (null as unknown as SupabaseClient)
  : createClient(supabaseUrl!, supabaseAnonKey!)
