import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/** Generic client only; add schema, queries, and policies during the event. */
export const supabase = url && anonKey ? createClient(url, anonKey) : null
